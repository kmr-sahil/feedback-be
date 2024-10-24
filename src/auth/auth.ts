import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { otpSenderMail } from "./db/user-otp";
import { otpCheck } from "./db/otpcheck";

dotenv.config();

const prisma = new PrismaClient();

export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  console.log(`Signup attempt for email: ${email}`);

  try {
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const otp = await otpSenderMail(email); // Send OTP via email

    await prisma.user.create({
      data: { userId, name, email, password: hashedPassword, otp: Number(otp) }, // Store the OTP
    });

    console.log(`User created with email: ${email}, OTP sent`);
    res.status(201).json({ message: "User created, OTP sent", email });
  } catch (error) {
    console.error("User creation failed", error);
    res.status(400).json({ error: "User creation failed" });
  }
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(`Signin attempt for email: ${email}`);

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log("Invalid email during signin");
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Invalid password during signin");
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const otp = await otpSenderMail(email); // Send OTP on successful signin

    await prisma.user.update({
      where: { email },
      data: { otp: Number(otp) }, // Update OTP in the database
    });

    console.log(`Signin successful for email: ${email}, OTP sent`);
    res.status(200).json({ message: "Signin successful, OTP sent", email });
  } catch (error) {
    console.error("Signin failed", error);
    res.status(400).json({ error: "Signin failed" });
  }
};

export const forgetPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  console.log(`Forget password attempt for email: ${email}`);

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log("User not found during forget password");
      return res.status(404).json({ message: "User not found" });
    }

    const otp = await otpSenderMail(email); // Send OTP

    await prisma.user.update({
      where: { email },
      data: { otp: Number(otp) },
    });

    console.log(`OTP sent to email: ${email}`);
    return res.status(200).json({ message: "OTP sent successfully", email });
  } catch (error) {
    console.error("Error during forget password process:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  console.log(`Password reset attempt for email: ${email}`);

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log("User not found during password reset");
      return res.status(404).json({ message: "User not found" });
    }

    console.log(user.otp , " -- ", otp)

    if (user.otp != otp) {
      console.log("Invalid OTP during password reset");
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, otp: Number(otp) },
    });

    console.log(`Password updated for email: ${email}`);
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error during password reset process:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  console.log(`OTP check for email: ${email}`);

  if (!email || !otp) {
    console.log("Email or OTP missing during OTP check");
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const verified = await otpCheck(email, otp);
    if (verified) {
      console.log(`OTP verified for email: ${email}`);
      res.cookie("token", verified.token, { httpOnly: true });
      res.status(200).json({ message: "User authorized", email });
    } else {
      console.log("Invalid OTP during OTP check");
      res.status(401).json({ message: "Invalid OTP or email" });
    }
  } catch (error) {
    console.error("Error during OTP check process:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
