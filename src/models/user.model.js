
import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({
    
    name:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        minlength:3
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
    password:{
        type:String,
        required:true
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    refreshToken:
    {
        token:String,
        expiresAt:Date
    }
    
},{timestamps:true})





export default mongoose.model('User',UserSchema);