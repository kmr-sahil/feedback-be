import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY as string;

export const postResponse = async (req: Request, res: Response) => {
  const { userId, type, content, star } = req.body;

  try {
    const checkUser = await prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });
    if (!checkUser) {
      res.status(403).json({ error: "Invalid user id" });
    }
    const responseData = await prisma.response.create({
      data: { userId, type, content, star },
    });
    const addResponsetoUserTable = await prisma.user.update({
      where: {
        userId: userId,
      },
      data: {
        responses: {
          // Append the newly created response to the existing responses array
          // Use 'connect' to establish a relationship between user and response
          connect: { responseId: responseData.responseId },
        },
      },
    });

    res
      .status(201)
      .json({ message: "Response created successfully", responseData });
  } catch (error) {
    console.error("Error creating response:", error);
    res.status(500).json({ error: "Failed to create response" });
  }
};

export const getResponse = async (req: Request & { userId?: number }, res: Response) => {
  const userId = req.userId;
  console.log(userId)
  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const responses = await prisma.response.findMany({
      where: {
        userId: userId,
      },
    });

    res.status(200).json({ responses });
  } catch (error) {
    console.error("Error fetching response:", error);
    res.status(500).json({ error: "Failed to fetch response" });
  }
};
