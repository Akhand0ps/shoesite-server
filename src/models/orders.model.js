import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true
    },
    orderNumber:{
        type:String,
        unique:true,
    },
    items:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product",
            required:true
        },
        sku:{
            type:String,
            required:true
        },
        title:{
            type:String,
            required:true,
        },
        size:{
            type:Number,
            required:true
        },
        quantity:{
            type:Number,
            required:true,
            min:1
        },
        price:{
            type:Number,
            required:true,
            min:0
        },
        subtotal:{
            type:Number,
            required:true,
        },
        image:{
            type:String,
            required:true
        },   
    }],
    shippingAddress:{
        name:{type:String,required:true},
        line1:{type:String,required:true},
        city:{type:String,required:true},
        state:String,
        zip:{type:String,required:true,minLength:6},
        phone:{type:String,required:true,minLength:10},
        addtionalphone:{type:String,minLength:10},
    },
    paymentMethod:{
        type:String,
        enum:['card','upi','cod'],
        required:true
    },
    paymentStatus:{
        type:String,
        enum:['pending','paid','failed','refunded'],
        default:'pending'
    },
    transactionId:{
        type:String
    },
    subtotal:{
        type:Number,
        required:true,
        min:0
    },
    shippingCost:{
        type:Number,
        default:0,
    },
    tax:{
        type:Number,
        default:0
    },
    totalAmount:{
        type:Number,
        required:true,
    },
    status:{
        type:String,
        enum:['pending','processing','shipped','delivered','cancelled','refunded'],
        defualt:'pending',
    },
    trackingNumber:String,
    estimatedDelivery:Date,
},{timestamps:true})


OrderSchema.index({userId:1,createdAt:-1})
OrderSchema.index({orderNumber:1});
OrderSchema.index({status:1})




OrderSchema.pre('save',function(){

    // const orderName = 'ORD';
    if(!this.orderNumber){
        const orderId = this._id.toString().slice(-8).toUpperCase();
        const date = new Date().toISOString().slice(2,10).replace(/-/g,'');

        this.orderNumber = `ORD-${date}-${orderId}`
    }
})



export default mongoose.model('Order',OrderSchema);