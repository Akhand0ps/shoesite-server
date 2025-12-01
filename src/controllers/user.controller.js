import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";

export const register = async(req,res)=>{

   

    // if(!req.body) throw new Error('Empty fields');

    try{

        const {name,email,password} = req.body;
        console.log(name);
        
        const check = await User.findOne({email});
        if(check){
            return res.status(409).json({
                success:false,
                message:"User already exist"
            })
        }

        const hashPass = bcrypt.hash(password,process.env.SALT);
        console.log(hashPass)

        await User.create({
            name,
            email,
            password:hashPass

        })



        return res.status(201).json({
            success:true,
            message:"User created successfully",
            data:{
                name,
                email
            }
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"INTERNAL SERVER ERROR"
        })
    }

}


export const login = async(req,res)=>{

    try{

        const {email,password} = req.body;

        const user = await User.findOne({email})

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found!!"
            })
        }

        if(!bcrypt.compare(password,user.password)){
            return res.status(401).json({
                success:false,
                message:"Invalid credentials"
            })
        }

        const accessToken = jwt.sign({email},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'30m'});
        const refreshToken = jwt.sign({email},process.env.REFRESH_TOKEN_SECRET,{expiresIn:'1d'});

        res.cookie('jwt',refreshToken,{
          httpOnly:true,
          sameSite:'None',secure:true,
          maxAge:24*60*60*1000
        });

        return res.status(200).json({
            
            success:true,
            accessToken,
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}