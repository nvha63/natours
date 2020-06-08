//const fs = require('fs');
const Tour = require('./../models/tourModel.js');
//const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));
// exports.checkID = (req, res, next, val) => {
//     console.log(val);
//     if (req.params.id > tours.length) {
//         return res.status(404).json({
//             status: "fail",
//             message: "invaild ID"
//         });
//     };
//     next();
// };
// exports.checkBody = (req, res, next) => { // them val vao khong chay dc
//     if (!req.body.name || !req.body.price) {
//         return res.status(400).json({
//             status: "fail",
//             message: "missing name or price"
//         });
//     };
//     next();
// }
exports.getAllTour = (req, res) => {
    res.status(200).json({
        status: 'success',
        // length: tours.length,
        // data: {
        //     tours
        // }
    });
};

exports.getTour = (req, res) => {
    const id = req.params.id;
    //const tour = tours.find(ele => ele.id == id);
    res.status(200).json({
        status: 'success',
        // data: {
        //     tour
        // }
    });
}
exports.createTour = (req, res) => {
    // const newId = tours[tours.length - 1].id + 1;
    // const newTour = Object.assign({
    //     id: newId
    // }, req.body);
    // tours.push(newTour);
    // fs.writeFile('./dev-data/data/tours-simple.json', JSON.stringify(tours), err => {
    res.status(201).json({
        status: 'success',
        // data: {
        //     tour: newTour
        // }
    });
    //});
    //console.log(req.body);
}
exports.updateTour = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            tour: 'update'
        }
    })
}
exports.deleteTour = (req, res) => {
    res.status(204).json({
        status: 'success',
        data: null
    })
}