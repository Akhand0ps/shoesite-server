import jwt from "jsonwebtoken";

export const authorizeM = async(req,res,next)=>{

    const token = req.cookies.token;
    // console.log("token: ",token)
    if(!token) return res.status(400).json({success:false,meesage:'TOKEN NOT FOUND'});

    try{
        
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
            req.user={
                id:decoded.id,
                role:decoded.role
            };
            next();

    }catch(err){
        return res.status(401).json({ message:"Invalid token" });
    }
}