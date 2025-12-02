import mongoose from "mongoose";



const ProductSchema = new mongoose.Schema({

    title:{
        type:String,
        trim:true,
        required:true,
        index:true,
        minlength:1
    },
    description:{

        type:String,
        trim:true,
        required:true,
        minlength:10
    },
    imageUrl:[
        {
            type:String,
            required:true,
            validate: v=> v.length>0
        }
    ],
    slug:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",

    },
    originalPrice:{
        type:mongoose.Schema.Types.Decimal128,
        required:true,
        min:0
    },
    finalPrice:{
        type:mongoose.Schema.Types.Decimal128,
        required:true,
        min:0
    },
    sizes:{
        type:[Number],
        enum:[6,7,8,9,10,11],
        required:true
    },
    quantity:{
        type:Number,
        required:true,
        min:1
    }
    
},{timestamps:true})


export default mongoose.model('Product',ProductSchema);