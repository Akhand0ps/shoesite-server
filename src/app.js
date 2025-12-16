import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors"
import UserR from "./routes/user.route.js";
import CatR from "./routes/category.route.js"
import ProR from "./routes/product.route.js"
import CartR from "./routes/cart.route.js"
import OrdR from "./routes/orders.route.js"
import cookieParser from 'cookie-parser';
import paymentR from "./routes/payment.route.js"

const app = express();

const allowedOrigins = [
    'http://localhost:5173'
]
app.use(cors({
    origin:(origin ,callback)=>{
        if(!origin || allowedOrigins.includes(origin)){
            return callback(null,true)
        }
        return callback(new Error('Not allowed by CORS'))
    },
    credentials:true
}))

app.use(express.json())
app.use(cookieParser());
app.use("/api/v1/auth",UserR);
app.use("/api/v1/admin/cat",CatR);
app.use("/api/v1/product",ProR);
app.use("/api/v1/cart",CartR);
app.use("/api/v1/order",OrdR);
app.use("/api/v1/payment",paymentR);
export default app;

