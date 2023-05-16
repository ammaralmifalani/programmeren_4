const express = require('express');
const authRouter = express.Router();
const authController = require('../controller/auth.controller');

// UC-101: Log in a user
authRouter.post('/login', authController.validateLogin, authController.login);

module.exports = authRouter;
