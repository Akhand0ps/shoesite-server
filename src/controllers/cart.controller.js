
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
                subtotal:0
            })
        }
        // console.log("cart: ",cart);
        // console.log("CartTotalAmount: ",cart.totalAmount);


        const existingItem = cart.items.find(item=>item.sku === sku);

        if(existingItem){

            if(existingItem.quantity + 1 > variant.stock){
                return res.status(400).json({
                    success:false,
                    message:`Cannot add more. Only ${variant.stock} items available in stock.`
                })
            }

            existingItem.quantity +=1;
            // console.log("existing price: ",existingItem.price);
            existingItem.subtotal = existingItem.quantity * existingItem.price;
        }else{
            cart.items.push({
                productId:product._id,
                image:product.imageUrl[0],
                sku:variant.sku,
                title:product.title,
                quantity:1,
                price:variant.price,
                subtotal:variant.price*1,
                size:variant.size
            })
        }

        let totalAmount = 0;
        let totalItems = 0;

        cart.items.forEach(item=>{
            item.subtotal =item.quantity * item.price;
            totalAmount +=item.subtotal;
            totalItems += item.quantity;
        })
        cart.totalAmount = totalAmount;
        cart.totalItems = totalItems;
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
        let cart = await Cart.findOne({userId});
        
        if(!cart){
            cart = new Cart({
                userId,
                items:[],
                totalAmount:0,
                totalItems:0
            })
            await cart.save();
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


export const removeFromCart = async(req,res)=>{

    const sku = req.params.sku;
    const userId = req.user.id;

    // console.log(sku);
    if(!sku) return res.status(400).json({success:false,message:"SKU is required..."});

    try {
        const cart = await Cart.findOne({userId});
        if(!cart)return res.status(404).json({success:false,message:'Cart not found'});
        const itemIndex = cart.items.findIndex(item=>item.sku === sku);

        if(itemIndex === -1)return res.status(404).json({success:false,message:'product is not in Cart'})
        cart.items.splice(itemIndex ,1);
        
        let totalAmount = 0;
        let totalItems = 0;

        cart.items.forEach(item=>{
            item.subtotal = item.quantity * item.price,
            totalAmount += item.subtotal,
            totalItems +=item.quantity;
        })

        cart.totalAmount = totalAmount;
        cart.totalItems  = totalItems;


        await cart.save();

        res.status(200).json({
            success:true,
            message:"Item removed",
            cart
        })
    }catch(err){
        console.error('error came in removing the item from cart => ',err.message);
        return res.status(500).json({success:false,message:err.message});
    }
}

export const newAddItemtoCart = async(req,res)=>{

    const userId = req.user.id;
    const {sku,quantity} = req.body;
    
    if(!sku || !quantity) return res.status(400).json({
        success:false,
        message:'SKU And Quantity  IS REQURIED'
    })
    try{
        const product = await Product.findOne({"variants.sku":sku});
        if(!product) return res.status(404).json({success:false,message:'Product not found'});

        const variant = product.variants.find(v=>v.sku == sku);

        if(!variant)return res.status(404).json({success:false,message:'Variant not found'});

        let cart = await Cart.findOne({userId});
        if(!cart){
            cart = new Cart({
                userId:userId,
                items:[],
                totalAmount:0,
                totalItems:0,
                subtotal:0
            })
        }

        const existingItem = cart.items.find(item=>item.sku ===sku);

        if(existingItem){
            const newQuantity = existingItem.quantity + quantity;

            if(newQuantity > variant.stock){
                return res.status(400).json({
                    success:false,
                    message:`Cannot add ${quantity} more. Only ${variant.stock} in stock you already have ${existingItem.quantity} in cart.`
                })
            }

            existingItem.quantity = newQuantity;
            existingItem.subtotal = existingItem.quantity * existingItem.price;
        }else{
            if(quantity > variant.stock){
                return res.status(400).json({
                    success:false,
                    message:`Cannot add ${quantity}. Only ${variant.stock} items in stock`
                });
            }

            cart.items.push({
                productId:product._id,
                image:product.imageUrl[0],
                sku:variant.sku,
                title:product.title,
                quantity:quantity,
                price:variant.price,
                subtotal:variant.price*quantity,
                size:variant.size
            })
        }
        let totalAmount = 0;
        let totalItems = 0;
        cart.items.forEach(item=>{
            item.subtotal =item.quantity * item.price;
            totalAmount +=item.subtotal;
            totalItems += item.quantity;
        })
        cart.totalAmount = totalAmount;
        cart.totalItems = totalItems;
        await cart.save();

        res.status(200).json({
            success:true,
            message:'Item added to cart',
            cart
        })
    }catch(err){
        console.error('Error came in adding item to cart=>', err.message);
        return res.status(500).json({
            success:false,
            message:'INTERNAL SERVER ERROR'
        })
    }
}

export const removeOneUnit = async(req,res)=>{

     const sku = req.params.sku;
    const userId = req.user.id;
    if(!sku) return res.status(400).json({success:false,message:"SKU is required..."});
    try{
        const cart = await Cart.findOne({userId});
        if(!cart)return res.status(404).json({success:false,message:'Cart not found'});
        const itemIndex = cart.items.findIndex(item=>item.sku === sku);
        if(itemIndex === -1)return res.status(404).json({success:false,message:'product is not in Cart'})
        
        const item = cart.items[itemIndex];

        if(item.quantity > 1){
            item.quantity -=1;

            item.subtotal = item.quantity*item.price;
        }else{
            cart.items.splice(itemIndex,1);
            
        }

        let totalAmount = 0;
        let totalItems = 0;
        
        cart.items.forEach(item=>{
            item.subtotal = item.quantity * item.price,
            totalAmount += item.subtotal,
            totalItems +=item.quantity
        })

        cart.totalAmount = totalAmount;
        cart.totalItems = totalItems;
        await cart.save();

        const message = cart.items.length === 0 ? 'Item removed, cart is now empty':'Item quantity decreased';
        return res.status(200).json({
            success:true,
            message:message,
            cart
        })
    }catch(err){
        console.error('Error came in remvoe single unit => ',err.message);
        return res.status(500).json({
            success:false,
            message:err.message,
        })
    }

}
