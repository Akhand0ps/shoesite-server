import mongoose from 'mongoose';
import * as z from 'zod';



export const productSchema = z.object({

    title:z.string().min(3).trim(),
    description:z.string().trim().min(10),
    brand:z.string().lowercase().trim(),
    imageUrl:z.array(z.string()).optional(),
    category:z.string().refine(
        (id)=> mongoose.Types.ObjectId.isValid(id),
        {message:'Invalid ObjectId'}
    ),
    variants:z.object({
        size:z.enum([6,7,8,9,10,11]),
        stock:z.number().min(0),
        price:z.number().min(0)
    })
});

