import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import express from "express";
import dotenv from "dotenv";
import { verifyUserWithToken } from "../auth/middleware";
import bcrypt from "bcryptjs";

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
      select: { userId: true },
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

router.get("/self/data", verifyUserWithToken, async (req: Request, res: Response) => {
  const userId = req.userId;
  //console.log("hi",userId);

  try {
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { name: true, email: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ name: user.name, email: user.email });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/", verifyUserWithToken, async (req: Request, res: Response) => {
  const userId = req.userId; // Assumes `verifyUserWithToken` middleware sets `userId`
  const { name } = req.body; // Extract `name` from the request body

  try {
    // Check if `name` is provided
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Update the user's name
    const user = await prisma.user.update({
      where: { userId: userId }, // Assumes `id` is the primary key for `user`
      data: { name },
      select: { name: true }, // Return the updated name
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ name: user.name }); // Respond with the updated name
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/password", verifyUserWithToken, async (req: Request, res: Response) => {
  const userId = req.userId; // Assumes `verifyUserWithToken` middleware sets `userId`
  const { curr, newPass } = req.body; // Extract current and new passwords from the request body

  try {
    // Fetch the user to compare the current password
    const user = await prisma.user.findUnique({
      where: { userId: userId },
      select: { password: true }, // Assuming `password` is the field storing hashed passwords
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the current password matches
    const isPasswordCorrect = await bcrypt.compare(curr, user.password); // Compare using bcrypt
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Check if the current password and new password are the same
    const isSamePassword = await bcrypt.compare(newPass, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "New password cannot be the same as the current password" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPass, 10);

    // Update the password in the database
    await prisma.user.update({
      where: { userId: userId },
      data: { password: hashedPassword },
    });

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Server error" });
  }
});




export default router;
