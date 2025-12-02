import dotenv from "dotenv";
dotenv.config();

import express from "express";
import UserR from "./routes/user.route.js";

const app = express();


app.use(express.json())
app.use("/api/v1/auth",UserR);
export default app;

