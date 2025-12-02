import express from "express";
import { register,login ,refresh} from "../controllers/user.controller.js";
const router = express.Router();


router.post("/register",register);
router.post("/login",login);
router.get("/refresh",refresh);

export default router;