const express = require("express");
const router = express.Router();
const sessionController = require("./session.controller");
const authMiddleware = require("../../core/middleware/auth.middleware");

router
.route("/")
.get(authMiddleware.protect, sessionController.getMySessions)
.delete(authMiddleware.protect, sessionController.revokeAllSessions);

router
.route("/:id")
.delete(authMiddleware.protect, sessionController.revokeSession);

module.exports = router;
