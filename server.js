const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({
    path: './config.env'
});
// CATCHING UNCAUGHT EXCEPTIONS
// bat duoc ca loi trong middleware
process.on('uncaughtException', err => {
    console.log('UNHANDLED exception !!');
    console.log(err);
    process.exit(1);
})
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    //console.log(con.connections);
    console.log("DB connection successful !");

})
//console.log(process.env);

const app = require('./app.js');
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log("running!!!");
});
// ERROR OUTSIDE EXPRESS UNHANDLED REJECTION
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION !!');
    console.log(err);
    server.close(() => {
        process.exit(1);
    })
})

// console.log(z);