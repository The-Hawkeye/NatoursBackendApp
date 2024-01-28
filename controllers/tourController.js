const express = require("express");
const mongoose = require("mongoose")
// const fs = require("fs");
const Tour = require("../Models/tourModel")

const catchAsync = require("../catchAsync")

// const  toursData = JSON.parse(fs.readFileSync("./dev-data/data/tours-simple.json","utf-8"));
// const toursData = JSON.parse(fs.readFileSync("./dev-data/data/tours-simple.json"))


// exports.checkId = (req,res,next,val)=>{

//     console.log(val,"id from checkId")

//     if(val>toursData.length)
//         return res.status(404).send("Invalid Id");


//     next();
// }







exports.aliasTopTours = (req, res, next) => {

    req.query.limit = "5";
    req.query.sort = "-ratingsAverage,price";
    req.query.fields = "name,price,ratingsAverage,summary,difficulty";



    next();
}


exports.getAllTours = async (req, res) => {
    // res.json({status:"succes", toursData});

    try {

        const queryObj = { ...req.query };

        // console.log(req.query)
        const excludeFields = ["limit", "sort", "page", "fields"];

        excludeFields.forEach((el) => delete queryObj[el])

        console.log(queryObj)
        console.log(req.query.sort)
        //filtering

        let queryStr = JSON.stringify(queryObj);
        console.log(queryStr, "2")

        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);




        // const parsedQuery = await JSON.parse(queryStr);
        // console.log(parsedQuery,"3")





        let data = await Tour.find(JSON.parse(queryStr));


        //sorting
        // console.log(req.query.sort,"hjk")
        if (req.query.sort) {
            console.log(data, "data")
            // data = data.sort(req.query.sort);
            data = data.sort('price')
        }

        // console.log(`${req.query.sort}`)


        //Exevuting query
        // let query  = await data; 

        res.status(200).json(
            {
                status: 'success',
                data: data
            }
        )
    }
    catch (e) {
        res.status(404).json({
            status: 'failed to load data',
            message: e
        })
    }

}



exports.getTourById = (req, res) => {
    // let tourId = req.params.id;
    // const {id} = req.params;
    // console.log(id,"ID from req");


    // let tourById = toursData[id];
    // console.log(tourById);
    // res.json({status:"succes", tourById});
}



exports.postNewTour = catchAsync(async (req, res,next) => {

    const tourData = req.body;
    // console.log(tourData)

    // const newTour  = new Tour(tourData);
    // await newTour.save();
    const newTour = await Tour.create(tourData);

    res.status(201).json(newTour);
    // console.log(req)
    // console.log(req.body);

    // let reqData = req.body;

    // const newId  = toursData[toursData.length-1]+1;

    // const newObj = Object.assign({id:newId, reqData});

    // fs.writeFile("./dev-data/data/addTour.json", JSON.stringify(req.body) ,(err)=>{
    //     if(err)
    //     res.status(400).json({message:"Unable to add"});

    //     console.log("Tour added successfully")
    // })

    // res.json({message:"Tour added successfully", newObj});
})



exports.updateTourById = async (req, res) => {

    try {
        console.log(req.params.id)
        const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true //run the validation for the new data coming
        })

        console.log(updatedTour);
        res.status(201).json({
            status: "Success",
            data: updatedTour
        })
    } catch (e) {
        res.status(400).json({
            status: "Fail",
            message: e
        })
    }
    // const id = parseInt(req.params.id);

    // const {duration} = req.body;


    // let data  = toursData.find(el=> el.id== id);

    // if(!data)
    // res.status(404).json({message:"inavalid id"});

    // let updatedData = {...data, duration}
    // res.status(202).json({updatedData});
}


exports.deleteTourById = async (req, res) => {

    try {
        await Tour.findByIdAndDelete(req.params.id);

        res.status(204).json({ message: "Deleted Successfully" })
    } catch (e) {
        res.json(e.message);
    }

}


exports.getTourStats = async (req, res) => {

    try {
        console.log("first")

        const data = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id: "$difficulty",//returns aggregated results for each dificulty present in the DB
                    numTours: { $sum: 1 },//each time one will be added when a document went through this pipeline
                    numRatings: { $sum: '$ratingsQuantity' },   //add up the
                    averageRating: { $avg: "$ratingsAverage" },
                    avgPrice: { $avg: "$price" },
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" }
                }
            }
        ]);

        console.log(data)


        res.status(200).json(data);
    }
    catch (e) {
        res.json({
            message: "Failed to aggregate",
            Error: e
        })
    }

}


exports.getMonthlyPlan = async (req, res) => {

    try {

        const year = req.params.year * 1;

        const plan = await Tour.aggregate([
            {
                $unwind: "$startDates"
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group:{
                    _id: {
                        $month:"$startDates"
                    },
                    numToursStarts:{$sum:1},
                    tours:{$push:"$name"}
                }
            },
            {
                $addFields:{month:"$_id"}
            },
            {
                $project:{
                    _id:0
                }
            },
            {
                $sort:{
                    numToursStarts:-1  //1 for ascending and -1 for descending
                }
            },
            {
                $limit: 3
            }
        ])



        res.status(200).json({
            status: "success",
            data: plan
        })

    } catch (e) {
        res.status(400).json({
            status: "fail",
            error: e
        })
    }

}


