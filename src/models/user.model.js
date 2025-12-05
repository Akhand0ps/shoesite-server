
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
    cart:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Cart'
    },
    orders:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Orders'
        }
    ],
    refreshToken:
    {
        token:String,
        expiresAt:Date
    },
    addresses:[
        {
            lable:{
                type:String,
                default:null
            },
            line1:{
                type:String,
                required:true
            },
            city:{
                type:String,
                required:true
            },
            zip:{
                type:String,
                required:true,
                minlength:6
            }

        }
    ]
    
},{timestamps:true})





export default mongoose.model('User',UserSchema);