import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import { signup, signin, forgetPassword , resetPassword, checkOtp } from "./auth/auth";
import { verifyUserWithToken } from "./auth/middleware";
import {
  postResponse,
  getResponse,
  createProject,
  getProjects,
  updateProjects,
  getProject,
  s3Router,
  getSingleResponse,
} from "./operations/operations";
import { getCompanies, getCompanyReview } from "./operations/publicops";

dotenv.config(); 

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL || '*', // Replace with the specific client URL if known
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow all required methods
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Explicitly list allowed headers
  })
);


app.use(cookieParser());

app.post("/v1/auth/signup", signup);
app.post("/v1/auth/forgotpass", forgetPassword);
app.post("/v1/auth/resetpass", resetPassword);
app.post("/v1/auth/check", checkOtp);
app.post("/v1/auth/signin", signin);

app.use("/v1/verifyuserwithtoken", verifyUserWithToken, (req, res) => {
  res.send("User is verified");
});

app.post("/v1/project", verifyUserWithToken, createProject);
app.get("/v1/project", getProject);
app.put("/v1/project", verifyUserWithToken, updateProjects);

app.get("/v1/projects", verifyUserWithToken, getProjects);

app.post("/v1/responses", postResponse);
app.get("/v1/responses", getResponse);

app.get("/v1/sureefy", getSingleResponse)

app.post('/v1/s3/signed_url', s3Router)

app.get("/v1/companies", getCompanies)
app.get("/v1/company/review", getCompanyReview)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
