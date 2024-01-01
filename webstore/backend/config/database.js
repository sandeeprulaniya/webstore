const mongoose = require("mongoose");


const connectDatabase = () => {

    mongoose.connect(process.env.MONGO_URL).then(()=>{
        console.log("database connection successful");
    
    })
    // .catch((err)=>{
    //     console.log("database connection error");
    // }) 
    // because we are handling unhandled promise rejection in server.js thats why it is commented 
    
}

module.exports = connectDatabase;
