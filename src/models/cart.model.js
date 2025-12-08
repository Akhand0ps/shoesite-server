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
                size:{
                    type:Number,
                    required:true,
                    enum:[6,7,8,9,10,11]
                },
                addedAt:{
                    type:Date,
                    default:Date.now()
                }
            }
        ],
    },
    totalAmount:Number,
    totalItems:Number
   
},{timestamps:true})


CartSchema.index({'items.sku':1})

export default mongoose.model('Cart',CartSchema);