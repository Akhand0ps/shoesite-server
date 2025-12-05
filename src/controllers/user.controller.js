import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import hashPass from "../utils/Hash.js";
import jwt from "jsonwebtoken";

export const register = async(req,res)=>{

   

    // if(!req.body) throw new Error('Empty fields');
    console.log("=========")
    // console.log(req.body);

    

    try{

        const {name,email,password} = req.body;


        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields required" });
        }
        // console.log(name);
        
        const check = await User.findOne({email});
        // console.log(check);

        if(check){
            return res.status(409).json({
                success:false,
                message:"User already exist"
            })
            
        }
        console.log("----------")
       let hashPassword = await hashPass(password);

    //    console.log("hashedPass: ",hashPassword);


        await User.create({
            name,
            email,
            password:hashPassword
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

        console.error(err.message);
        return res.status(500).json({
            success:false,
            message:"INTERNAL SERVER ERROR"
        })


    }

}


export const login = async(req,res)=>{
    try{
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:'all field are required...'
            })
        }
        
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found!!"
            })
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if(!isMatch){
            return res.status(401).json({
                success:false,
                message:"Invalid credentials"
            })
        }

        const accessToken = jwt.sign({email},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'30m'});
        const refreshToken = jwt.sign({email},process.env.REFRESH_TOKEN_SECRET,{expiresIn:'1d'});

        user.refreshToken = {
            token:refreshToken,
            expiresAt: new Date(Date.now() + 24*60*60*1000)
        }
        await user.save()


        console.log("refreshtk: " ,user.refreshToken.token);

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

export const refresh = async(req,res)=>{

    if(!req.cookies.jwt){
        return res.status(406).json({
            success:false,
            message:'Unauthorized'
        })
    }

    try{

        const refreshToken = req.cookies.jwt;
        const user = User.findOne({refreshToken}).email;
        console.log(user)
        
        
        jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,(err,decoded)=>{
            if(err){
                return res.status(409).json({
                    success:false,
                    message:'Unauthorized'
                })
            }
            const accessToken = jwt.sign({user},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"30m"})

            
            return res.status(200).json({
                accessToken
            }) 
        })

    }catch(err){

        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}
