
const mongoose = require("mongoose");
const dotenv = require("dotenv")
const app = require("../../app")
const Tour = require("../../Models/tourModel")
dotenv.config({path:"./config.env"});

const fs = require("fs");


// const PORT = process.env.PORT||3000;

console.log(process.env.DB_URL)


const data  = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`,"utf-8"));



const importData = async()=>{
    try{
    await Tour.create(data);
    console.log('DONE');
    process.exit();
    }
    catch(e)
    {
        console.log(e)
    }
}

const deleteData = async()=>{
    try{
        await Tour.deleteMany()
        console.log('DONE');
        process.exit();
        }
        catch(e)
        {
            console.log(e)
        }
}

mongoose.connect(process.env.DB_URL).then(()=> {

    console.log("connected to db")


    if(process.argv[2]==="--delete")
{
    deleteData();
}

if(process.argv[2]==="--import")
{
    importData();
}
   
}).catch((e)=>console.log(e));






// deleteData();
// importData();

console.log(process.argv);

// if(process.argv[2]==="--delete")
// {
//     deleteData();
// }

// if(process.argv[2]==="--import")
// {
//     importData();
// }