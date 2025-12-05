import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js"

export const verifyAdmin = async(req,res,next)=>{

    try{
        const token = req.cookies.token;
        console.log("token:",token);

        if(!token){
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);

        if(!admin){
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        if(admin.token !==token){
            return res.status(401).json({
                success: false,
                message: 'Token is invalid or revoked'
            });
        }

        req.admin ={
            id:admin._id,
            email:admin.email,
            name:admin.name
        }
        next();
    }catch(err){

        if(err.name === 'TokenExpiredError'){
            return res.status(401).json({

                success:false,
                message:'TOKEN EXPIRED'
            });
        }
        return res.status(401).json({
            success:false,
            message:'Invalid token'
        })
    }
}

    

   