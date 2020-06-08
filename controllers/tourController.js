const Tour = require('./../models/tourModel.js');
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('not an image! please upload only image', 400), true);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})
exports.uploadTourImages = upload.fields([{
        name: 'imageCover',
        maxCount: 1
    },
    {
        name: 'images',
        maxCount: 3
    }
]);
//upload.single('imageCover') req.file
// upload.array('images',5)   req.files
exports.resizeTourImages = async (req, res, next) => {
    console.log(req.files);
    if (!req.files.imageCover || !req.files.images) return next();
    // 1) cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({
            quality: 90
        })
        .toFile(`public/img/tours/${req.body.imageCover}`);
    // 2) images
    req.body.images = [];
    await Promise.all(
        req.files.images.forEach(async (file, i) => {
            const fileName = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({
                    quality: 90
                })
                .toFile(`public/img/tours/${fileName}`);
            req.body.images.push(fileName);    
        }));
    next();
}
exports.aliasTopTour = (req, res, next) => {
    req.query.sort = "-price";
    req.query.fields = 'name,price,ratingsAverage,summary';
    req.query.page = "1";
    req.query.limit = "5";
    next();
};

exports.getAllTour = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, 'reviews');
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);

//exports.deleleTour = factory.deleteOne(Tour);
// console.log(typeof(factory.deleteOne(Tour)));
// console.log(typeof (this.deleleTour))

exports.deleteTour = catchAsync(async (req, res, next) => {
    //try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
        return next(new AppError('no tour found ID', 404));
        // return tra ve ngay khong di den cac next tiep theo
    }
    res.status(204).json({
        status: 'success',
        data: `delete + ${req.params.id}`
    })
    // } catch (error) {
    //     res.status(404).json({
    //         status: 'fail',
    //         message: error
    //     })
    // }
});
exports.getTourStats = catchAsync(async (req, res, next) => {
    //try {
    const stats = await Tour.aggregate([{
            $match: {
                ratingsAverage: {
                    $gte: 4.5
                },
                // secretTour: {
                //     $ne: true
                // }
            }
        },
        {
            $group: {
                '_id': {
                    $toUpper: "$difficulty"
                },
                'numTours': {
                    $sum: 1
                },
                'numRatings': {
                    $sum: '$ratingsQuantity'
                },
                'avgRating': {
                    $avg: '$ratingsAverage'
                },
                'avgPrice': {
                    $avg: '$price'
                },
                'minPrice': {
                    $min: '$price'
                },
                'maxPrice': {
                    $max: '$price'
                }
            }
        }
        // {
        //     $sort: {
        //         avgPrice: 1
        //     }
        // }
        //  {
        //     $match: {
        //         _id: {
        //             $ne: 'EASY'
        //         }
        //     }
        // }
    ]);
    //console.log(stats);

    res.status(200).json({
        status: 'success',
        data: {
            "length": stats.length,
            stats
            //Tour
        }
    })

    // } catch (error) {
    //     res.status(404).json({
    //         status: 'fail',
    //         message: error
    //     });
    // };
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    //try {
    const year = req.query.year * 1;
    const plan = await Tour.aggregate([{
            $unwind: '$startDates'
        },
        { // $match tren $unwind la sai (code match ngu !!)
            $match: { // same find
                startDates: { // tim kiem trong key startDates
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                },

                // secretTour: {
                //     $ne: true
                // }
            }
        },
        {
            $group: {
                _id: {
                    $month: "$startDates",
                },
                count: {
                    $sum: 1 //"The field '$sum' must be an accumulator object"
                },
                nameAndDay: {
                    $push: {
                        //    name:"$name", $dayOfMonth: "$startDates"
                        name: "$name",
                        day: {
                            $dayOfMonth: '$startDates'
                        }
                    }
                },
                // month:"$_id" //khong duoc su dung nhu vay 
                // field month must be an accumulator object

            }
        },
        {
            $addFields: {
                month: '$_id'
            } // add vao group
        },
        {
            $project: {
                _id: 0
            }
        }, {
            $sort: {
                count: -1
            }
        }, {
            $limit: 5
        }
        // khong de 2 group
        // {
        //     $group:{
        //         _id: {
        //             $dayOfMonth: "$startDates",
        //         }
        //     }
        // }
    ]);
    res.status(200).json({
        status: 'success',
        length: plan.length,
        data: {
            plan
        }
    })
    // } catch (error) {
    //     res.status(404).json({
    //         status: 'fail',
    //         message: error
    //     });
    // }
});

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/distance=233/center=-40,45/unit=mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const {
        distance,
        latlng,
        unit
    } = req.params;
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    if (!lat || !lng) {
        next(new AppError('please provide lat and lng', 400));
    }
    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [
                    [lng, lat], radius
                ]
            }
        }
    });
    res.status(200).json({
        status: 'success',
        length: tours.length,
        data: {
            data: tours
        }
    })
})

exports.getDistances = catchAsync(async (req, res, next) => {
    const {
        latlng,
        unit
    } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    if (!lat || !lng) {
        next(new AppError('please provide lat and lng', 400));
    }
    const distances = await Tour.aggregate([{
        $geoNear: {
            near: {
                type: 'point',
                coordinates: [lng * 1, lat * 1]
            },
            distanceField: 'distance',
            distanceMultiplier: multiplier
        }
    }, {
        $project: {
            distance: 1,
            name: 1
        }
    }]);
    res.status(200).json({
        status: 'success',
        length: distances.length,
        data: {
            data: distances
        }
    })
})

//----------------------------------------------------------------------//
// exports.updateTour = catchAsync(async (req, res, next) => {
//     //try {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true
//     });
//     if (!tour) {
//         return next(new AppError('no tour found ID', 404));
//         // return tra ve ngay khong di den cac next tiep theo
//     }
//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour
//         }
//     })
//     // } catch (error) {
//     //     res.status(400).json({
//     //         status: 'fail',
//     //         message: error
//     //     })
//     // }
// });
//-----------------------------------------------------------------------//
// exports.createTour = catchAsync(async (req, res, next) => {
//     // try {
//     const newTour = await Tour.create(req.body)
//     res.status(201).json({
//         status: 'success',
//         data: {
//             tour: newTour
//         }
//     });
//     // } catch (error) {
//     //     res.status(400).json({
//     //         status: 'fail',
//     //         message: error
//     //     })
//     // }
// });
//--------------------------------------------------------//
// exports.getTour = catchAsync(async (req, res, next) => {
//     //try {
//     const tour =  await Tour.findById(req.params.id).populate('reviews');
//     // Tour.findOne({_id:req.params.id})

//     if (!tour) {
//         return next(new AppError('no tour found ID', 404));
//         // return tra ve ngay khong di den cac next tiep theo
//     }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour
//         }
//     });
//     // } catch (error) {
//     //     res.status(400).json({
//     //         status: 'fail',
//     //         message: error
//     //     })
//     // }
// });
//----------------------------------------------------------------//
// exports.getAllTour = catchAsync(async (req, res, next) => {
//     //try {
//     const features = new APIFeatures(Tour, req.query).filter().sort().limitFields().paginate();
//     const tours = await features.query;
//     //const tours = await query;
//     res.status(200).json({
//         status: 'success',
//         length: tours.length,
//         data: {
//             tours
//         }
//     });
//     // } catch (error) {
//     //     res.status(404).json({
//     //         message: error
//     //     })
//     // }
// });