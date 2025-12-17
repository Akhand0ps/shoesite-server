import jwt from "jsonwebtoken";

export const authorizeM = async(req,res,next)=>{

    // Check for both tokens - adminToken first (admins can access everything), then userToken
    const token = req.cookies.adminToken || req.cookies.userToken;

    // console.log("token: ",token);
    if(!token) return res.status(400).json({success:false,meesage:'TOKEN NOT FOUND'});

    try{
        
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        // console.log(decoded);
            req.user={
                id:decoded.id,
                role:decoded.role,
            };
            next();

    }catch(err){
        return res.status(401).json({ message:"Invalid token" });
    }
}