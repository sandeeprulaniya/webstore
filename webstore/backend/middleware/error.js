const ErrorHandler = require("../utils/errorHandler");


module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error";

    // wrong mongodb id error

    if(err.name === "CastError" ){
        const message = `resource not found ! Invalid ID"+${err.path}`;
        err = new ErrorHandler(message,400);
    }

    // mongoose duplicate key error 
    if(err.code === 11000){
        const message = `user already registerd ! `;
        err = new ErrorHandler(message,400);
    }

    // wrong JWT error
    if(err.name==="JsonWebTokenError"){
        const message = `Json web token is invalid! please try again`;
        err = new ErrorHandler(message,400);
    }

    //JWT expire error
    if(err.name==="TokenExpiredError"){
        const message = `Json web token is Expired! please try again`;
        err = new ErrorHandler(message,400);
    }




    res.status(err.statusCode).json({
        success:false,
        message:err.message,
    });
}