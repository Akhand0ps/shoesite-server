import mongoose from "mongoose";
import slugify from "slugify";


const CategorySchema = new mongoose.Schema({

    name:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },

    slug:{
        type:String,
        unique:true,
        trim:true
    },

    parent:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        default:null
    }
},{timestamps:true})


CategorySchema.pre('save',function(){

    if(!this.name) return next(new Error('Name is required'));

    if(!this.slug || this.isModified('name')){
        this.slug = slugify(this.name,{lower:true});
    }
})



export default mongoose.model('Category',CategorySchema);