
import express from "express";
import { createCart,addItemToCart, viewCart, removeFromCart } from "../controllers/cart.controller.js";
import {authorizeM} from "../middlewares/auth.middleware.js"
import {onlyUser} from "../middlewares/auth.middleware.role.js"
const router = express.Router();


// router.post('/create',authorizeM,onlyUser,createCart);
router.post('/addItem',authorizeM,onlyUser,addItemToCart);
router.get("/viewcart",authorizeM,onlyUser,viewCart);
router.delete("/remove/:sku",authorizeM,onlyUser,removeFromCart);

export default router;