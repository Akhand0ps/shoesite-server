import express from "express";
import { createcategory,editcategory,deletecategory,getAllCategories } from "../controllers/category.controller.js";
import { authorizeM } from "../middlewares/auth.middleware.js";
import { onlyAdmin } from "../middlewares/auth.middleware.role.js";
const router = express.Router();



router.get("/",authorizeM,getAllCategories)
router.post("/create-cat",authorizeM,onlyAdmin,createcategory);
router.put("/edit/:category",authorizeM,onlyAdmin,editcategory);
router.delete("/delete/:id",authorizeM,onlyAdmin,deletecategory);



export default router;