const express = require("express");

const tourController = require("../controllers/tourController")
const authController = require("../controllers/authController")


const router = express.Router();

// router.param("id",tourController.checkId);
router.route("/status").get(tourController.getTourStats)
router.route("/").get(authController.protect,  tourController.getAllTours).post(tourController.postNewTour);
router.route("/:id").patch(tourController.updateTourById).get(tourController.getTourById).delete(authController.protect, authController.restrictTo('admin',"lead-guide"), tourController.deleteTourById);
router.route("/top-5-tour", tourController.aliasTopTours,tourController.getAllTours);
router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan)

module.exports = router;