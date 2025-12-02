import bcrypt from "bcrypt";



const hashPass = async(password)=>{

    return bcrypt.hash(password,process.env.SALT);
}

export default hashPass;