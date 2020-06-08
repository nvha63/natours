const express = require('express');
//app.use(express.json());
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
//const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoute');
const router = express.Router();
//router.param('id', checkID);
//router.param("id",(req,res,next,val)=>{
//     console.log(`tour id is ${val}`);
//     next();
// })
//------------------------------------//
//create a checkBody middleware 
// check if body contains the name and price property
//if not, send back 400 (bad request)
// add it to the post handler stack

//router.route('/:tourId/reviews').post(authController.protect,authController.restrictTo('user'),reviewController.createReview)
router.use('/:tourId/reviews', reviewRouter)

//------------------//
router.route('/top-5-cheap').get(tourController.aliasTopTour, tourController.getAllTour);
router.route('/').get(tourController.getAllTour).post(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.createTour);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/').get(authController.protect, authController.restrictTo('admin', 'lead-guide','guide'), tourController.getMonthlyPlan);
//router.route('/:id').get(tourController.getTour).patch(tourController.updateTour).delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/distance=233/center=-40,45/unit=mi

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour
    );
module.exports = router;