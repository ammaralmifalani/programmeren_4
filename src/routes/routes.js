const express = require('express');
const userRouter = express.Router();
const userController = require('../controller/userController');
const authController = require('../controller/auth.controller');
// UC-201: Register a new user
userRouter.post('/register', userController.createUser);
// UC-202: Retrieve all users
userRouter.get('', userController.getAllUsers);
// UC-203: Retrieve a user's profile information
userRouter.post('/profile',userController.getUserProfile);
// UC-204: Retrieve a user's information and associated meals by user ID
userRouter.get('/:id', userController.getUserById);
// UC-205: Update a user's information
userRouter.put('/update', userController.updateUser);
// UC-206: Delete a user
userRouter.delete('/delete', userController.deleteUser);
// UC-101: Log in a user
userRouter.post('/login', authController.validateLogin, authController.login);
// Export the router with all the defined routes
module.exports = userRouter;
