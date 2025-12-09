import Order from "../models/orders.model.js";
import Cart from "../models/cart.model.js"

export const order = async(req,res)=>{
    // console.log(req.body.address);
    const address = req.body.address;
    const paymentMethod = req.body;
    if(!address || !paymentMethod) return res.status(400).json({success:false,message:'address and paymentMethod is required'});
    // console.log("Address => ",address);
    // console.log("Paymentmethod => ",paymentMethod);
    console.log("================================");
    try{

        const userId = req.user.id;
        const cart = await Cart.findOne({userId});
        if(!cart) return res.json({success:false,message:'Cart not found'});
        
        const items = cart.items;
        console.log(items);
        console.log("===============================");

        return res.status(200).json({message:"hii"});

    }catch(err){
        console.error('err came in order => ',err.message);
        return res.status(500).json({success:false,message:err.message});
    }
}