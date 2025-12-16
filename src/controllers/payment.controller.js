import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";
import Order from "../models/orders.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";


export const handleWebhook = async(req,res)=>{


    try{

        //verify webhook sig

        const signature = req.headers['x-razorpay-signature']
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET


        const expectedSignature = crypto
            .createHmac('sha256',webhookSecret)
            .update(JSON.stringify(req.body))
            .digest('hex')
        
        if(signature !== expectedSignature){

            console.log('Invalid webhook signature');
            return res.status(400).json({
                success:false
            })
        }
        //ab event data le lo razorpay bhejaga payload me.

        const event = req.body.event;
        const payload = req.body.payload.paymentLink_link.entity;

        console.log('Webhook event: ',event);

        if(event === 'payment_link.paid'){

            const order = await Order.findOne({
                paymentLinkId:payload.id
            });

            if(!order){
                console.log('Order not foun for payment link: ',payload.id);
                return res.status(404).json({success:false})
            }

            //duplicate check krle.

            if(order.paymentStatus ==='paid'){
                console.log('Order already paid: ',order.orderNumber);
                return res.status(200).json({success:true});
            }


            order.paymentStatus = "paid",
            order.paymentId = payload.payment._id;
            order.paidAt = new Date();
            order.orderStatus = 'processing';

            await order.save();


            for(const item of order.items){

                await Product.updateOne(
                    {"variants.sku":item.sku},
                    {$inc:{"variants.$.stock":-item.quantity}}
                );
            }

            await Cart.updateOne(
                {userId:order.userId},
                {
                    items:[],
                    totalAmount:0,
                    totalItems:0
                }
            );

            console.log('Payment processed successfully: ',order.orderNumber);
            return res.status(200).json({success:true})
        }

        //yaha payment fail handle kr

        if(event ==='payment_link.expired' || event === 'payment.link.cancelled'){
            const order = await Order.findOne({
                paymentLinkId:payload._id
            });

            if(order){
                order.paymentStatus = 'failed';
                order.orderStatus = "cancelled";
                await order.save();
            }

            res.status(200).json({success:false})
        }
        
    }catch(err){

    }
}