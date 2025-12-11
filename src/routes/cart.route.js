
import express from "express";
import { createCart,addItemToCart, viewCart, removeFromCart, newAddItemtoCart, removeOneUnit, clearCart } from "../controllers/cart.controller.js";
import {authorizeM} from "../middlewares/auth.middleware.js"
import {onlyUser} from "../middlewares/auth.middleware.role.js"
const router = express.Router();


// router.post('/create',authorizeM,onlyUser,createCart);
router.patch("/decrease/:sku",authorizeM,onlyUser,removeOneUnit);
router.post('/addItem',authorizeM,onlyUser,newAddItemtoCart);
router.get("/viewcart",authorizeM,onlyUser,viewCart);
router.delete("/remove/:sku",authorizeM,onlyUser,removeFromCart);
router.delete("/clear",authorizeM,onlyUser,clearCart)
export default router;