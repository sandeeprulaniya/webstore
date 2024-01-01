const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt  = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");//build in module no need to install

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"please enter your name"],
        maxLength:[30,"naem cannot exceed 30 character"],
        minLength:[4,"Name should have more than 4 character"],
        
    },
    email:{
        type:String,
        required:[true,"please enter your mail"],
        unique:true,
        validate:[validator.isEmail,"please enter a valid email"],
    },
    password:{
        type:String,
        required:[true,"please enter your password"],
        minLength:[8,"password should be greater then 8 characters"],
        select:false,// jb jum database me search krange to ye hme password nhi lake dega

    },
    avatar:{
        
            public_id:{
                type:String,
                required:true,
            },

            url:{
                type:String,
                required:true
            },

        
    },
    role: {
        type:String,
        default:"user",
    },

    resetPasswordToken:{
        type:String
    },
    resetPasswordExpire:{
        type:Date
    }

});

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password,10); 
})

// jwt token
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    });
};

// compare Password

userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}

// generating password reset token

userSchema.methods.getResetPasswordToken = async function(){
    const resetToken = crypto.randomBytes(20).toString("hex");

    // hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).toString("hex");
    this.resetPasswordExpire = Date.now() + 15*60*1000;

    return resetToken;
}
module.exports = mongoose.model("User",userSchema);