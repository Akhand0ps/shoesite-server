import express from "express";
import { register,login ,refresh, Newlogin} from "../controllers/user.controller.js";
const router = express.Router();


router.post("/register",register);
router.post("/login",Newlogin);
router.get("/refresh",refresh);

export default router;