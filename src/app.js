import dotenv from "dotenv";
dotenv.config();
import express from "express";
import UserR from "./routes/user.route.js";
import CatR from "./routes/category.route.js"
import ProR from "./routes/product.route.js"
import AdmR from "./routes/admin.route.js"

import cookieParser from 'cookie-parser';

const app = express();


app.use(express.json())
app.use(cookieParser());
app.use("/api/v1/auth",UserR);
app.use("/api/v1/auth/admin",AdmR);
app.use("/api/v1/cat",CatR);
app.use("/api/v1/product",ProR);
export default app;

