import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import express from "express";
import { verifyUserWithToken } from "../auth/middleware";

dotenv.config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY as string;

const router = express.Router();

router.post("/", verifyUserWithToken, async (req: Request, res: Response) => {
  const { projectId, type, content, star } = req.body;
  const userId = req.userId; // Extract userId from the middleware

  // Ensure userId is a valid string
  if (!userId) {
    return res.status(403).json({ error: "User not authenticated" });
  }

  try {
    // Check if the project exists
    const checkProject = await prisma.project.findUnique({
      where: { projectId: projectId },
      select: { totalReviews: true, avgRating: true }, // Retrieve totalReviews and avgRating
    });

    if (!checkProject) {
      return res.status(403).json({ error: "Invalid project id" });
    }

    // Get the IP address from the request headers or another method
    const ip = req.ip; // Or you can extract it from req.connection.remoteAddress, depending on the server configuration

    // Create the new response using the userId from middleware
    const responseData = await prisma.response.create({
      data: {
        userId, // Ensure this is a string and not undefined
        projectId,
        type,
        content,
        star,
        ip, // Add the IP address from the backend
        doe: new Date(), // Set date of experience (when the response was created)
      },
    });

    // Calculate updated totalReviews and avgRating
    const newTotalReviews = (checkProject.totalReviews || 0) + 1;
    const currentTotalRating =
      (checkProject.avgRating || 0) * (checkProject.totalReviews || 0);
    const newAvgRatingRaw = (currentTotalRating + star) / newTotalReviews;

    // Round to nearest 0.5
    const newAvgRating = Math.round(newAvgRatingRaw * 2) / 2;

    // Force it to be either 0.5 or a whole number by checking for trailing ".0"
    const formattedAvgRating = parseFloat(newAvgRating.toFixed(1));

    // Update project with new totalReviews and avgRating
    await prisma.project.update({
      where: { projectId: projectId },
      data: {
        totalReviews: newTotalReviews,
        avgRating: formattedAvgRating,
      },
    });

    // Respond with success
    res
      .status(201)
      .json({ message: "Response created successfully", responseData });
  } catch (error) {
    console.error("Error creating response:", error);
    res.status(500).json({ error: "Failed to create response" });
  }
});

// Endpoint to get responses for a project
router.get("/", async (req: Request, res: Response) => {
  try {
    const projectIdParam = req.query.projectId as string;
    const skip = Number(req.query.skip) || 0; // Default skip is 0
    const take = Number(req.query.take) || 15; // Default take is 15
    const filter = (req.query.filter as string) || "all"; // Default filter is 'all'
    const getStats = req.query.getStats === "true";
    console.log(
      projectIdParam,
      " --- ",
      skip,
      " --- ",
      take,
      " -- ",
      filter,
      " -- ",
      getStats
    );

    // Validate projectId
    if (!projectIdParam || typeof projectIdParam !== "string") {
      return res.status(400).json({ error: "Valid Project ID is required" });
    }

    // Check if skip and take are valid numbers
    if (isNaN(skip) || skip < 0) {
      return res.status(400).json({ error: "Invalid skip parameter" });
    }

    if (isNaN(take) || take <= 0) {
      return res.status(400).json({ error: "Invalid take parameter" });
    }

    // Construct the filter criteria
    const queryConditions: any = {
      projectId: projectIdParam,
    };

    if (filter !== "all") {
      queryConditions.type = filter;
    }

    // Fetch responses from the database and join user table
    const responses = await prisma.response.findMany({
      skip,
      take,
      where: queryConditions,
      include: {
        user: { select: { name: true, email: true } }, // Join with the User table to get name and email
      },
    });

    console.log(responses);

    return res.status(200).json({ responses });
  } catch (error) {
    console.error("Error fetching response:", error);
    return res.status(500).json({ error: "Failed to fetch response" });
  }
});

router.get("/single", async (req: Request, res: Response) => {
  try {
    const responseId = req.query.responseId;
    console.log(responseId);

    if (!responseId) {
      return res.status(400).json({ error: "Valid Response ID is required" });
    }

    const response = await prisma.response.findUnique({
      where: {
        responseId: Number(responseId),
      },
      include: {
        user: { select: { name: true, email: true } }, // Join with the User table to get name and email
      },
    });

    if (!response) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.status(200).json({ response });
  } catch (error) {
    console.error("Error fetching response:", error);
    res.status(500).json({ error: "Failed to fetch response" });
  }
});

export default router;
