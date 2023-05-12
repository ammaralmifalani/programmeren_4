const express = require('express');
const mealRouter = express.Router();
const mealController = require('../controller/meal.controller');
const authController = require('../controller/auth.controller');
// UC-201: Register a new meal
mealRouter.post('', authController.validateToken, mealController.createMeal);

// UC-202: Retrieve all meals
mealRouter.get('', mealController.getAllMeals);
//
mealRouter.delete(
  '/:mealId',
  authController.validateToken,
  mealController.deleteMeal
);
module.exports = mealRouter;
