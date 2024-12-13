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

// Endpoint to create a new project
router.post("/", verifyUserWithToken, async (req: Request, res: Response) => {
  const { logoUrl, name, description, website, category, country } = req.body;
  const userId = req.userId; // Assuming you're setting this in your auth middleware

  console.log( userId)

  if (!userId) {
    return res.status(403).json({ error: "User not authenticated" });
  }

  try {
    const checkUser = await prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });



    if (!checkUser) {
      return res.status(403).json({ error: "Invalid user id" });
    }

    const projectId = uuidv4();
    const projectData = await prisma.project.create({
      data: { projectId, userId, name, description, logoUrl, website, category, country },
    });

    res
      .status(201)
      .json({ message: "Project created successfully", projectData });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string;

    // Ensure the project exists
    const projectDetails = await prisma.project.findUnique({
      where: {
        projectId: projectId,
      },
    });

    if (!projectDetails) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json({ project: projectDetails });
  } catch (error) {
    console.error("Error retireving project:", error);
    res.status(500).json({ error: "Failed to retrieve project" });
  }
});

router.put("/", verifyUserWithToken, async (req: Request, res: Response) => {
  try {
    const { projectId, ...updateData } = req.body; // Destructure projectId and other fields to update
    const userId = req.userId;

    if (!userId) {
      return res.status(403).json({ error: "User not authenticated" });
    }

    // Ensure the project exists
    const existingProject = await prisma.project.findUnique({
      where: {
        projectId: projectId,
      },
    });

    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Update the project with the data sent in the request
    const updatedProject = await prisma.project.update({
      where: {
        projectId: projectId,
      },
      data: updateData, // This updates only the fields that are provided
    });

    res.status(200).json({ project: updatedProject });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.get("/user", verifyUserWithToken, async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(403).json({ error: "User not authenticated" });
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: userId,
      },
    });

    res.status(200).json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.put("/", verifyUserWithToken, async (req: Request, res: Response) => {
  try {
    const { projectId, name, description, category, country, logoUrl } = req.body; // Extract only editable fields
    const userId = req.userId;

    if (!userId) {
      return res.status(403).json({ error: "User not authenticated" });
    }

    // Ensure the project exists
    const existingProject = await prisma.project.findUnique({
      where: {
        projectId: projectId,
      },
    });

    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Prevent updates to non-editable fields
    const updatedProject = await prisma.project.update({
      where: {
        projectId: projectId,
      },
      data: {
        name,
        description,
        category,
        country,
        logoUrl
      },
    });

    res.status(200).json({ project: updatedProject });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});


export default router;