import mongoose from "mongoose";
import slugify from "slugify";



const ProductSchema = new mongoose.Schema({

    title:{
        type:String,
        trim:true,
        required:true,
        index:true,
        minlength:3
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
        required:true,
        index:true

    },
    originalPrice:{
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
                sku:{
                    type:String,
                    unique:true,
                    index:true
                },
                size:{
                    type:Number,
                    enum:[6,7,8,9,10,11],
                    required:true
                },

                stock:{
                    type:Number,
                    required:true,
                    min:0
                },
                price:{
                    type:Number,
                    required:true
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

ProductSchema.index({
    title:"text",
    description:"text",
    brand:"text",
    slug:"text"
})

ProductSchema.pre('save',function(){
    const productNameCode = this.title.substring(0,3).toUpperCase();

    this.variants.forEach(variant=>{
        if(!variant.sku){
            const randomCode = Math.floor(1000+Math.random()*6000);
            variant.sku = `${productNameCode}-${variant.size}-${randomCode}`
        }
    })
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