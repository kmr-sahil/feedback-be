import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY as string;

export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { userId: userId, name, email, password: hashedPassword },
    });

    const token = jwt.sign({ userId: user.userId }, SECRET_KEY, {
      expiresIn: "24h",
    });
    res.cookie("token", token, { httpOnly: true });
    res.status(201).json({ message: "User created", token });
  } catch (error) {
    res.status(400).json({ error: "User creation failed" });
  }
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.userId }, SECRET_KEY);
    res.cookie("token", token, { httpOnly: true });
    res.status(200).json({ message: "Signin successful", token });
  } catch (error) {
    res.status(400).json({ error: "Signin failed" });
  }
};
