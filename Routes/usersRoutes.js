const express = require("express");

const userController = require("../controllers/userController.js")
const authController = require("../controllers/authController.js")

const router = express.Router();


router.route("/signup").post(authController.signup);
router.route("/login").post( authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.patch("/updateMe",authController.protect, userController.updateMe)

router.patch("/updatePassword", authController.updatePassword);

router.route("/").get(userController.getAllUsers);
router.route("/:id").get(userController.getUserById).patch(userController.updateUserById).delete(userController.deleteUser);


module.exports = router