const Vendor=require('../models/Vendor');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const dotenv=require('dotenv');
dotenv.config();

const secretKey=process.env.WhatIsYourName;


const vendorRegister=async(req,res)=>{
    const {username,email,password}=req.body;
    try {
        const vendorEmail=await Vendor.findOne({email});
        if(vendorEmail){
            return res.status(400).json({message:"Email already exists"});
        }
        const hashedPassword= await bcrypt.hash(password,10);
        const newVendor=new Vendor({
            username,
            email,
            password: hashedPassword
        });
        await newVendor.save();
        res.status(201).json({message:"Vendor registered successfully"});
        console.log('registered');
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server Error"});
        }
}

const vendorLogin=async(req,res)=>{
    const {email,password}=req.body;
    try {
        const vendor=await Vendor.findOne({email});
        if(!vendor || !await bcrypt.compare(password,vendor.password)){
            return res.status(400).json({message:"Invalid credentials"});
        }

        const token=jwt.sign({vendorId:vendor._id},secretKey,{expiresIn:'1h'});

        res.status(200).json({message:"Vendor logged in successfully",token});
        console.log(email,"this is token:",token);

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server Error"});
    }
}

const getAllVendors =async(req,res)=>{
    try{
        const vendors=await Vendor.find().populate('firm');
        res.json({vendors});
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server Error"});
    }
}

const getVendorById=async(req,res)=>{
    const vendorId=req.params.apple;

    try {
        const vendor=await Vendor.findById(vendorId).populate('firm');
        if(!vendor){
            return res.status(404).json({error:"vendor not found"});
        }
        res.status(200).json({vendor});
        console.log("got the data");
    } catch (error) {
        console.error(error);
        res.status(500).json({error:"server error"});
    }
}

module.exports={vendorRegister,vendorLogin,getAllVendors,getVendorById};