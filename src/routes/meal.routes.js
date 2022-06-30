const express = require("express");
const router = express.Router();
const mealController = require("../controllers/meal.controller");
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
  // mealController.checkAuthority,
  mealController.validateMealCreation,
  mealController.updateMealById
);
router.get("/api/meal/:mealId", mealController.getMealById);
router.delete(
  "/api/meal/:mealId",
  validateToken,
  mealController.checkAuthority,
  mealController.deleteMeal
);

module.exports = router;
