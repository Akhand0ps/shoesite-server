import mongoose from "mongoose";


const AdminSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true,
        trim:true,
        minLength:3
    },
    password:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    token:{
        type:String,
    },
    role:{
        type:String,
        defualt:"admin"
    },
    
},{timestamps:true})




export default mongoose.model('Admin',AdminSchema)