const express = require('express');
const mealRouter = express.Router();
const mealController = require('../controller/meal.controller');
const authController = require('../controller/auth.controller');
// UC-201: Register a new meal
mealRouter.post(
  '',
  authController.validateToken,
  mealController.validateMeal,
  mealController.createMeal
);
// UC-202: Retrieve all meals
mealRouter.get('', mealController.getAllMeals);
//
mealRouter.delete(
  '/:mealId',
  authController.validateToken,
  mealController.deleteMeal
);
mealRouter.post(
  '',
  authController.validateToken,
  mealController.validateMeal,
  mealController.createMeal
);
mealRouter.put(
  '/:mealId',
  authController.validateToken,
  mealController.validateMeal,
  mealController.updateMeal
);
mealRouter.get('/:mealId', mealController.getMealById);
// mealRouter.delete(
//   '/:mealId/participate',
//   authController.validateToken,
//   mealController.withdrawFromMeal
// );
mealRouter.post(
  '/:mealId/participate',
  authController.validateToken,
  mealController.participateInMeal
);
mealRouter.get(
  '/:mealId/participants',
  authController.validateToken,
  mealController.getParticipants
);
mealRouter.get(
  '/:mealId/participants/:participantId',
  authController.validateToken,
  mealController.getParticipantById
);

module.exports = mealRouter;
