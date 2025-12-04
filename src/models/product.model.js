import mongoose from "mongoose";
import slugify from "slugify";



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
    brand:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
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
        unique:true,
        trim:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true

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
    isPublic:{
        type:Boolean,
        default:true
    },
    variants:{
        type:[
            {
                size:{
                    type:Number,
                    enum:[6,7,8,9,10,11],
                    required:true
                },

                stock:{
                    type:Number,
                    required:true,
                    min:0
                }
            }
        ],

        validate: v=> v.length>0
    }
    
},{timestamps:true})



ProductSchema.pre('save',function(){
    if(!this.title) throw new Error('Title is required to generate the slug');
    if(!this.slug || this.isModified('title')){
        this.slug = slugify(this.title,{lower:true})
    }
})


export default mongoose.model('Product',ProductSchema);
    

/* 
{
  "variants": [
    { "size": 6, "stock": 5 },
    { "size": 7, "stock": 2 },
    { "size": 8, "stock": 0 }
  ]
} */