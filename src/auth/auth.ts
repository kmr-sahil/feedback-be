import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { otpSenderMail } from "./db/user-otp";
import { otpCheck } from "./db/otpcheck";

dotenv.config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY as string;

export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { userId, name, email, password: hashedPassword ,otp: 0},
    });

    res.status(201).json({ message: "User created", email: email });
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

    res.status(200).json({ message: "Signin successful", email: email });
  } catch (error) {
    res.status(400).json({ error: "Signin failed" });
  }
};


export const forgetPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = await otpSenderMail(email);
    await prisma.user.update({
      where: { email },
      data: { otp },
    });

    return res.status(200).json({ message: "OTP sent successfully", email });
  } catch (error) {
    console.error("Error during forget password process:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, otp: 0 },
    });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error during password reset process:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const verified = await otpCheck(email, otp);
    if (verified) {
      res.cookie("token", verified.token, { httpOnly: true });
      res.status(200).json({ message: "User authorized", email });
    } else {
      res.status(401).json({ message: "Invalid OTP or email" });
    }
  } catch (error) {
    console.error("Error in /check route:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

