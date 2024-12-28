import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import express from "express";
import { verifyUserWithToken } from "../auth/middleware";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const prisma = new PrismaClient();

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { searchTerm, category, location, rating, offset, limit } = req.query;

    const response = await prisma.project.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                name: { contains: searchTerm as string, mode: "insensitive" },
              },
              {
                website: { contains: searchTerm as string, mode: "insensitive" },
              },
            ],
          },
          category ? { category: { equals: category as string } } : {},
          location
            ? { country: { contains: location as string, mode: "insensitive" } }
            : {},
          rating
            ? { avgRating: { gte: parseFloat(rating as string) } }
            : {},
        ],
      },
      skip: parseInt(offset as string) || 0,
      take: parseInt(limit as string) || 10,
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      message: "Companies fetched successfully",
      response,
    });
  } catch (error) {
    console.error("Error getting companies:", error);
    res.status(500).json({ error: "Failed to get companies" });
  }
});

router.get("/review", async (req: Request, res: Response) => {
  try {
    const website = req.query.website as string;
    const rating = parseInt(req.query.rating as string) || null;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 5; // Number of reviews per page
    const offset = (page - 1) * limit;

    if (!website) {
      return res.status(400).json({ error: "Website parameter is required" });
    }

    // Fetch only reviews associated with the specified website
    const responses = await prisma.response.findMany({
      where: {
        project: { website },
        ...(rating !== null && { star: rating }),
      },
      skip: offset,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Format the response to include only the required fields
    const formattedResponses = responses.map((response) => ({
      name: response.user?.name || "Anonymous",
      email: response.user?.email || "N/A",
      content: response.content,
      star: response.star,
      doe: response.doe,
    }));

    res.status(200).json({
      message: "Company reviews fetched successfully",
      responses: formattedResponses,
    });
  } catch (error) {
    console.error("Error getting company reviews:", error);
    res.status(500).json({ error: "Failed to get company reviews" });
  }
});

router.get('/details', async (req: Request, res: Response) => {
  try {
    const website = req.query.website as string;

    if (!website) {
      return res.status(400).json({ error: "Website parameter is required" });
    }

    const company = await prisma.project.findUnique({
      where: { website },
      select: {
        name: true,
        totalReviews: true,
        country: true,
        category: true,
        avgRating: true,
        logoUrl: true,
        projectId: true,
        website: true,
      },
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.status(200).json({
      message: "Company details fetched successfully",
      company,
    });
  } catch (error) {
    console.error("Error fetching company details:", error);
    res.status(500).json({ error: "Failed to fetch company details" });
  }
});

router.post('/create-unclaimed-profile', verifyUserWithToken, async (req :Request, res: Response) => {
  const { website } = req.body;
  
  // Check if the website is provided
  if (!website) {
    return res.status(400).json({ message: "Website is required" });
  }

  try {
    // Check if project already exists
    const existingProject = await prisma.project.findUnique({
      where: { website },
    });

    if (existingProject) {
      return res.status(400).json({ message: "Project already exists for this website" });
    }

    // Create a new unclaimed profile (Project)
    const projectId = uuidv4();
    const newProject = await prisma.project.create({
      data: {
        website,
        projectId,
        avgRating: 0.0,
        totalReviews: 0,
      },
    });

    return res.status(201).json({
      message: 'Unclaimed profile created successfully',
      project: newProject,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

export default router;