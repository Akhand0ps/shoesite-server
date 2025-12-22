import express from "express";
import { authorizeM} from "../middlewares/auth.middleware.js";
import { onlyAdmin, onlyUser } from "../middlewares/auth.middleware.role.js";
import { cancelOrder, getAllOrder, getAllOrdersAdmin, getSingleOrder, order, updateStatus } from "../controllers/orders.controller.js";

const router = express.Router();

router.post("/order",authorizeM,onlyUser,order);
router.get("/my",authorizeM,onlyUser,getAllOrder);
router.get("/:ordernumber",authorizeM,getSingleOrder);
router.put("/cancel/:ordernumber",authorizeM,onlyUser,cancelOrder);




router.get("/admin/orders",authorizeM,onlyAdmin,getAllOrdersAdmin);
router.patch("/admin/status/:orderId",authorizeM,onlyAdmin,updateStatus);
router.get("/greet",authorizeM,onlyUser,(req,res)=>{
    res.send("aaag");
})


export default router;