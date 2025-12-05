import Admin from '../models/admin.model.js'
import jwt from "jsonwebtoken";
import hashPass from '../utils/Hash.js';
import bcrypt from 'bcrypt';


export const register = async(req,res)=>{

    const {name,email,password }= req.body;
    if(!name || !email || !password ) return res.status(400).json({
        success:false,
        message:"Empty fields"
    })

    try{
        const check = await Admin.findOne({email})
        if(check)return res.status(409).json({success:false,message:'Admin already exist'});

        const hashedPass = await hashPass(password);
        const user = new Admin({name:name,email:email,password:hashedPass})
        await user.save();
        return res.status(201).json({
            success:false,
            message:'Admin/editor created successfully',
            user
        })
    }catch(err){
        console.error('error came in register admin',err.message);
        return res.status
    }
}

export const login = async(req,res)=>{

    const {email,password} = req.body;
    if(!email || !password) return res.status(400).json({
        success:false,
        message:"Empty fields"
    })
    try{

        const user = await Admin.findOne({email})
        if(!user)return res.status(409).json({success:false,message:'Admin/editor does not exist'});
        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch) return res.status(401).json({
            success:false,
            message:'INVALID CREDENTIALS'
        })

        const token = jwt.sign({id:user._id,email:user.email},process.env.JWT_SECRET,{expiresIn:"1h"});

        user.token = token;
        res.cookie ('token',token,{
            httpOnly:true,
            sameSite:'None',secure:true,
            maxAge:60*60*1000
        })
        user.save();
        return res.status(200).json({success:true,message:'Logged in successfully'})
    }catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}


export const logout = async(req,res)=>{

    try{
        const adminId = req.admin.id;

        await Admin.findByIdAndDelete(adminId,{token:null});

        res.clearCookie('token',{
            httpOnly:true,
            sameSite:'None',
            secure:true
        });

        return res.status(200).json({
            success:true,
            message:'logged out successfully'
        })
    }catch(err){
        console.error('Error in admin logout:', err.message);
        return res.status(500).json({
            success: false,
            message: 'INTERNAL SERVER ERROR'
        })
    }
}