import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import express from "express";
import { verifyUserWithToken } from "../auth/middleware";
import { otpSenderMail } from "../auth/db/user-otp";

dotenv.config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY as string;

const router = express.Router();

// Route to generate OTP
router.post("/getOtp", async (req: Request, res: Response) => {
    const { email, name } = req.body;

    try {
        // Check if email exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        let otp: number;
        if (existingUser) {
            // If user exists, send OTP
            otp = await otpSenderMail(email);
            await prisma.user.update({
                where: { email }, // Identify the user by email
                data: { otp: Number(otp) }, // Update only the OTP field
            });
        } else {
            // If new user, insert into DB with isVerified false and send OTP
            otp = await otpSenderMail(email);

            const newUser = await prisma.user.create({
                data: {
                    userId: uuidv4(),
                    email,
                    name,
                    otp: Number(otp),
                    isVerified: false,
                },
            });

            return res.status(201).json({
                message: "OTP sent to new user",
                userId: newUser.userId, // Send userId in the response
            });
        }

        return res.status(200).json({
            message: "OTP sent to existing user",
            userId: existingUser.userId, // Send userId in the response
        });
    } catch (error:any) {
        console.error("Error in getOtp:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
});

// Route to verify OTP
router.post("/verifyOtp", async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    try {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log("1 - ",email, " ", otp, " ",user.otp );

        // Check if OTP matches
        if (user.otp != otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }



        // Update isVerified to true
        const updatedUser = await prisma.user.update({
            where: { email },
            data: { isVerified: true },
        });

        return res.status(200).json({
            message: "OTP verified successfully",
            userId: updatedUser.userId, // Send userId in the response
        });
    } catch (error:any) {
        console.error("Error in verifyOtp:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
});

export default router;
