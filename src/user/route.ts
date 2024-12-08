import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import express from 'express'
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const router = express.Router();

// Get user's name based on userId
router.get("/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params; // Extract userId from URL parameter

  try {
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { name: true }, // Only select the name field
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ name: user.name });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get all responses submitted by the user with pagination and ordering by latest submission
router.get("/reviews/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params; // Extract userId from URL parameter
  const { page = 1, limit = 10 } = req.query; // Pagination parameters

  const currentPage = parseInt(page as string);
  const pageSize = parseInt(limit as string);

  try {
    // First, check if the user exists
    const userExists = await prisma.user.findUnique({
      where: { userId },
      select: { userId: true }
    });

    // If user doesn't exist, return a 404 error
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user exists, proceed with fetching reviews
    const responses = await prisma.response.findMany({
      where: {
        userId, // Filter by userId
      },
      orderBy: {
        createdAt: "desc", // Order by the latest responses
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });

    const totalResponses = await prisma.response.count({
      where: { userId }, // Count total responses for this user
    });

    console.log(responses);

    return res.json({
      responses,
      totalPages: Math.ceil(totalResponses / pageSize), // Calculate total pages for pagination
      currentPage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
