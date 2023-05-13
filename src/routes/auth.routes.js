const express = require('express');
const router = express.Router();
const authController = require('../controller/auth.controller');

// UC-101: Log in a user
router.post('/login', authController.validateLogin, authController.login);

module.exports = router;
