import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const { searchTerm, category, location, rating, offset, limit } = req.query;

    const response = await prisma.project.findMany({
      where: {
        name: { contains: searchTerm as string, mode: 'insensitive' },
        category: category ? { equals: category as string } : undefined,
        country: location ? { contains: location as string, mode: 'insensitive' } : undefined,
        avgRating: rating ? { gte: parseFloat(rating as string) } : undefined,
      },
      skip: parseInt(offset as string) || 0,
      take: parseInt(limit as string) || 10,
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      message: "Companies fetched successfully",
      response,
    });
  } catch (error) {
    console.error("Error getting companies:", error);
    res.status(500).json({ error: "Failed to get companies" });
  }
};


export const getCompanyReview = async (req: Request, res: Response) => {
    try {
      const website = req.query.website as string;
      const rating = parseInt(req.query.rating as string) || null;
      const page = parseInt(req.query.page as string) || 1;
      const limit = 5; // Number of reviews per page
      const offset = (page - 1) * limit;
  
      const response = await prisma.project.findMany({
        where: { website },
        include: {
          responses: {
            where: rating ? { star: rating } : undefined,
            skip: offset,
            take: limit,
          },
        },
      });
  
      res.status(200).json({ message: "Company review fetched successfully", response });
    } catch (error) {
      console.error("Error getting company review:", error);
      res.status(500).json({ error: "Failed to get company review" });
    }
  };
  

