
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

        if(variant.stock === 0){
            return res.status(400).json({success:false,message:'OUT OF STOCK'});
        }
        let cart = await Cart.findOne({userId});
        if(!cart){
            cart = new Cart({
                userId:userId,
                items:[],
                totalAmount:0,
                totalItems:0,
            })
        }
        console.log("cart: ",cart);
        console.log("CartTotalAmount: ",cart.totalAmount);


        const existingItem = cart.items.find(item=>item.sku === sku);

        if(existingItem){
            existingItem.quantity +=1;
            
            cart.items.forEach(item=>{
                cart.totalItems +=item.quantity;
                cart.totalAmount +=item.price;
            })
            await cart.save();
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
            
            cart.items.forEach(item=>{
                cart.totalItems +=item.quantity;
                cart.totalAmount +=item.price;
            })
            await cart.save();
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

        // if(cart.items.length > 1){
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
        // }

        return res.status(200).json({
            success:true,
            cart
        })
   }catch(err){
        console.error('Error came in viewing the cart => ',err.message);
        return res.status(500).json({success:false,message:err.message});
   }
}


export const removeFromCart = async(req,res)=>{

    const sku = req.params.sku;
    console.log(sku);
    if(!sku) return res.status(400).json({success:false,message:"SKU is required..."});

    try{

        const product = await Product.findOne({"variants.sku":sku});
        if(!product) return res.status(404).json({success:false,message:'Product not found'});

        // const variant = product.variants.find(v=>v.sku ===sku);
        const userId = req.user.id;
        const cart = await Cart.findOne({userId});
        // console.log("cart: ",cart);
        const cartProduct = await cart.items.find(item=>item.sku === sku);

        if(!cartProduct)return res.status(404).json({success:false,message:'product is not in Cart'})
    
        if(cartProduct){
            if(cartProduct.quantity > 0){
                
                // console.log("quantity: ",cartProduct);
                console.log("cartProductid: ",cartProduct._id);
                if(cartProduct.quantity == 1){
                    const productId = cartProduct._id;
                    console.log(productId);
                    await Cart.updateOne(
                        {userId},
                        {$pull:{items:{_id:productId}}}
                    )

                    const price = cartProduct.price;
                    console.log("price of that single product in cart: ",price);
                    cart.totalAmount -=  price;
                    cart.totalItems -=1;
                    await cart.save();
                    return res.status(200).json({success:true,message:'Had only only variant',cart});
                }
                cartProduct.quantity -=1;

                const price = cartProduct.price;
                
                console.log(price);
                cartProduct.totalAmount = cartProduct.totalAmount - price;
                cartProduct.totalItems -=1;
                await cart.save();
                res.status(200).json({
                    success:true,
                    message:"Item removed",
                    cart
                })
            }
        }

       
    }catch(err){

        console.error('error came in removing the item from cart => ',err.message);
        return res.status(500).json({success:false,message:err.message});
    }
}