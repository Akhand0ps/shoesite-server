import User from "../models/user.model.js";
import jwt from 'jsonwebtoken';


export const verifyUser = async(req,res,next)=>{

    try{
        console.log('came in user middleware')
        const token = req.cookis.token;
        console.log("User token: ",token);
        if(!token){
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET_USER);
        const user = await User.findById(decoded.id);

        if(!user){
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if(user.token !== token){
            return res.status(401).json({
                success:false,
                message:'Token is invalid or revoked'
            });
        }
        req.user = {
            id:user._id,
            email:user.email,
            name:user.name
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