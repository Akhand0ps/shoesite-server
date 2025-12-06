
import Cart from "../models/cart.model.js"
import Product from "../models/product.model.js"

export const createCart = async(req,res)=>{
    
    const userId = req.userId;
    if(!userId) return res.status(400).json({success:false,message:'UserId is required'});
    try{

        const cart = await Cart.findOne({userId});

        if(!cart){

            const newCart = new Cart({
                userId:userId,
                items:[]
            })

            await newCart.save();
            return res.status(200).json({success:true,message:'CART CREATED SUCCESSFULLY',newCart});
        }
    }catch(err){
        console.error('ERROR CAME IN CREATING CART: ',err.message);
    }
}

export const addItemToCart = async(req,res)=>{

    
    const {sku} = req.body;
    if(!sku) return res.status(400).json({
        success:false,
        message:'SKU IS REQURIED'
    })

    try{

        const checkSku = await Cart.findOne({"items.sku":sku});
        const checkstock = await Prouduct.findOne({"variants.type.sku":sku});
        let stok = 0;
        if( checkstock.variants.type.stock == 0) return res.status(400).json({success:false,message:'OUT OF STOCK'});
        stok =checkstock.variants.type.stock;
        console.log('stok: ',stok);

        if(checkSku){
            const updateQuantity =  checkSku.items.quantity + 1;
            await updateQuantity.save();
            return res.status(200).json({success:true,message:'Item Added in the Cart'});
        }

        const updateQuantity =  checkSku.items.quantity + 1;
        await updateQuantity.save();
        return res.status(200).json({success:true,message:'Item Added in the Cart'});
    }catch(err){

        console.error('Erorr came in adding item to cart',err.message);
        return res.status(500).json({
            success:false,
            message:'INTERNAL SERVER ERROR'
        })
    }
}


