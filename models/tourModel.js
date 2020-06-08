const mongoose = require('mongoose');
const slugify = require('slugify');
//const User = require('./userModel');
//const validator = require('validator');
const tourSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, "A tour must have name"],
            unique: true,
            trim: true,
            maxlength: [40, 'A tour name must have less or equal then 40 characters'],
            minlength: [10, 'A tour name must have more or equal then 10 characters'],
            // validate: [validator.isAlpha,'tour name must only contain characters']
        },
        slug: String,
        duration: {
            type: String,
            required: [true, "A tour must have a duration"]
        },
        maxGroupSize: {
            type: Number,
            required: [true, "A tour must have a group size"]
        },
        difficulty: {
            type: String,
            required: [true, "A tour must have a difficulty"],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'difficulty is either: easy,medium,difficult'
            }
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
            set:val => Math.round(val)
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            required: [true, "a tour must have price"]
        },
        priceDisscount: {
            type: Number,
            validate: {
                validator: function (valueDisscount) {
                    // this only points to current doc on NEW document creation | not update
                    return valueDisscount < this.price;
                },
                message: 'disscount price ({VALUE}) should be below regular price'
            }
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'a tour must have a description']
        },
        description: {
            type: String,
            trim: true
        },
        imageCover: {
            type: String,
            required: [true, 'a tour must have a cover image']
        },
        images: [String],
        createAt: {
            type: Date,
            default: Date.now(),
            select: false // hide createAt
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false
        },
        startLocation: {
            // GeoJSON
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String
        },
        locations: [{
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }],
        guides: [{
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }],
        // reviews:[
        //     {
        //         type:mongoose.Schema.ObjectId,
        //         ref:'Review'
        //     }
        // ]
    },

    { // it's not save in database
        toJSON: { // res.json and not save in database
            virtuals: true
        },
        toObject: { // support for console.log();
            virtuals: true
        }
    }
);

tourSchema.index({price:1,ratingsAverage:-1});
tourSchema.index({slug:1});
tourSchema.index({startLocation:'2dsphere'})
tourSchema.virtual('durationWeeks').get(function () { // hien thi ra ngoai, db ko co
    return this.duration / 7;
})
// virtual populate
tourSchema.virtual('reviews', { //?
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
    //Mongoose will populate documents from the model in ref whose foreignField matches this document 's localField.
})
// DOCUMENT MIDDLEWARE: run before .save() and .create() | not update
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {
        lower: true
    })
    //this.slug= this.name.split(' ').join('-').toLowerCase();// not use npm slugify
    //console.log("ok");
    // create add slug
    // this refer current document
    next();
});

// tourSchema.pre('save',async function (next){
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// })
// tourSchema.pre('save',function (next){
//        console.log("will save document......");
//        next();
// })

// tourSchema.post('save',function (doc,next){
//     console.log(doc);
//     next();
// })
//QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) { // bat dau bang find
    //tourSchema.pre('find',function (next){
    //console.log(this);
    // this refer current query
    this.find({
        secretTour: {
            $ne: true
        }
    }) // khong hien thi ra ngoai, db co
    next(); //thay $ne:false sai 
})

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
})

tourSchema.post(/^find/, function (docs, next) {
    //console.log(docs.length);
    next();
})
//  AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//     //this refer current aggregation 
//     // call on postman, route nao thi tra ve aggregate cua cai y
//     // tour-stats || monthly plan
//     this.pipeline().unshift({
//         $match: {
//             secretTour: {
//                 $ne: true
//             }
//         }
//     })
//     // console.log(this.pipeline()[0]);
//     // co the lam o tourController
//     next();
// })
const Tour = mongoose.model('Tour', tourSchema); //collection

module.exports = Tour;