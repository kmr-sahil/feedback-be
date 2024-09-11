import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import createPresignedPost from "../utils/s3";

dotenv.config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY as string;

// Endpoint to create a new project
export const createProject = async (req: Request, res: Response) => {
  const { logoUrl, name, description } = req.body;
  const userId = req.userId; // Assuming you're setting this in your auth middleware

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
      data: { projectId, userId, name, description, logoUrl },
    });

    res
      .status(201)
      .json({ message: "Project created successfully", projectData });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
};

export const getProject = async (req: Request, res: Response) => {
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
};

export const updateProjects = async (req: Request, res: Response) => {
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
};

export const getProjects = async (req: Request, res: Response) => {
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
};

// Endpoint to create a new response
export const postResponse = async (req: Request, res: Response) => {
  const { name, email, projectId, type, content, star } = req.body;

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
      data: { name, email, projectId, type, content, star },
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
  const projectIdParam = req.query.projectId;
  //console.log(projectIdParam);

  try {
    if (!projectIdParam || typeof projectIdParam !== "string") {
      return res.status(400).json({ error: "Valid Project ID is required" });
    }

    const projectId = projectIdParam;

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

export const s3Router = async (req: Request, res: Response) => {
  try {
    let { content_type } = req.body;
    const key = uuidv4();
    const data = await createPresignedPost({ key, contentType: content_type });

    return res.send({
      status: "success",
      data,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).send({
      status: "error",
      message: err.message,
    });
  }
};
