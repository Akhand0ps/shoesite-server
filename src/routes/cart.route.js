
import express from "express";
import { createCart,addItemToCart } from "../controllers/cart.controller.js";
import { verifyUser } from "../middlewares/user.middleware.js";
const router = express.Router();


router.post('/create',verifyUser,createCart);
router.post('/addItem',verifyUser,addItemToCart);


