const Product=require('../models/Product');
const multer=require('multer');
const path=require('path');
const Firm = require('../models/Firm');
const { error } = require('console');
const { get } = require('http');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname( file.originalname));
    }
});

const upload = multer({ storage:storage });

const addProduct=async(req,res)=>{
    try {
        const {productName,price,category,bestSeller,description}=req.body;
        const image=req.file?req.file.filename:undefined;

        const firmId=req.params.firmId;
        const firm=await Firm.findById(firmId);
        if(!firm){
            return res.status(404).json({message:"firm not found"});
        }

        const product=new Product({
            productName,
            price,
            category,
            bestSeller,
            description,
            image,
            firm:firm._id
        })

        const savedProduct=await product.save();
        firm.products.push(savedProduct._id);
        await firm.save();
        return res.status(201).json({message:"product added successfully",savedProduct});

    } catch (error) {
        console.error(error);
        return res.status(500).json({error:"server error"});
    }
}

const getProductByFirm=async(req,res)=>{
    try {
        const firmId=req.params.firmId;
        const firm=await Firm.findById(firmId);
        if(!firm){
            return res.status(404).json({error:"firm not found"});
        }
        const restaurantName= firm.firmName;
        const products=await Product.find({firm:firmId});
        return res.status(200).json({restaurantName, products});


    } catch (error) {
        console.error(error);
        return res.status(500).json({error:"server error"});
    }
}

const deleteproductById=async(req,res)=>{
    try {
        const productId=req.params.productid;
        const deletedProduct=await Product.findByIdAndDelete(productId);
        if(!deletedProduct){
            return res.status(404).json({error:"product not found"});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({error:"server error"});
    }
}

module.exports={addProduct:[upload.single('image'),addProduct],getProductByFirm,deleteproductById};