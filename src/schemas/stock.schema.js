
import * as z from "zod";


const stockSchema = z.object({

    sku:z.string(),
    delta:z.number().min(1,'Minimum is 1'),
})


export default stockSchema;


