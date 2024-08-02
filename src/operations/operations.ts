import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY as string;

// Endpoint to create a new project
export const createProject = async (req: Request, res: Response) => {
  const { name, description } = req.body;

  try {
    const userId = req.body;
    console.log(userId);
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
      data: { projectId, userId, name, description },
    });

    res
      .status(201)
      .json({ message: "Project created successfully", projectData });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.body;
    console.log(userId);
    const projectIds = await prisma.project.findMany({
      where: {
        userId: userId,
      },
    });

    return projectIds;
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

// Endpoint to create a new response
export const postResponse = async (req: Request, res: Response) => {
  const { projectId, type, content, star } = req.body;

  try {
    const checkProject = await prisma.project.findUnique({
      where: {
        projectId: projectId,
      },
    });
    if (!checkProject) {
      return res.status(403).json({ error: "Invalid project id" });
    }
    const responseData = await prisma.response.create({
      data: { projectId, type, content, star },
    });

    res
      .status(201)
      .json({ message: "Response created successfully", responseData });
  } catch (error) {
    console.error("Error creating response:", error);
    res.status(500).json({ error: "Failed to create response" });
  }
};

// Endpoint to get responses for a project
export const getResponse = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  try {
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const responses = await prisma.response.findMany({
      where: {
        projectId: projectId,
      },
    });

    res.status(200).json({ responses });
  } catch (error) {
    console.error("Error fetching response:", error);
    res.status(500).json({ error: "Failed to fetch response" });
  }
};
