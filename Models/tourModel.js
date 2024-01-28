const mongoose = require("mongoose");
const slugify = require("slugify");
const tourSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"A tour must have a name"],
        unique:true
    },
    slug:String,

    secretTour:{
        type:Boolean,
        default:false
    },

    duration:{
        type:Number,
        required:[true,"A tour must have a duration"],

    },
    maxGroupSize:{
        type:Number,
        required:[true,"A tour must have a maximum groip size number"]
    },
    ratingsAverage:{
        type:Number,
        default:4.5 
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    difficulty:{
        type: String,
        required:[true, "A tour must have a difficulty"]
    },
    price:{
        type:Number,
        required:true 
    },
    priceDiscount:{
        type:Number,
        validate: function(val){
            return val<this.price
        }
    },
    summary:{
        type:String,
        trim:true,
        required:true
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,"A tour must have a cover image"]
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now()
    },
    startDates:[Date]
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});


tourSchema.virtual("durationWeeks").get(function(){
    return this.duration/7;
})

tourSchema.pre("save",function(){
    // console.log(this)
    this.slug = slugify(this.name,{lower:true})
})

tourSchema.pre("find", function(next){

this.find({secretTour:{$ne:true}})

    next();
})

tourSchema.pre("aggregate",function(next){
    this.pipeline().unshift({$match:{secretTour:{$ne:true}}});
    next();
})



const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour