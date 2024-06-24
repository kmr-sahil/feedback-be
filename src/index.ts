import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { signup, signin } from "./auth/auth";
import { verifyUserWithToken } from "./auth/middleware";
import { postResponse, getResponse } from "./operations/operations";

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.post("/v1/auth/signup", signup);
app.post("/v1/auth/signin", signin);

app.use("/v1/verifyuserwithtoken", verifyUserWithToken, (req, res) => {
  res.send("User is verified");
});


app.post("/v1/responses", postResponse);
app.get("/v1/responses", verifyUserWithToken, getResponse);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
