import dotenv from 'dotenv'
dotenv.config();
import {v2 as cloudinary} from "cloudinary";
import multer from "multer";
import {CloudinaryStorage} from 'multer-storage-cloudinary';


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET    
});

// console.log("===============================================================")
// console.log(process.env.CLOUDINARY_CLOUD_NAME)
// console.log(process.env.CLOUDINARY_API_KEY)
// console.log(process.env.CLOUDINARY_API_SECRET)

const storage = new CloudinaryStorage({

    cloudinary,
    params:{
        folder:'Shoesite/assets',
        allowed_formats:['jpg','png','jpeg','gif','webp','AVIF'],
    }
})


export const upload = multer({
    storage,
})