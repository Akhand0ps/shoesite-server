import Category from "../models/category.model.js"
import Product from '../models/product.model.js'

export const createcategory = async(req,res)=>{

    try{

        let {name,parent} = req.body;
        // console.log("name:=>", name);
        // console.log("parent: =>",parent);
        // console.log(typeof parent)
        if(parent == '') parent = null;
        // console.log("after");
        //  console.log("parent: =>",parent);
        // console.log(typeof parent)
        if(!name) return res.status(400).json({success:false,message:'Name is required'});

        const check = await Category.findOne({name});
        if(check){
            console.log("================================")
            console.log("category:",check);
            console.log("================================");
            return res.status(409).json({success:false,message:'Category already exist.'})
        }
        const cat = {
            name:name,
            parent:parent !=null? parent : null
        }
        
        await Category.create(cat);
        

        return res.status(201).json({
            success:true,
            cat
        })
    }catch(err){

        console.error('Error came in creategory controller: ',err.message);
        return res.status(500).json({
            success:false,
            message:'INTERNAL SERVER ERROR'
        })
    }
}


export const editcategory = async(req,res)=>{

    try{

        const slug = req.params.category;
        // console.log(slug);
        if(!slug) return res.status(400).json({success:false,message:"Slug is required..."});

        const catDb = await Category.findOne({slug});

        if(!catDb) return res.status(404).json({
            success:false,
            message:'Category not found...'
        })


        const {name,parent} = req.body;
        // console.log("req.bodyname: ",name);
        // console.log("req.bodyparent: ",parent);

        // const filter = {slug}
        // const update = {name:name,parent:parent}
        // const options = {new: true}
        catDb.name = name,
        catDb.parent = parent
        await catDb.save();

        // const newCat = await Category.findOneAndUpdate(filter,update,options);

        return res.status(200).json({
            success:true,
            catDb
        });
        
    }catch(err){
        console.error("Error came while editing the category: ",err.message);
        return res.status(500).json({
            success:false,
            error:err.message
        })
    }
}

export const deletecategory = async(req,res)=>{

    
    if(!req.params.id) return res.status(404).json({
        success:false,
        message:'Id is required'
    })

    try{

        const id = req.params.id;

        // console.log("id:",id);
        // console.log("newId: ",newId);
        const cat = await Category.findOne({_id: id});

        if(!cat){
            return res.status(404).json({

                success:false,
                message:'Category not found.'
            })
        }
        
        const children = await Category.find({parent:id});


        if((!cat.parent  && children.length>0) || (cat.parent && children.length>0)){
            return res.status(400).json({
                success:false,
                message:"Cannot delete category: it has subcatogories"
            })
        }

        const productCount = await Product.countDocuments({category:id});

        if(productCount > 0){
            return res.status(400).json({
                success:false,
                message:`Cannot delete category: ${productCount} belongs to this category`
            })
        }

        await Category.findByIdAndDelete(id);
        return res.status(200).json({
            success:true,
            message:"Category deleted successfully..."
        })

    }catch(err){
        console.error('Error came in deleting: ',err.message);
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}


export const getAllCategories = async(req,res)=>{

    try{

        const AllCats = await Category.find({});
        if(AllCats.length === 0)return res.status(404).json({
            success:false,
            message:'No categories found...'
        })

        return res.status(200).json({
            success:true,
            AllCats
        })
        
    }catch(err){
        console.error('Error came in getting all categories: ',err.message);
        return res.status(500).json({
            success:false,
            message:'INTERNAL SERVER ERROR'
        })
    }
}