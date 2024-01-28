const User = require("../Models/userModel");
const catchAsync = require("../catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../apiError");
const {promisify} = require("util");

exports.signup = catchAsync(async(req,res,next)=>{

    // console.log(process);

    console.log("first")
    const newUser = await User.create(req.body);
    // const newUser = await User.create({
    //     name: req.body.name,
    //     email: req.body.email,
    //     password: req.body.password,
    //     passwordConfirm:req.body.passwordConfirm
    // })
    console.log(newUser,"newUser");

    const token = jwt.sign({id:newUser._id}, process.env.SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })

    res.status(200).json({
        status:"success",
        token,
        data:{
            user:newUser
        }

    })

})

const signToken = id=>{
    return jwt.sign({id: id}, process.env.SECRET,{
        expiresIn : process.env.JWT_EXPIRES_IN
    })
}

exports.login = catchAsync(async(req,res,next)=>{
    const {email,password} = req.body;

    if(!email&&!password)
    return next(new AppError("Please provide email and password fields", 400));
    //Use return so that login function end executing from here


    const user = await User.findOne({email});
    // if(!user)
    // {
    //     return next(new AppError("Signup first"), 400);
    // }

    // const correct = await user.correctPassword(password, user.password);

    if(!user||!await user.correctPassword(password, user.password))
    {
        return next(new AppError("Incorrect email or passowrd"), 401);
    }

    const token = signToken(user._id)

    // const token = "dskjhj";

    res.json({
        status:'Logged In',
        token
    })

})

exports.protect = catchAsync(async(req, res, next)=>{
    let token ;

    // console.log(req.headers)

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer"))
    {
        token  = req.headers.authorization.split(" ")[1];
        console.log(token)
    }

    if(!token)
    {
        return next(new AppError("Please login to get access"), 401)
    }

    const decoded = await promisify(jwt.verify)(token, process.env.SECRET)
    console.log(decoded,"decoded token");

    const freshUser  = await User.findById(decoded.id);


    if(!freshUser)
    {
        return next(new AppError("The user blonging to this token no longer exist", 401));
    }


    if(freshUser.changedPasswordAfter(decoded.iat))
    {
        return next(new AppError("Passwoord Changed ! Kindly login again"))
    }


    req.user = freshUser;

    next()
})


exports.restrictTo = (...roles)=>{
    console.log("first")

return (req,res,next)=>{
    console.log("second")
    console.log(req.user,"hrllo")
    if (!roles.includes(req.user.role)){
        return next(new AppError('You are not authorized to perform this action', 403))
}
    next()
}
}

exports.forgotPassword = catchAsync(async(req,res,next)=>{

    //Get user based on email
    //Generate the random rest token
    //send it to users email

    console.log("Reset your password")

    const user = await User.findOne({email:req.body.email});

    if(!user)
    {
        next(new AppError("No user found with this email"),404)
    }

    const resetPasswordToken = user.createPasswordResetToken();

    await user.save({validateBeforeSave:false});

    res.json(resetPasswordToken);


})

exports.resetPassword = (req,res,next)=>{

}