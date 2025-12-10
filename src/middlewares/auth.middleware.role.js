

export const onlyUser = async(req ,res,next)=>{

    if(req.user.role !== 'user') return res.status(403).json({success:false,message:"You are not allowed to access this route"});
    next();
}



export const onlyAdmin = async(req ,res,next)=>{

    // console.log("role => ",req.user.role);

    if(req.user.role !== 'admin') return res.status(403).json({success:false,message:"You are not allowed to access this route"});
    next();
}
