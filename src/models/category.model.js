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
        required:true,
        unique:true,
        trim:true
    },

    parent:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        default:null
    }
},{timestamps:true})


CategorySchema.pre('save',function(next){

    if(!this.slug){
        this.slug = slugify(this.name,{lower:true},'-');
    }
    next();
})



export default mongoose.model('Category',CategorySchema);