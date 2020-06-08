const AppError = require('./../utils/appError');
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}:${err.value}`;
    return new AppError(message, 404);
}
const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    //console.log(value);
    const message = `Duplicate field value : ${value} please use another value!`;
    return new AppError(message, 400);
}
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message).join('. ');
    const message = `Invalid input. ${errors}`;
    return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token. Please log in again', 401); // one line auto return
const handleJWTExpiredError = () => new AppError('Your token has expired! please login again', 401)

const sendErrorDev = (err, req, res) => {
    //api
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }
    //render website
    console.error("ERROR ", err);
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    })
}
const sendErrorProd = (err, req, res) => {
    //A) API
    if (req.originalUrl.startsWith('/api')) {
        // Operational, trusted error : send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
            // programming or other unknown error: don't leak error details
        }
        //1) log error
        console.error("ERROR ", err);
        //2) send generic message
        return res.status(500).json({
            status: 'error',
            message: 'something went very wrong'
        })

    }

    // B) render web
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        })
        // programming or other unknown error: don't leak error details
    }
    //1) log error
    console.error("ERROR ", err);
    //2) send generic message
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.'
    });
}
module.exports = (err, req, res, next) => {
    //console.log(err.stack); // vi tri err

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = {
            ...err
        };
        error.message = err.message;
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
        sendErrorProd(error, req, res);
    }

}