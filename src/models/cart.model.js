import mongoose from "mongoose";



const CartSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },
    items:{
        type:[
             {
                productId:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:"Product",
                    required:true
                },
                image:{
                    type:String,
                    required:true
                },
                sku:{
                    type:String,
                    required:true,
                },
                title:{
                    type:String,
                    required:true
                },
                quantity:{
                    type:Number,
                    required:true,
                    min:1,
                },
                price:{
                    type:Number,
                    required:true,
                    min:0
                },
                size:Number,

                
            }
        ],
        validate:v=>Array.isArray(v)
    },
   
},{timestamps:true})


export default mongoose.model('Cart',CartSchema);