import express from "express";
import { authorizeM} from "../middlewares/auth.middleware.js";
import { onlyUser } from "../middlewares/auth.middleware.role.js";
import { createReview, getReviewofProduct } from "../controllers/review.controller.js";
import { upload } from "../middlewares/upload.middleware.js";



const router = express.Router();

router.post("/:productId",authorizeM,onlyUser,upload.array('media'),createReview);
router.get("/:productId/reviews",authorizeM,onlyUser,getReviewofProduct);


export default router;