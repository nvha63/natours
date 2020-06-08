const path = require('path');
const express = require('express');
const fs = require('fs');
const app = express();
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp')
const appError = require('./utils/appError.js');
const globalErrorHandler = require('./controllers/errorController');
const tourRoute = require('./routes/tourRoute');
const userRoute = require('./routes/userRoute');
const reviewRoute = require('./routes/reviewRoute');
const bookingRoute = require('./routes/bookingRoute');
const viewRoute = require('./routes/viewRoute');
const cookieParser = require('cookie-parser');
//hello

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//      1)GLOBAL MIDDlEWARES
// serving static files
// app.use(express.static('./public/'));
app.use(express.static(path.join(__dirname, 'public')))
// set security HTTP headers
app.use(helmet())

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
// limit req from same api
const limiter = rateLimit({ // chay lai server la reset lai ve ban dau
    max: 100,
    windowMs: 60 * 60 * 1000, // 100 req/hour
    message: "too many request from this IP, please try again in an hour"
})
app.use('/api', limiter);
// body parser, reading data form into req.body
app.use(express.json({
    limit: '10kb'
}));
app.use(cookieParser());
app.use(express.urlencoded({
    extended: true,
    limit: '10kb'
}))
// data sanitization against nosql query injection
app.use(mongoSanitize());
// data sanitization against XSS
app.use(xss());
// prevent parameter pollution
app.use(hpp({
    whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price']
}));


//  2) ROUTE HANDLERS
app.use((req, res, next) => {
    console.log(req.cookies);
    next();
})


// 3) ROUTES
app.use('/', viewRoute);
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1/bookings', bookingRoute);
app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status:'fail',
    //     message:`Can't find ${req.originalUrl} on this server`
    // })
    // http://localhost:3000/api/tours/
    // {
    //     "status": "fail",
    //     "message": "Can't find /api/tours/ on this server"
    // }

    // const err = new Error(`Can't find ${req.originalUrl} on this server`);// err.message
    // err.status ='fail';
    // err.statusCode = 404;
    // console.log(err);
    next(new appError(`Can't find ${req.originalUrl} on this server`, 404));
    // 

})

app.use(globalErrorHandler)
// 4) START SERVER
module.exports = app;