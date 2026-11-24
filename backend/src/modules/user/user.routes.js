const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const authMiddleware = require("../../core/middleware/auth.middleware");
const validate = require("../../core/middleware/Validation.js");
const { updateMeSchema, updateUserSchema } = require("./user.validation");

router
.route("/")
.get(authMiddleware.protect, authMiddleware.restrictTo("admin"), userController.getAllUsers)

router
.route("/profile")
.get(authMiddleware.protect, userController.getMe)
.patch(authMiddleware.protect, validate(updateMeSchema), userController.updateMe);

router
.route("/:id")
.get(authMiddleware.protect, authMiddleware.restrictTo("admin"), userController.getUser)
.patch(authMiddleware.protect, authMiddleware.restrictTo("admin"), validate(updateUserSchema), userController.updateUser)
.delete(authMiddleware.protect, authMiddleware.restrictTo("admin"), userController.deleteUser);



module.exports = router;