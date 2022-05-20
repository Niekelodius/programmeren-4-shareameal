const express = require("express");
// const { mealFinder } = require("../controllers/meal.controller");
const router = express.Router();
const mealController = require("../controllers/meal.controller");
const authController = require("../controllers/auth.controller");
const { validateToken } = require("../controllers/auth.controller");

router.get("/api/meal", mealController.getMeals);

router.post(
  "/api/meal",
  validateToken,
  mealController.validateMealCreation,
  mealController.addMeal
);
router.put(
  "/api/meal/:mealId",
  validateToken,
  mealController.validateMealCreation,
  mealController.updateMealById
);
router.get(
  "/api/meal/:mealId",
  mealController.getMealById
);
router.delete(
  "/api/meal/:mealId",
  validateToken,
  mealController.deleteMeal
);
router.get( 
  "/api/meal/:mealId/participate",
  mealController.validateMealCreation,
  mealController.updateMealById
);



// router.put(
//   "/api/user/:userId",
//   userController.userFinder,
//   userController.validateUser,
//   userController.editUser
// );

// router.get("/api/user/profile", userController.getProfile);

// router.get(
//   "/api/user/:userId",
//   authController.validateToken,
//   userController.userFinder,
//   userController.getUserById
// );

// router.delete(
//   "/api/user/:userId",
//   userController.userFinder,
//   userController.deleteUser
// );

// router.get("/api/user", userController.getAllUsers);

module.exports = router;
