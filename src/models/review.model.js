import mongoose from "mongoose";


const ReviewSchema = new mongoose.Schema({

    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },

    rating:{
        type:Number,
        required:true,
        min:1,
        max:5,
        validate:Number.isInteger
    },
    comment:{
        type:String,
        trim:true,
        maxLength:500
    },
    imageUrl:{
        type:[String],
        validate:{
            validator: v=>v.length <=3,
            message:'Maximum 3 images allowed per review'
        },
        default:[]
    }
},{timestamps:true})

//preven multiple reviews per product.
ReviewSchema.index({productId:1,userId:1},{unique:true});


export default mongoose.model('Review',ReviewSchema);

