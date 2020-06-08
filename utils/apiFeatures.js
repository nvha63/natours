const Tour = require('./../models/tourModel.js');
class APIFeatures {
    constructor(query, queryString) { //query == Tour ||  queryString == req.query
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        const queryObj = {
            ...this.queryString
        };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => {
            delete queryObj[el];
        })
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); // NOTE!!
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('createAt');
        }
        return this;
    }
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.replace(/\,/g, ' ');
            //  const fields = req.query.fields.split(",").join(' ');           
            this.query = this.query.select(fields);
            //http://localhost:3000/api/v1/tours?fields=name,price
        } else {
            this.query = this.query.select('-__v'); // delete versionKey => production :))
            //     // khi khong biet information gi thi phai show het ra
            //     //http://localhost:3000/api/v1/tours?fields
        }
        return this;
    }
    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        const numTours = Tour.countDocuments(); // this.query la ko dc vi loc mat bot roi <3
        this.query = this.query.skip(skip).limit(limit);
        if (skip > numTours) {
            throw ("this page doesn't exist");
        }
        return this;
    }
}
module.exports= APIFeatures;
  // // 1A) FILTERING
  // const queryObj = {
  //     ...req.query
  // };
  // const excludedFields = ['page', 'sort', 'limit', 'fields'];
  // excludedFields.forEach(el => {
  //     delete queryObj[el];
  // })
  // console.log(req.query);

  // // 1B) ADVANCED FILTERING
  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); // NOTE!!
  // //console.log(JSON.parse(queryStr));
  // let query = Tour.find(JSON.parse(queryStr));
  // //http://localhost:3000/api/v1/tours?sort=price&limit=2&ratingsAverage[$gte]=4.8

  // 2) SORTING
  //(co dau tru la sort tu lon den be) http://localhost:3000/api/v1/tours?sort=price,-ratingsAverage
  // if (req.query.sort) {
  //     const sortBy = req.query.sort.split(',').join(' ');
  //     //console.log(sortBy);
  //     query=query.sort(sortBy);
  // } else {
  //     query=query.sort('createAt');
  // }
  // // 3) FIELD limiting
  // if (req.query.fields) {
  //     const fields = req.query.fields.replace(/\,/g, ' ');
  //     //  const fields = req.query.fields.split(",").join(' ');           
  //     query.select(fields);
  //     //http://localhost:3000/api/v1/tours?fields=name,price
  // } else {
  //     query.select('-__v'); // delete versionKey => production :))
  //     // khi khong biet information gi thi phai show het ra
  //     //http://localhost:3000/api/v1/tours?fields
  // }
  // // 4) pagination
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 100;
  // const skip = (page - 1) * limit;
  // if (req.query.page && req.query.limit) {
  //     query.skip(skip).limit(limit);
  //     const numTours = await Tour.countDocuments();
  //     if (skip > numTours) {
  //         //console.log("error");
  //         throw ("this page doesn't exist"); //?????
  //     }
  // }