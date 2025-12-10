import express from "express";
import { authorizeM} from "../middlewares/auth.middleware.js";
import { onlyAdmin, onlyUser } from "../middlewares/auth.middleware.role.js";
import { getAllOrder, getSingleOrder, order } from "../controllers/orders.controller.js";

const router = express.Router();

router.post("/order",authorizeM,onlyUser,order);
router.get("/myorders",authorizeM,onlyUser,getAllOrder);
router.get("/:ordernumber",authorizeM,onlyUser,getSingleOrder);

router.get("/greet",authorizeM,onlyUser,(req,res)=>{
    res.send("aaag");
})


export default router;