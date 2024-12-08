import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import express from "express";
import { verifyUserWithToken } from "../auth/middleware";
import createPresignedPost from "../utils/s3";
import getResponseStats from "../utils/getStats";

dotenv.config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY as string;

const router = express.Router();

router.post("/s3/signed_url", async (req: Request, res: Response) => {
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
});

router.get("/stats", verifyUserWithToken, async (req: Request, res: Response) => {
  const { projectId } = req.query;
  try {
    if (!projectId) {
      return res.status(400).json({ error: "Invalid project ID" });
    }
    const responseStats = await getResponseStats(projectId as string);
    res.status(200).json(responseStats);
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
}
);

export default router;
