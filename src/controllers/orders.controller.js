import Order from "../models/orders.model.js";
import Cart from "../models/cart.model.js"
import Product from "../models/product.model.js"
import { createCart } from "./cart.controller.js";

export const order = async(req,res)=>{
    // console.log(req.body.address);
    const address = req.body.address;
    const paymentMethod = req.body.paymentMethod;
    if(!address || !paymentMethod) return res.status(400).json({success:false,message:'address and paymentMethod is required'});
    // console.log("Address => ",address);
    // console.log("================================");
    // console.log("Paymentmethod => ",paymentMethod);
    try{

        const userId = req.user.id;
        const cart = await Cart.findOne({userId});
        if(!cart) return res.json({success:false,message:'Cart not found'});

        for(const item of cart.items){
            const product = await Product.findOne({"variants.sku":item.sku});
            if(!product){
                return res.status(404).json({
                    success:false,
                    message:`Product ${item.title} not found`
                })
            }

            const variant = product.variants.find(v=>v.sku === item.sku);

            if(!variant){
                return res.status(404).json({
                    success:false,
                    message:`Variant for ${item.title} not found`
                })
            }

            if(variant.stock < item.quantity){
                return res.status(400).json({
                    success:false,
                    message:`Insufficent stock for ${item.title}. Only ${variant.stock} available, you have ${item.quantity} in cart.`
                })
            }
        }
        
        const subtotalOfCart = cart.totalAmount;
        const items = cart.items;
        const shipCost=40;
        const tax = 18;
        
        const order = new Order({
            userId:req.user.id,
            items:items,
            shippingAddress:address,
            paymentMethod:paymentMethod,
            subtotal:subtotalOfCart,
            shippingCost:shipCost,
            tax:tax,
            totalAmount: shipCost > 0 && tax>0 ? ( ((subtotalOfCart+shipCost) * tax/100) + subtotalOfCart+shipCost):subtotalOfCart
        })
        

        await order.save();

        for(const item of cart.items){
            await Product.updateOne(
                {"variants.sku":item.sku},
                {$inc:{"variants.$.stock": -item.quantity}}
            )
        }


        // Cart.updateOne({userId},{$set:{items:[],totalAmount:0,totalItems:0}})
        cart.items = [];
        cart.totalAmount=0;
        cart.totalItems = 0;
        await cart.save();
        // console.log(order);
        // console.log("===============================");

        return res.status(200).json({message:"order created. Thanks!!",order});

    }catch(err){
        console.error('err came in order => ',err.message);
        return res.status(500).json({success:false,message:err.message});
    }
}
export const getAllOrder = async(req,res)=>{

    const userId = req.user.id;
    // console.log("==============================");
    // console.log("came in getallorder...");
    try{

        const Allorders = await Order.find({userId}).sort({createdAt:-1})
        
        // console.log(Allorders);

        res.status(200).json({success:true,message:'see below',Allorders});
    }catch(err){
        console.error('Error came in getting Allorders of user => ',err.message);
        return res.status(500).json({success:false,message:err.message});
    }
}
export const getSingleOrder = async(req,res)=>{

    // const userId = req.user.id;
    
    try{

        const orderId = req.params.ordernumber;
        if(!orderId) return res.status(400).json({success:false,message:'OrderNumber is required to fetch your order...'});

        const order = await Order.findOne({orderNumber:orderId});
        if(!order)return res.status(404).json({success:false,message:'Order not found 404'});

        return res.status(200).json({success:true,message:'See below',order});
    }catch(err){
        console.error('Error came in getting single order of user => ',err.message);
        return res.status(500).json({success:false,message:err.message});
    }
}

export const cancelOrder = async(req,res)=>{

    try{
        const orderId = req.params.ordernumber;
        const order = await Order.findOne({orderNumber:orderId});
        if(!order)return res.status(404).json({success:false,message:'order not found'});

        if(order.status === 'cancelled') return res.status(409).json({success:false,messaage:'already cancelled by you',order})
        if(order.status ==='shipped') return res.status(403).json({success:false,message:'Sorry Order cannot be cancelled , Its already been shipped'})
        
        for(const item of order.items){

            await Product.updateOne(
                {"variants.sku":item.sku},
                {$inc:{"variants.$.stock":item.quantity}}
            )
        }

        order.status = 'cancelled';
        order.paymentStatus = 'failed'
        await order.save();
        return res.status(200).json({success:true,message:'Order cancelled. Thanks'})
    }catch(err){

        console.error('Error came in cancelling order => ',err.messaage);
        return res.status(500).json({success:false,message:err.messaage});
    }
}
export const updateStatus = async(req,res)=>{

    // console.log("=====");
    const orderId = req.params.orderId
    try{

        const orderStatus = req.body.orderStatus;
        // console.log("orderstatus: ",orderStatus);

        const order = await Order.findOne({orderNumber:orderId});
        if(!order) return res.status(404).json({success:false,message:'Order not found'});

        if(order.status === orderStatus) return res.status(409).json({success:false,message:'status is same as you are willing to change.'})

        order.status = orderStatus;
        await order.save();

        return res.status(200).json({success:false,message:'Status successsfully set',order});

    }catch(err){
        console.error('Error came in updating status => ',err.messaage);
        return res.status(500).json({success:false,message:err.messaage});
    }
}

export const getAllOrdersAdmin = async(req,res)=>{

    try{

        const Allorders = await Order.find({})
            .populate('userId','name email')
            .sort({createdAt:-1});
        
        res.status(200).json({
            success:true,
            message:'All order from all users',
            totalOrders: Allorders.length,
            Allorders
        });
    }catch(err){
        console.error('Error in getting all orders (admin) => ', err.message);
        return res.status(500).json({success:false, message:err.message});
    }
}
