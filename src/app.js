import express from "express";
import UserR from "./routes/user.route.js";

const app = express();



app.use("/api/v1/auth",UserR);
export default app;

