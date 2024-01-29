const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
// const { validate } = require("./tourModel");

const bcrypt  = require("bcrypt");


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please tell us your name"]
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    photo:String,
    role:{
        type:String,
        enum:['user', 'guide', 'tour-guide', 'admin'],
        default:"user"
    },
    password:{
        type:String,
        required:[true,"Please provide a password"],
        minlength: 8,
    },
    passwordConfirm:{
        type: String,
        required:[true,"Please confirm your password"],
        validate:{
            validator: function(val){
                return val===this.password
            }
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires:Date
})

userSchema.pre("save", async function(next){
    console.log('Saving the User');
    if(!this.isModified("password"))
        return next();
    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm=undefined;

    next();

})

userSchema.pre("save", function(next){
    if(!this.isModified("password")||!this.isNew){
        return next()
    }

    this.passwordChangedAt= Date.now()-1000; //subtracting one second so that token is generated before the save method is called
    next();
})

userSchema.methods.correctPassword = async function(password, hashedzpassword){
    return await bcrypt.compare(password, hashedzpassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimeStamp)
{
    if(this.passwordChangedAt)
    {
        console.log(this.passwordChangedAt.getTime()/1000, JWTTimeStamp)
        if(parseInt(this.passwordChangedAt.getTime()/1000,10)>JWTTimeStamp)
        return true;
    }
    

    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest("hex");

    this.passwordResetExpires = Date.now()+ 10*60*1000;

    return resetToken;
}

const User = mongoose.model("User", userSchema);
module.exports = User;