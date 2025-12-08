
import Cart from "../models/cart.model.js"
import Product from "../models/product.model.js"

export const createCart = async(req,res)=>{
    
    const userId = req.user.id;
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

    const userId = req.user.id;
    const {sku} = req.body;
    if(!sku) return res.status(400).json({
        success:false,
        message:'SKU IS REQURIED'
    })

    try{
        const product = await Product.findOne({"variants.sku":sku});
        if(!product) return res.status(404).json({success:false,message:'Product not found'});

        const variant = product.variants.find(v=>v.sku == sku);

        if(!variant)return res.status(404).json({success:false,message:'Variant not found'});

        if(variant.stock ===0){
            return res.status(400).json({success:false,message:'OUT OF STOCK'});
        }
        let cart = await Cart.findOne({userId});
        if(!cart){
            cart = new Cart({
                userId:userId,
                items:[]
            })
        }



        const existingItem = cart.items.find(item=>item.sku === sku);

        if(existingItem){
            existingItem.quantity +=1;
        }else{
            cart.items.push({
                productId:product._id,
                image:product.imageUrl[0],
                sku:variant.sku,
                title:product.title,
                quantity:1,
                price:variant.price,
                size:variant.size
            })

        }

        await cart.save();

        res.status(200).json({
            success:true,
            message:'Item added to cart',
            cart
        })
        
    }catch(err){

        console.error('Erorr came in adding item to cart=>',err.message);
        return res.status(500).json({
            success:false,
            message:'INTERNAL SERVER ERROR'
        })
    }
}

export const viewCart = async(req,res)=>{

    const userId = req.user.id;

   try{
        const cart = await Cart.findOne({userId});
        
        if(!cart) return res.status(404).json({success:false,message:'cart not found'});
        if(cart.items.length === 0) return res.status(404).json({success:false,message:'Cart is empty'});

        let cartItems = cart.items;

        if(cart.items.length > 1){
            let totalPrice=0;

            cart.items.forEach(item=>{

                totalPrice +=item.price * item.quantity
            })
            const totalItems = cart.items.reduce((sum,item)=>{
                return sum + item.quantity;
            },0)
            // console.log("totalPrice: ",totalPrice);
            // console.log('totalItems: ',totalItems);
            cart.totalAmount = totalPrice;
            cart.totalItems = totalItems

            await cart.save();
            cartItems.push(totalPrice);
        }

        return res.status(200).json({
            success:true,
            cart
        })
   }catch(err){
        console.error('Error came in viewing the cart => ',err.message);
        return res.status(500).json({success:false,message:err.message});
   }
}
