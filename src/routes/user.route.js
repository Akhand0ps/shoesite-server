import express from "express";
import { register,login ,refresh, Newlogin, logout} from "../controllers/user.controller.js";
const router = express.Router();


router.post("/register",register);
router.post("/login",Newlogin);
router.get("/refresh",refresh);
router.post("/logout",logout)
export default router;