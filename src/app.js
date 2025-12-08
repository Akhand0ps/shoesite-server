import dotenv from "dotenv";
dotenv.config();
import express from "express";
import UserR from "./routes/user.route.js";
import CatR from "./routes/category.route.js"
import ProR from "./routes/product.route.js"
import CartR from "./routes/cart.route.js"

import cookieParser from 'cookie-parser';

const app = express();


app.use(express.json())
app.use(cookieParser());
app.use("/api/v1/auth",UserR);
app.use("/api/v1/cat",CatR);
app.use("/api/v1/product",ProR);
app.use("/api/v1/cart",CartR);
export default app;

