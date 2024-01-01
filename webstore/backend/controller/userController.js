const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const mongoose = require("mongoose");
const sendToken = require("../utils/jwtTokens");
const sendEmail= require("../utils/sendEmail");
const crypto = require("crypto");
// register a User 

exports.registerUser = catchAsyncErrors(async(req,res,next)=>{
    const {name,email,password} = req.body;

    const user = await  User.create({
        name,email,password,
        avatar:{
            public_id : "this is sample id",
            url:"profile picture url"
        }
    });

    sendToken(user,200,res);
})


// LOGIN USER

exports.loginUser = catchAsyncErrors(async(req,res,next)=>{
    const {email,password} = req.body;

    if(!email || !password){
        return next(new ErrorHandler("please enter email & password",400));
    }

    const user = await User.findOne({email}).select("+password");
   
    if(!user){
        return next(new ErrorHandler("invalid email or password",401));

    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("invalid email or password",401));

    }

   sendToken(user,200,res);
});


//logout user

exports.logout = catchAsyncErrors(async (req,res,next)=>{

    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
    })
    
    res.status(200).json({
        seccess:true,
        message:"logged out"
    })
})


//forgot password
exports.forgotPassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHandler("user not found",404));
    }

    //get resetPssword token

    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave:false});

    const resetPasswordUrl =   `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it`;


    try {

        await sendEmail({
                email:user.email,
                subject:`Ecommerce password recovery`,
                message,
        })

        res.status(200).json({
            success:true,
            message:`email sent to  ${user.email} successfully`
        })
        
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordToken = undefined;

        await user.save({validateBeforeSave:false});

        return next(new ErrorHandler(error.message,500));
    }

})

// reset password
exports.resetPassword = catchAsyncErrors(async(req,res,next)=>{

    // creating token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()},
    })

    if(!user){
        return next(new ErrorHandler("reset password token is invalid of has been expired",400));
    }

    if(req.body.password !==req.body.comparePassword){
        return (new ErrorHandler("password done not match",400));
    }

    user.password = req.body.password;
    user.resetPasswordExpire= undefined;
    user.resetPasswordToken=undefined;

    await user.save();
    sendToken(user,200,res);
})

// get user details
exports.getUserDetails = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        user,
    })
})


// change user password
exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){

        return next(new ErrorHandler("incorrect password , please try again",400));
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("password and confirm password does not match , please try again",400));
    }

    user.password = req.body.newPassword;


    await user.save()

   sendToken(user,200,res);
})

// updating profile

exports.updateProfile = catchAsyncErrors(async(req,res,next)=>{
   const newUserData = {
    name: req.body.name,
    email:req.body.email,
    // we will add cloudenary later
   }

   const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
    new:true,
    runValidators:true,
    useFindAndModify:false,
   })

   res.status(200).json({
    success:true,
    message:"profile updated successfully !"
   })
})


// get user details (admin kisi ka bhi data dekhna chahe to )

exports.getOneUser = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler("user does not exist with this id"));
    }

    res.status(200).json({
        success:true,
        user,
    })
})

// get all users details for admin
exports.getAllUsers = catchAsyncErrors(async(req,res,next)=>{
    const users = await User.find();

   
    res.status(200).json({
        success:true,
        users,
    })
})


// update user role for admin
exports.updateUserRole = catchAsyncErrors(async(req,res,next)=>{
    const newUserData = {
     name: req.body.name,
     email:req.body.email,
     role:req.body.role
    }
 
    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
     new:true,
     runValidators:true,
     useFindAndModify:false,
    })
 
    res.status(200).json({
     success:true,
     message:"user role updated successfully !"
    })
});


// delete user for admin

exports.deleteUser = catchAsyncErrors(async(req,res,next)=>{
    
 
    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorHandler("user not found"))
    }
    // we have to remove cloudinary


    await User.findByIdAndDelete(req.params.id);
   
    res.status(200).json({
     success:true,
     message:"user deleted successfully !"
    })
});