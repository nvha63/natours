const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({
    path: './config.env'
});
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');
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
//READING JSON FILE
const tour = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf8'));
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf8'));
const review = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf8'));
//IMPORT DATA INTO DB
const importData = async () => {
    try {
        await Tour.create(tour);
        await User.create(user,{validateBeforeSave:false});
        await Review.create(review);
        console.log("data successfully loaded!!");
        process.exit();
    } catch (err) {
        console.log(err);
    }
}
//DELETE ALL DATA FROM DB
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("successfully delete");
        process.exit(); //stop run application
    } catch (error) {
        console.log(err);
    }
}
if (process.argv[2]==="import") {
    importData();
}
else if(process.argv[2]==="delete"){
    deleteData();
}
