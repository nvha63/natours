const express = require('express');
const fs = require('fs');
const app = express();
const morgan = require('morgan');
//      1) MIDDlEWARES
app.use(morgan("dev"))
app.use(express.json());
app.use((req, res, next) => {
    console.log("leeeee");
    next();
})
//  2) ROUTE HANDLERS
const tours = JSON.parse(fs.readFileSync('dev-data/data/tours-simple.json'));
const getAllTour = (req, res) => {
    res.status(200).json({
        length: tours.length,
        status: 'success',
        data: {
            tours
        }
    });
};
const getTour = (req, res) => {
    const id = req.params.id;
    console.log(req.params);
    const tour = tours.find(ele => ele.id == id);
    if (!tour) {
        return res.status(404).json({
            status: "fail",
            message: "invaild ID"
        })
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });

}
const createTour = (req, res) => {
    const id = req.params.id;
    console.log(req.params);
    const tour = tours.find(ele => ele.id == id);
    if (!tour) {
        return res.status(404).json({
            status: "fail",
            message: "invaild ID"
        })
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
}
const updateTour = (req, res) => {
    if (req.params.id > tours.length) {
        return res.status(404).json({
            status: "fail",
            message: "invaild ID"
        })
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour: 'update'
        }
    })
}
const deleteTour = (req, res) => {
    if (req.params.id > tours.length) {
        return res.status(404).json({
            status: "fail",
            message: "invaild ID"
        })
    }
    res.status(204).json({
        status: 'success',
        data: null
    })
}
// app.get('/api/v1/tours', getAllTour);
// app.get('/api/v1/tours/:id',getTour);
// app.post('/api/v1/tours',createTour);
// app.patch('/api/v1/tours/:id',updateTour);
// app.delete('/api/v1/tours/:id',deleteTour);
// 3) ROUTES
app.route('/api/v1/tours').get(getAllTour).post(createTour);
app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour);
//================GET ALL TOUR============//
// app.get('/api/v1/tours', (req, res) => {
//     res.status(200).json({
//         length: tours.length,
//         status: 'success',
//         data: {
//             tours
//         }
//     });
// });
//============= GET TOUR =======///
// app.get('/api/v1/tours/:id', (req, res) => {
//     const id = req.params.id;
//     console.log(req.params);
//     //tìm và trả về 1 tour// return ele.id==req.params.id
//     const tour = tours.find(ele => ele.id == id);
//     // if (id>tours.length) {
//     if (!tour) {
//         return res.status(404).json({
//             status: "fail",
//             message: "invaild ID"
//         })
//     }
//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour
//         }
//     });
// });
//===============CREATE==============//
//tạo thêm tour mới
// app.post('/api/v1/tours', (req, res) => {
//     //console.log(req.body);
//     const newId = tours[tours.length - 1].id + 1;
//     const newTour = Object.assign({
//         id: newId
//     }, req.body);
//     tours.push(newTour);
//     fs.writeFile('dev-data/data/tours-simple.json', JSON.stringify(tours), err => {
//         res.status(201).json({
//             status: 'success',
//             data: {
//                 tour: newTour
//             }
//         });
//     });
// });
//==============UPDATE============//
// app.patch('/api/v1/tours/:id', (req,res)=>{
//     if (req.params.id>tours.length) {
//         return res.status(404).json({
//             status: "fail",
//             message: "invaild ID"
//         })
//     }
//     res.status(200).json({
//         status:'success',
//         data: {
//             tour: 'update'
//         }
//     })
// });

//================= DELETE==============//
// app.delete('/api/v1/tours/:id', (req, res) => {
//     if (req.params.id > tours.length) {
//         return res.status(404).json({
//             status: "fail",
//             message: "invaild ID"
//         })
//     }
//     res.status(204).json({
//         status: 'success',
//         data: null
//     })
// });

// 4) START SERVER
app.listen(3000, () => {
    console.log("running!!!");
});