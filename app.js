
const express = require("express");
const fs = require("fs");
const morgan = require("morgan");
const rateLimit  = require("express-rate-limit")
const helmet = require("helmet");

const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

// const tourRoutes = require("./tourRoutes.js");
const userRoutes = require("./Routes/usersRoutes.js");
const tourRoutes = require("./Routes/tourRoutes.js");
const exp = require("constants");
const globalErrorHandler = require("./errorController.js");
const AppError = require("./apiError.js");



const app  = express();
//Global Middleware

app.use(helmet());

const limiter=  rateLimit({
  max:2,
  windowMs:60*60*100,
  message:"Too many requests from this IP , Please try after some time"
})

app.use("/api", limiter)

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against xss
app.use(xss());


app.use(morgan("hey"));

app.use(express.json({limit:"10kb"}));
//will not parse payload greater than 10kb



app.use(express.static(`${__dirname}/public`));







// app.get("/api/v1/users", getAllUsers )
// app.get("/api/v1/tours", getAllTours)
// app.post("/api/v1/tours", postNewTour)

// app.get("/api/v1/tours/:x",getTourById )
// app.patch("/api/v1/tours/:id",updateTourById );



// app.route("/api/v1/users").get(getAllUsers)
// app.route("/api/v1/users/:id").patch(updateUserById).delete(deleteUser).get(getUserById);

// app.route("/api/v1/tours").get(getAllTours).post(postNewTour);

// app.route("/api/v1/tours/:id").get(getTourById).patch(updateTourById);


app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tours", tourRoutes);


// app.all('*',(req,res,next)=>{
    // res.status(404).json({
    //     status:"Fail",
    //     message:`Cant find ${req.originalUrl} on this server`
    // })

    // const err = new Error(`Cant find ${req.originalUrl} on this server`);
    // err.status= "Fail";
    // err.statusCode = 404;

    // next(`Cant find ${req.originalUrl} on this server`);
    // next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// })
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  });

// app.use((err,req,res,next)=>{

//     console.log(err,"err msg");
//     err.statusCode = err.statusCode||500;
//     err.status = err.status||"error";

//     res.status(err.statusCode).json({
//         status:err.status,
//         message:err.message
//     })
// })

app.use(globalErrorHandler);


module.exports = app;
