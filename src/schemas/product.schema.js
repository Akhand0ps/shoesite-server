import mongoose from 'mongoose';
import * as z from 'zod';



const productSchema = z.object({

    title:z.string().min(3).trim(),
    description:z.string().trim().min(10),
    brand:z.string().trim(),
    imageUrl:z.array(z.string()).optional(),
    category:z.string().refine(
        (id)=> mongoose.Types.ObjectId.isValid(id),
        {message:'Invalid ObjectId'}
    ).optional(),
    // variants:z.object({
    //     size:z.enum([6,7,8,9,10,11]),
    //     stock:z.number().min(0),
    //     price:z.number().min(0)
    // }),
    variants:z.array(
        z.object({
            size:z.number().min(6).max(11),
            stock:z.number().min(0),
            price:z.number().min(0)
        })
    ),
    isPublic:z.boolean(),
    imageUrl:z.array(z.string()).min(1,'Please add atleast one Image')
});



export const updateProductSchema = productSchema.partial();
export const createProductSchema = productSchema.extend({
    isPublic: z.boolean().default(true)
})
