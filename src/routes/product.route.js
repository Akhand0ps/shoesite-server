import express from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { createproduct,updateProduct } from "../controllers/product.controller.js";


const router = express.Router();
router.post('/create',upload.array('media'),createproduct);
router.put('/update/:slug',upload.array('media'),updateProduct);


export default router;


