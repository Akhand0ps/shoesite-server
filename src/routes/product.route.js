import express from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { createproduct } from "../controllers/product.controller.js";


const router = express.Router();
router.post('/create',upload.array('media'),createproduct);



export default router;


