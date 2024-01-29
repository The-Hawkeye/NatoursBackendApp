const User = require("../Models/userModel");
const catchAsync = require("../catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../apiError");
const {promisify} = require("util");

const sendEmail = require("../email");
const crypto = require("crypto")

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

    res.cookie('jwt',token,{
        expires:new Date(Date.now()+ 90*24*60*60*1000),
        secure:true,
        httpOnly:true
    })

    newUser.password= undefined//removing password from output so not saving in mongoDb

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

    res.cockie('jwt',token,{
        expires:new Date(Date.now()+ 90*24*60*60*1000),
        secure:true,
        httpOnly:true
    })

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

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetPasswordToken}`

    // res.json(resetPasswordToken);

    const message = `Forgot password ? Submit a patch request with new password and confirmPassword to : ${resetUrl}\n If you done , ignore this email`;

    await sendEmail({
        email:user.email,
        subject:"Your password reset token (Valid for 10 min)",
        message
    })


    res.json({
        status:'success',
        message:`A reset token has been sent to ${user.email}.\nPlease make sure you copy the whole token.`
    })



})

exports.resetPassword = catchAsync(async(req,res,next)=>{
    //get user based on token 
    //if token is not expired and there is user , set the new password
    //update changed passwordAT property
    //log the user , send JWT

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    console.log(hashedToken+" "+req.params.token);

     const user = await User.findOne({passwordResetToken:hashedToken, passwordResetExpires:{$gt:Date.now()}})

     if(!user)
     {
        return next(new AppError("Incorrect token or it is expired"),401)
     }

    // const user = await User.findOne({passwordResetToken:hashedToken})

    // user.passwordResetExpires.getMilliseconds()>Date.now().getMilliseconds()

    // if(!user||user.passwordResetExpires.getTime()<new Date().getTime())
    // {
    //     return next(new AppError("No username or reset password token is expired"),401)
    // }
    // console.log(user.passwordResetExpires.getTime());
    // console.log(new Date().getTime())

    // if(req.body.password!=req.body.passwordConfirm)
    // {
    //     return next(new AppError("Passwrods Do not match"),404)
    // }


    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    // user.passwordChangedAt = new Date() . Done in model using pre method
    user.passwordResetToken=undefined;
    user.passwordResetExpires= undefined;
    console.log(user,"user");

    await user.save();

    const token = signToken(user._id)



    res.json(token)
})


exports.updatePassword = catchAsync(async(req,res,next)=>{
    
    console.log(req.headers.authorization.split(" ")[1])

    const userToken = jwt.verify(req.headers.authorization.split(" ")[1], process.env.SECRET);
    console.log(userToken,"user data from token")

    let user = await User.findById(userToken.id);

    console.log(await user.correctPassword(req.body.password, user.password));

    if(!await user.correctPassword(req.body.password, user.password))
    {
        return next(new AppError("Wrong password",401))
    }

    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    const token  = signToken(user.id);



    // let user = await User.findOne({password:req.body.password});

    // if(!user)
    // {
    //     return next(new AppError("Wrong password"),401)
    // }


    res.json({
        status:"success",
        message :"Password updated!",
        token
    });


})