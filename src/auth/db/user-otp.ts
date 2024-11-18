import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../.env") });

const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net", // Hardcoded host
  port: 587, // Ensure port is correct
  secure: false, // Port 587 uses TLS
  auth: {
    user: "hq@getjobs.today", // Hardcoded email
    pass: "MegaKnight&300", // Hardcoded password
  },
});

const generateOTP = (): any => {
  const otp = otpGenerator.generate(6,{
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  console.log("Generated OTP:", otp); // Logging the generated OTP
  return otp;
};

export const otpSenderMail = async (email: string) => {
  const otp = generateOTP();
  console.log("Sending OTP to:", email); // Logging the email recipient

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject: "OTP from feedback space",
    text: `Your OTP is: ${otp}`,
  };

  try {
    console.log("Attempting to send email..."); // Log before sending the email
    console.log("SMTP Host:", process.env.SMTP_HOST);
console.log("SMTP Port:", process.env.SMTP_PORT);

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully"); // Log success
    return otp;
  } catch (error) {
    console.error("Error sending email:", error); // Log any error encountered during sending
    throw new Error("Error sending OTP via email");
  }
};
