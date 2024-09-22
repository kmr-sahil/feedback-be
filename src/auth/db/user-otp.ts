import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../.env") });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT), // Ensure port is a number
  secure: process.env.SMTP_PORT === "465", // Compare as string
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const generateOTP = (): string => {
  return otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
};

export const otpSenderMail = async (email: string): Promise<string> => {
  const otp = generateOTP();

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject: "OTP from feedback space",
    text: `Your OTP is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return otp;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending OTP via email");
  }
};
