const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");

//handling Uncaught exception

process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to uncaught exception`);

    process.exit(1);
    
})


// config

dotenv.config({path:"backend/config/config.env"});


connectDatabase();// calling it after dotenv connection because it need process.env 

const server = app.listen(process.env.PORT,function(){
    console.log("server started at port "+ process.env.PORT);
})



// unhandled promise rejection // 


process.on("unhandledRejection",err=>{
    console.log(`Error : ${err.message}`);
    console.log(`Shutting down the server due to unhandled promise rejection`);

    server.close(()=>{
        process.exit(1);
    });
})