import express from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { createproduct,updateProduct,deleteProduct,getAllProducts,isPubPrivate, getProductByBrand, getProductByCategory, getOneProduct, searchProduct,searchBar } from "../controllers/product.controller.js";
import { verifyAdmin } from "../middlewares/auth.middleware.js";
import {verifyUser} from "../middlewares/user.middleware.js"
import { verifyAdminOrUser } from "../middlewares/useradmin.middleware.js";

const router = express.Router();
router.get('/find',searchProduct)
router.get('/searchBar',verifyUser,searchBar);

router.post('/create',verifyAdmin,upload.array('media'),createproduct);

router.put('/update/:slug',verifyAdmin,upload.array('media'),updateProduct);

router.delete('/delete/:slug',verifyAdmin,deleteProduct);

router.get('/products',verifyAdminOrUser,getAllProducts);

router.patch('/toggle/:slug',verifyAdmin,isPubPrivate);

router.get('/products/:brand',getProductByBrand)

router.get('/products/category/:category',getProductByCategory);

router.get('/:slug',verifyAdmin,getOneProduct);


export default router;


