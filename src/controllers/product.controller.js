import Product from "../models/product.model.js";


export const createproduct = async(req,res)=>{


    console.log('came in createproduct controller.')
    try{

        const {
            title,description,brand,
            category,originalPrice,finalPrice,
            isPublic,variants
        } = req.body
       /*  console.log("vars: ",req.body.variants);
        console.log("title: ",req.body.title);
        console.log("description:",req.body.description);
        console.log("brand: ",req.body.brand);
        console.log("cat: ",req.body.category);
        console.log("originalprice: ",req.body.originalPrice);
        console.log("finalprice: ",req.body.finalPrice);
        console.log("ispublic: ",req.body.isPublic); */
        
        if(!title || !description || !brand ||
            !category || !originalPrice || !finalPrice || !variants
        ){
            return res.status(400).json({success:false,message:'Fields are empty...'})
        }

        const isExist = await Product.findOne({title});
        if(isExist){
            return res.status(409).json({success:false,message:'Pruoduct already exist, Please create different name'})
        }

        const ParsedVars = JSON.parse(variants);

        const media = req.files? req.files.map(file=>file.path): [];
        console.log(media);

        const NewProduct = new Product({
            title:title,
            description,
            brand,
            imageUrl:media,
            category,
            originalPrice,
            finalPrice,
            isPublic,
            variants:ParsedVars
        })

        await NewProduct.save();
        return res.status(201).json({success:true,message:"Product created successfully",NewProduct})


    }catch(err){
        
        console.error('Error came in creating product...',err.message);
        return res.status(500).json({success:false,message:err.message})
    }

}


export const updateProduct = async(req,res)=>{

    const slug = req.params.slug;
    
    if(!slug) return res.status(400).json({success:false,message:"SLUG IS REQUIRED TO ACCESS"});
    
       
    try{

        const product = await Product.findOne({slug});
        if(!product)return res.status(404).json({success:false,message:"PRODUCT NOT FOUND"});
        console.log(product);

        const media = req.files? req.files.map(file=>file.path):[];

        if(media.length !== 0) {
            product.imageUrl = media
        }

        Object.keys(req.body).forEach(key=>{
            if(key !=='_id' && key !=='createdAt' && key !=='updatedAt'){
                product[key] = req.body[key];
            }
        });

        await product.save();
        console.log("after saving: ",product);
        return res.status(200).json({success:true,product});

    }catch(err){
        console.error(err.message);
        return res.status(500).json({success:false,message:'INTERNAL SERVER ERROR'});
    }

}


export const deleteProduct = async(req,res)=>{

}

export const getAllProducts = async(req,res)=>{

}


export const isPubPrivate = async(req,res)=>{

}