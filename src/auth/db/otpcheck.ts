import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

export async function otpCheck(email: string, otp: number): Promise<{ token: string } | boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.otp !== otp) {
      return false; // Return false if user not found or OTP does not match
    }

    const token = jwt.sign({ email }, process.env.SECRET_KEY as string, { expiresIn: "30d" });
    return { token };
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return false;
  }
}
