const express = require('express');
const router = express.Router();
const userRoutes = require('../modules/user/user.routes.js');

router.use("/users", userRoutes)

module.exports = router;