
const mongoose = require("mongoose");
const dotenv = require("dotenv")
const app = require("./app.js")
// const Tour = require("./Models/tourModel.js")
dotenv.config({path:"./config.env"});

process.on("uncaughtException",err=>{
    process.exit(1);
})

const PORT = process.env.PORT||3000;

console.log(process.env.DB_URL)

mongoose.connect(process.env.DB_URL).then(()=> console.log("connected to db")).catch((e)=>console.log(e));





const server = app.listen(PORT, ()=>{
    console.log(`server listening at port ${PORT}`);
})


process.on('unhandledRejection',(err)=>{
    console.log(err.name, err.message)
    server.close(()=>{
        process.exit(1) //0 for success and 1 for uncaught exception ,.exit shuts down the server
    })
})