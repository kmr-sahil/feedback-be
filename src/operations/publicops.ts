import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

export const getCompanies =  async (req: Request, res: Response) => {
    try {

        const response = await prisma.project.findMany()
        console.log(response)

        res
        .status(200)
        .json({ message: "Companies fetched Successfully", response });
        
    } catch (error) {
        console.error("Error getting compaies:", error);
    res.status(500).json({ error: "Failed to get companies" });
    }
}

export const getCompanyReview =  async (req: Request, res: Response) => {
    try {

        const website = req.query.website as string;

        const response = await prisma.project.findMany({
            where: {
                website: website
            },
            include: {
                responses: true // Include all related responses for the project
            }
        });
        
        console.log(response)

        res
        .status(200)
        .json({ message: "Company review fetched Successfully", response });
        
    } catch (error) {
        console.error("Error getting company review:", error);
    res.status(500).json({ error: "Failed to get company review" });
    }
}

