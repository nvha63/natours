const Tour = require('../models/tourModel')
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
exports.getOverview = catchAsync(async (req, res, next) => {
    //1) get tour data from collection
    const tours = await Tour.find();
    //2) build template
    //3) render that template using tour data from 1)
    res.status(200).render('overview', {
        title: 'All tour',
        tours
    })
})
exports.getTour = catchAsync(async (req, res, next) => {
    // 1) get the data, for the requested tour (including reviews and guides)
    const tour = await Tour.findOne({
        slug: req.params.slug
    }).populate({
        path: 'reviews',
        fields: 'review rating user'
    })
    if (!tour) {
        return next(new AppError('There is no tour with that name', 404));
    }
    //2) build template

    //3) render template using data from 1)
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    })
})

exports.formLogin = catchAsync(async (req, res, next) => {
    res.status(200).render('login', {
        title: 'login',
    })
});

exports.getAccount = catchAsync(async (req, res) => {
    res.status(200).render('account', {
        title: 'Your account'
    })
});
exports.getMyTour = catchAsync(async (req, res, next) => {
    // 1) find all bookings
    const bookings = await Booking.find({
        user: req.user.id
    })
    //2) find tours with the returned IDs
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({
        _id: {
            $in: tourIDs
        }
    })
    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    })
})
exports.updateUserData = catchAsync(async (req, res, next) => {
    console.log(req.body);

    const user = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    })
    res.status(200).render('account', {
        title: 'Your account',
        user
    });
});