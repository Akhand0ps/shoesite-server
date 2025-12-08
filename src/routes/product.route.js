import express from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { createproduct,updateProduct,deleteProduct,getAllProducts,isPubPrivate, getProductByBrand, getProductByCategory, getOneProduct, searchProduct,searchBar } from "../controllers/product.controller.js";
import { authorizeM} from "../middlewares/auth.middleware.js";
import { onlyAdmin, onlyUser } from "../middlewares/auth.middleware.role.js";

const router = express.Router();
router.get('/find',searchProduct)
router.get('/searchBar',searchBar);

router.post('/create',authorizeM,onlyAdmin,upload.array('media'),createproduct);

router.put('/update/:slug',authorizeM,onlyAdmin,upload.array('media'),updateProduct);

router.delete('/delete/:slug',authorizeM,onlyAdmin,deleteProduct);

router.get('/products',authorizeM,onlyAdmin,getAllProducts);

router.patch('/toggle/:slug',authorizeM,onlyAdmin,isPubPrivate);

router.get('/products/:brand',getProductByBrand)

router.get('/products/category/:category',getProductByCategory);

router.get('/:slug',getOneProduct);


export default router;


