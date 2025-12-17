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

const allowedOrigins = ['http://localhost:5173','https://solevia.vercel.app','http://www.localhost:5173',
    'https://solevia.vercel.app']
app.use(cors({
    origin:(origin,callback)=>{

        if(process.env.NODE_ENV==='production' && !origin){
            return callback(null,true)
        }

        if(!orign || allowedOrigins.includes(origin)){
            return callback(null,true)
        }
        return callback(null,false)
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

