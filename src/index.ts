import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import mainRoutes from './main'

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
app.use('/v1', mainRoutes);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
