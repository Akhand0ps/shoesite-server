import express from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { createproduct,updateProduct,deleteProduct,getAllProducts,isPubPrivate, getProductByBrand, getProductByCategory } from "../controllers/product.controller.js";


const router = express.Router();
router.post('/create',upload.array('media'),createproduct);
router.put('/update/:slug',upload.array('media'),updateProduct);
router.delete('/delete/:slug',deleteProduct);
router.get('/products',getAllProducts);
router.patch('/toggle/:slug',isPubPrivate);
router.get('/products/:brand',getProductByBrand)
router.get('/products/category/:category',getProductByCategory);
export default router;


