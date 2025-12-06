


export const verifyAdminOrUser = async(req,res)=>{

    try{
        const token = req.cookies.Admintoken || req.cookies.Usertoken;
        console.log('token: ',token);

        if(!token) return res.status(401).json({success:false,message:'No token provided'});


        try{
            const decoded = jwt.verify(token,process.env.JWT_SECRET_ADMIN);
            console.log("decoded aadmin: ",decoded);
            const admin = await Admin.findById(decoded.id);
            if(admin && admin.token === token){
                req.user = {id:admin_.id,role:'admin'}
                return next();
            }
        }catch(err){

        }


        const decoded = jwt.verify(token,process.env.JWT_SECRET_USER);
        const user = await User.findById(decoded.id);
        if(user){
            req.user = {id:user._id,role:'user'}
            return next();
        }

        return res.status(401).json({
            success:false,
            message:'Invalid token'
        });
    }catch(err){
        return res.status(401).json({
            success:false,
            message:'Authentication failed'
        })
    }
}