import Product from "../models/product.model.js";
import Review from "../models/review.model.js"
import Order from "../models/orders.model.js"
import mongoose from "mongoose";
import { success } from "zod";

export const createReview = async(req,res)=>{

    const userId = req.user.id;
    const productId = req.params.productId;
    
    const rating = req.body.rating;
    const comment = req.body.comment;
    if(!productId)return res.status(400).json({success:false,message:'Product Id is required'});
    if(!rating)return res.status(400).json({success:false,message:'rating is required'});

    try{

        const product = await Product.findById(productId);
        if(!product)return res.status(404).json({success:false,message:'Product does not exist'});
        const isPurchased = await Order.findOne({
            userId,
            items:{
                $elemMatch:{
                    productId:productId,
                }
            },  
        });
        // console.log(isPurchased);
        if(!isPurchased || isPurchased.paymentStatus !=='paid')return res.status(400).json({success:false,message:'Please Purchase the product then give review'});

        



        const imageUrl = req.files? req.files.map(file=>file.path):[]
        const review = new Review({
            productId:productId,
            userId:userId,
            rating:rating,
            comment:comment,
            imageUrl:imageUrl
        })

        await review.save();

        const result = await Review.aggregate([

            {
                $match:{
                    productId: new mongoose.Types.ObjectId(productId)
                }
            },
            {
                $group:{
                    _id:"$productId",
                    avgRating:{$avg:"$rating"},
                    totalReviews:{$sum:1}
                }
            }
        ])


        const avgRating = result.length > 0 ? result[0].avgRating : 0
        const totalReviews = result.length > 0 ? result[0].totalReviews: 0

        await Product.updateOne(
            {_id:productId},
            {$set:{averageRating:avgRating,reviewCount:totalReviews}}
        )
        await product.save();
        // console.log("================");
        // console.log(product);
        // console.log("=================");
        // console.log(result);

        return res.status(201).json({success:true,message:'Review given..',review});

    }catch(err){
        // console.error('Errror came in createReview => ',err.message);
        if(err.code ===11000){
            return res.status(409).json({
                success:false,
                mesaage:'Review already exist'
            })
        }

        return res.status(500).json({success:false,message:err.message});
    }
    
}

export const getReviewofProduct = async(req,res)=>{

    const productId = req.params.productId;
    // console.log("pid", productId);
    if(!productId)return res.status(400).json({success:false,message:'Product Id is required'});
    try{

        const product = await Product.findById(productId);
        if(!product)return res.status(404).json({success:false,message:'Product does not exist'});

        const reviews = await Review.find({productId}).sort({createdAt:-1});
        // console.log(typeof reviews);
        if(!product)return res.status(404).json({success:false,message:'No reviews yet'});

        // console.log(reviews);

        return res.status(200).json({
            success:true,
            message:'Here are reviews',
            reviews
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:err.mesaage
        })
    }

}