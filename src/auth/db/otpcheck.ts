import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

export async function otpCheck(email: string, otp: number) {
  console.log("OTP check initiated for email:", email); // Log the email
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("User not found for email:", email); // Log when user is not found
      return null;
    }

    if (user.otp != otp) {
      console.log(
        "OTP does not match for email:",
        email,
        "Provided OTP:",
        otp,
        "Stored OTP:",
        user.otp
      ); // Log OTP mismatch
      return null;
    }

    console.log("OTP matched for email:", email, " -- ", user.userId); // Log when OTP matches
    const token = jwt.sign(
      { userId: user.userId },
      process.env.SECRET_KEY as string,
      { expiresIn: "30d" }
    );
    console.log("JWT generated for email:", email); // Log token generation

    return { token, userId: user.userId, email: user.email, name: user.name }; // Return token and userId
  } catch (error) {
    console.error(
      "Error during OTP verification for email:",
      email,
      "Error:",
      error
    ); // Log error during verification
    return null;
  }
}
