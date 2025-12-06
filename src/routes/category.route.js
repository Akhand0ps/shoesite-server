import express from "express";
import { createcategory,editcategory,deletecategory,getAllCategories } from "../controllers/category.controller.js";
const router = express.Router();
import { verifyUser } from "../middlewares/user.middleware.js";

router.get("/",getAllCategories)
router.post("/create-cat",createcategory);
router.put("/edit/:category",editcategory);
router.delete("/delete/:id",deletecategory);



export default router;