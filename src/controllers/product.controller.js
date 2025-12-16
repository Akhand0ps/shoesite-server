import Product from "../models/product.model.js";
import { createProductSchema, updateProductSchema } from "../schemas/product.schema.js";
import stockSchema from "../schemas/stock.schema.js";

export const createproduct = async(req,res)=>{

    // console.log('came in createproduct controller.')
    try{

        const {
            title,description,brand,
            category,originalPrice,
            isPublic,variants
        } = req.body


        //  if(!title || !description || !brand ||
        //     !category || !originalPrice || !finalPrice || !variants
        // ){
        //     return res.status(400).json({success:false,message:'Fields are empty...'})
        // }

        const media = req.files? req.files.map(file=>file.path): [];


        req.body.variants = JSON.parse(req.body.variants);
        req.body.imageUrl = media
        // console.log(req.body);
        const data = createProductSchema.safeParse(req.body);
        // console.log(data);
        if(!data.success)throw new Error(`zod validation failed => ${data.error.issues}`);


       /*  
        console.log("title: ",req.body.title);
        console.log("description:",req.body.description);
        console.log("brand: ",req.body.brand);
        console.log("cat: ",req.body.category);
        console.log("originalprice: ",req.body.originalPrice);
        console.log("finalprice: ",req.body.finalPrice);
        console.log("ispublic: ",req.body.isPublic); */
        
       /*  {
        success: true,
        data: {
            title: 'Nike Court Vision',
            description: "Nike Court Vision Low Men's Shoes. Nike IN",
            brand: 'Nike',
            category: '692f1f63f54adb07535f2f50',
            variants: [ [Object], [Object] ]
            }
        }
 */
       
        const isExist = await Product.findOne({title});
        if(isExist){
            return res.status(409).json({success:false,message:'Pruoduct already exist, Please create different name'})
        }

        // const ParsedVars = JSON.parse(variants);

        // console.log("==========");
        // console.log(media);
        // console.log("==========");

        const NewProduct = new Product({
            title:data.data.title,
            description:data.data.title,
            brand:data.data.title,
            imageUrl:data.data.imageUrl,
            category:data.data.category,
            originalPrice,
            isPublic,
            variants:data.data.variants
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
      
        // const {variants} = req.body;
        req.body.variants = JSON.parse(req.body.variants);
        const media = req.files? req.files.map(file=>file.path):[];
        if(media.length !== 0) {
            req.body.imageUrl = media
        }
        const ParsedVar = updateProductSchema.safeParse(req.body);

        // if(variants){
        //     const parsedVariants = JSON.parse(variants);
        //     req.body.variants = parsedVariants;
        //     console.log("parsed: ",parsedVariants);
        // }
       


        console.log("ParsedVar:=> ",ParsedVar);

        Object.keys(ParsedVar.data).forEach(key=>{
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

    const slug = req.params.slug;
    // console.log(slug);
    if(!slug)return res.status(400).json({success:false,message:'SLUG IS REQUIRED TO FIND THE PRODUCT'});
    try{
        
        const product = await Product.findOne({slug});
        
        if(!product)return res.status(404).json({success:false,message:'PRODUCT NOT FOUND 404'});

        await Product.findOneAndDelete({slug});

        return res.status(200).json({success:true,message:'Product deleted successfully'});
    }catch(err){

        console.error('Error came in deletion of product: ',err.message);
        return res.status(500).json({success:false,message:'INTERNAL SERVER ERROR'});
    }
}

export const getAllProducts = async(req,res)=>{

    try{
        const Products = await Product.find({});
        if(Products.length ===0) return res.status(404).json({success:false,message:'Product list is empty'})
        
        return res.status(200).json({
            success:true,
            Products
        })
    }catch(err){
        console.error('ERROR CAME IN GETTING PRODUCTS...',err.message);
        return res.status(500).json({
            success:false,
            message:'INTERNAL SERVER ERROR'
        })
    }
}


export const isPubPrivate = async(req,res)=>{


    const slug = req.params.slug;
    if(!slug)return res.status(400).json({success:false,message:'SLUG IS REQUIRED TO FIND THE PRODUCT'});
    try{
        const product = await Product.findOne({slug});
        const {isPublic} = req.body;
        if(!isPublic) return res.status(400).json({success:false,message:'isPublic value is required to set'})

        console.log(product.isPublic);
        console.log(isPublic);

        if(product.isPublic === isPublic) return res.status(409).json({success:false,message:'IsPublic is already set to what you are trying to set'})

        product.isPublic = isPublic;

        await product.save()
        return res.status(200).json({
            success:true,
            message:`${slug} isPublic is change to ${isPublic}`
        })
    }catch(err){
        console.error('Error came in seting public/private value..',err.message);
        return res.status(500).json({
            success:false,
            message:'INTERNAL SERVER ERROR'
        })
    }
}

export const getProductByBrand = async(req,res)=>{

    const brandName = req.params.brand;
    if(!brandName)return res.status(400).json({success:false,message:'brand name IS REQUIRED TO FIND THE PRODUCTS'});

    try{
        
        const products = await Product.find({brand:brandName})

        if(products.length ===0) return res.status(404).json({success:false,message:'No Products foudn 404'});

        return res.status(200).json({
            success:true,
            products
        })
    }catch(err){
        console.error('Error came in finding products with brands..',err.message);
        return res.status(500).json({
            success:false,
            message:'INTERNAL SERVER ERROR'
        })
    }
}

export const getProductByCategory = async(req,res)=>{

    const categoryId = req.params.category;
    // console.log(categoryId);
    if(!categoryId)return res.status(400).json({success:false,message:'category name IS REQUIRED TO FIND THE PRODUCTS'});
    try{
        
        const products = await Product.find({category:categoryId});
         if(products.length ===0) return res.status(404).json({success:false,message:'No Products foudn 404'});

        return res.status(200).json({
            success:true,
            products
        })
        
    }catch(err){
        console.error('Error came in finding products with categoryId..',err.message);
        return res.status(500).json({
            success:false,
            message:'INTERNAL SERVER ERROR'
        })
    }
}

export const getOneProduct = async(req,res)=>{

    const slug = req.params.slug;
    if(!slug) return res.status(400).json({success:false,message:'Slug is required to search...'});

    try{
        const product = await Product.findOne({slug});
        if(!product)return res.status(404).json({
            success:false,
            message:'PRODUCT NOT FOUND ERROR 404'
        })

        return res.status(200).json({success:true,product});
    }catch(err){
        console.error('Error came in finding product with slug.',err.message);
        return res.status(500).json({
            success:false,
            message:'INTERNAL SERVER ERROR'
        })
    }
}

export const searchProduct = async(req,res)=>{

    const {search,categoryId,sort,page,limit,minPrice,maxPrice,brand}= req.query;
    
    try{
        let filter = {};
        if(search){
            console.log(search);
            filter.$text = {$search:search}
        }
        if(categoryId){
            console.log(categoryId);
            filter.category = categoryId;
        }

        if(minPrice && maxPrice){
            filter.price = {$gte:minPrice , $lte:maxPrice};
        }
        if(brand){
            filter.$text = {$search:brand};
        }
        console.log(filter);
        const products = await Product.find(filter);
        // if(!filter)return res.status(400).json({success:false,message:'filter '})
        if(products.length === 0){
            return res.status(404).json({
                success:false,
                message:'NO PRODUCTS FOUND..'
            })
        }
        return res.status(200).json({
            success:true,
            products
        })
    }catch(err){
        console.error('Error came in searching..',err.message);
        return res.status(500).json({success:false,message:'INTERNAL SERVER ERROR'});
    }
}


export const searchBar = async(req,res)=>{

    try{
        const {search} = req.query;
        let filter = {};
        if(search){
            filter.$text = {$search:search};
        }
        const product = await Product.find(filter);
        if(product.length ===0){
            return res.status(404).json({
                success:false,
                message:'NO PRODUCTS FOUND..'
            })
        }
        return res.status(200).json({
            success:true,
            product
        })
    }catch(err){
        console.error('Error came in searching..',err.message);
        return res.status(500).json({success:false,message:'INTERNAL SERVER ERROR'});
    }
}
export const changeStock = async(req,res)=>{


    const slug = req.params.productId
    const {sku,delta} = req.body;
    if(!sku || !delta || !slug) return res.status(400).json({success:false,message:'SKU, Quantity and slug is required'});
    const stockData = stockSchema.safeParse(req.body);
    if(!stockData.success){
        throw new Error(`Error came in validating changeStock request body => ${stockData.error.issues}`);
    }
    // console.log(stockData);

    try{

        const product = await Product.findOne({slug});
        if(!product)return res.status(404).json({success:false,message:'Product not found'});
        // console.log("product: ",product);
        const variant = product.variants.find(v=>v.sku ===stockData.data.sku);
        if(!variant)return res.status(404).json({success:false,message:'Variant not found 404'});
        // console.log(typeof stockData.data.delta);
        if(variant.stock + stockData.data.delta < 0) throw new Error('Insufficient stock');

        
        const updatedProduct = await Product.findOneAndUpdate(
            {"variants.sku":stockData.data.sku},
            {$inc:{"variants.$.stock":stockData.data.delta}},
            {new:true}
        )
        if(!updatedProduct)return res.status(404).json({success:false,message:'Product not found'});
        const updatedVariant = updatedProduct.variants.find(v=>v.sku===sku);
        res.status(200).json({success:true,message:'stock updation successfull',updatedVariant});

    }catch(err){
        console.error('Error came in changestock => ',err.message);
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}