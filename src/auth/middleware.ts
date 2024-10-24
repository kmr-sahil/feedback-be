import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY as string;

export const verifyUserWithToken = (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  //console.log("All cookies:", req.cookies);
  console.log(token);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };
    req.userId = decoded.userId;
    console.log(decoded.userId, " -- ")
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
