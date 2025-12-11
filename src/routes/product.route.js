import express from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { createproduct,updateProduct,deleteProduct,getAllProducts,isPubPrivate, getProductByBrand, getProductByCategory, getOneProduct, searchProduct,searchBar, changeStock } from "../controllers/product.controller.js";
import { authorizeM} from "../middlewares/auth.middleware.js";
import { onlyAdmin, onlyUser } from "../middlewares/auth.middleware.role.js";

const router = express.Router();
router.get('/find',searchProduct)
router.get('/searchBar',searchBar);




router.post('/admin/create',authorizeM,onlyAdmin,upload.array('media'),createproduct);

router.put('/admin/update/:slug',authorizeM,onlyAdmin,upload.array('media'),updateProduct);

router.delete('/admin/delete/:slug',authorizeM,onlyAdmin,deleteProduct);

router.get('/products',authorizeM,getAllProducts);

router.patch('/admin/toggle/:slug',authorizeM,onlyAdmin,isPubPrivate);

router.get('/products/:brand',authorizeM,getProductByBrand)

router.get('/products/category/:category',authorizeM,getProductByCategory);

router.get('/:slug',authorizeM,getOneProduct);
router.patch("/admin/products/:productId/stock",authorizeM,onlyAdmin,changeStock);

export default router;


