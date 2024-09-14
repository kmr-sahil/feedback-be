import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import { signup, signin } from "./auth/auth";
import { verifyUserWithToken } from "./auth/middleware";
import {
  postResponse,
  getResponse,
  createProject,
  getProjects,
  updateProjects,
  getProject,
  s3Router,
} from "./operations/operations";

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use(cookieParser());

app.post("/v1/auth/signup", signup);
app.post("/v1/auth/signin", signin);

app.use("/v1/verifyuserwithtoken", verifyUserWithToken, (req, res) => {
  res.send("User is verified");
});

app.post("/v1/project", verifyUserWithToken, createProject);
app.get("/v1/project", getProject);
app.put("/v1/project", verifyUserWithToken, updateProjects);

app.get("/v1/projects", verifyUserWithToken, getProjects);

app.post("/v1/responses", postResponse);
app.get("/v1/responses", verifyUserWithToken, getResponse);

app.post('/v1/s3/signed_url', s3Router)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
