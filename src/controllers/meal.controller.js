const assert = require("assert");
const jwt = require("jsonwebtoken");
const pool = require("../../database/dbConnection");
const logger = require("../config/config").logger;

let mealController = {
  validateMealCreation: (req, res, next) => {
    const meal = req.body;

    let {
      name,
      description,
      isActive,
      isVega,
      isVegan,
      isToTakeHome,
      dateTime,
      imageUrl,
      maxAmountOfParticipants,
      price,
      allergenes,
    } = meal;

    logger.debug("Raw mealdata: " + meal);
    try {
      assert(typeof name == "string", "Name must be filled in and a string");
      assert(
        typeof description == "string",
        "Description must be filled in or a string"
      );
      assert(typeof isActive == "boolean", "Must be a boolean");
      assert(typeof isVega == "boolean", "Must be a boolean");
      assert(typeof isVegan == "boolean", "Must be a boolean");
      assert(typeof isToTakeHome == "boolean", "must be a boolean");
      assert(typeof dateTime == "string", "Must be a string");
      assert(typeof imageUrl == "string", "Must be a string");
      assert(typeof allergenes == "object", "Must be an object/array");
      assert(typeof maxAmountOfParticipants == "number", "Must be a number");
      assert(typeof price == "number", "Must be a number");
      logger.debug("Validation complete");
      next();
    } catch (error) {
      logger.debug("Validation failed");
      logger.error(error);
      const err = {
        status: 400,
        message: error.message,
      };
      next(err);
    }
  },

  checkAuthority: (req, res, next) => {
    const auth = req.headers.authorization;
    const token = auth.substring(7, auth.length);
    const encodedLoad = jwt.decode(token);
    const mealId = req.params.mealId;
    const userId = encodedLoad.userId;
    let cookId;
    pool.query(
      `SELECT cookId FROM meal WHERE id = ${mealId};`,
      function (error, results, fields) {
        cookId = results[0].cookId;
      }
    );
    pool.query(
      `SELECT roles FROM user WHERE id = ${userId};`,
      function (error, results, fields) {
        if (!(cookId === userId || results[0].roles === "editor")) {
          logger.debug(
            "UserId: " +
              userId +
              " cookId: " +
              cookId +
              " user roles: " +
              results[0].roles
          );
          const err = {
            status: 403,
            message: "Unauthorized",
          };
          next(err);
        } else {
          logger.info("User authorized");
          next();
        }
      }
    );
  },

  getMeals: (req, res) => {
    pool.query("SELECT * FROM meal;", function (error, results, fields) {
      if (error) throw error;

      logger.debug("Amount of meals: " + results.length);
      res.status(200).json({
        status: 200,
        result: results,
      });
    });
  },

  addMeal: (req, res, next) => {
    let meal = req.body;
    const auth = req.headers.authorization;
    const token = auth.substring(7, auth.length);
    const encodedLoad = jwt.decode(token);
    let cookId = encodedLoad.userId;

    meal.isVega = fnConvertBooleanToNumber(meal.isVega);
    meal.isVegan = fnConvertBooleanToNumber(meal.isVegan);
    meal.isToTakeHome = fnConvertBooleanToNumber(meal.isToTakeHome);

    meal.allergenes = meal.allergenes.toString();

    logger.debug("Converted meal data: " + meal);

    pool.query(
      "INSERT INTO meal " +
        "(name, description, isVega, isVegan, isToTakeHome, dateTime, imageUrl, maxAmountOfParticipants, price, allergenes, cookId) " +
        "VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        meal.name,
        meal.description,
        meal.isVega,
        meal.isVegan,
        meal.isToTakeHome,
        meal.dateTime,
        meal.imageUrl,
        meal.maxAmountOfParticipants,
        meal.price,
        meal.allergenes,
        cookId,
      ],
      function (error, results, fields) {
        if (error) {
          logger.debug("Could not add meal: " + meal[0]);
          logger.error(error);
          const err = {
            status: 409,
            message: "Could not add meal",
          };
          next(err);
        } else {
          logger.info("Added meal: " + meal);
          meal.id = results.insertId;
          res.status(201).json({
            status: 201,
            result: meal,
          });
        }
      }
    );
  },

  updateMealById: (req, res, next) => {
    let meal = req.body;
    const currentId = req.params.mealId;

    meal.isActive = fnConvertBooleanToNumber(meal.isActive);
    meal.isVega = fnConvertBooleanToNumber(meal.isVega);
    meal.isVegan = fnConvertBooleanToNumber(meal.isVegan);
    meal.isToTakeHome = fnConvertBooleanToNumber(meal.isToTakeHome);

    logger.info("Converted meal data: " + meal);

    pool.query(
      "UPDATE meal SET name = ? ,description = ?, isActive = ?,isVega = ?,isVegan = ?,isToTakeHome = ?,dateTime = ?,imageUrl = ?,allergenes = ?,maxAmountOfParticipants = ?, price = ? WHERE id = ?;",
      [
        meal.name,
        meal.description,
        meal.isActive,
        meal.isVega,
        meal.isVegan,
        meal.isToTakeHome,
        meal.dateTime,
        meal.imageUrl,
        meal.allergenes,
        meal.maxAmountOfParticipants,
        meal.price,
        currentId,
      ],
      function (error, results, fields) {
        if (error) throw err;
        if (results.affectedRows == 0) {
          const error = {
            status: 404,
            message: "Meal does not exist",
          };
          next(error);
        } else {
          logger.info("Edited meal: " + meal);
          res.status(200).json({
            status: 200,
            result: meal,
          });
        }
      }
    );
  },

  getMealById: (req, res, next) => {
    const mealId = req.params.mealId;
    pool.query(
      `SELECT * FROM meal WHERE id = ${mealId};`,
      function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
          logger.info("Meal: " + results);
          res.status(200).json({
            status: 200,
            result: results,
          });
        } else {
          logger.debug("Could not find mealId: " + mealId);
          const error = {
            status: 404,
            message: "Meal does not exist",
          };
          next(error);
        }
      }
    );
  },

  deleteMeal: (req, res, next) => {
    const mealId = req.params.mealId;
    let meal;

    pool.query(
      `SELECT * FROM meal WHERE id = ${mealId};`,
      function (error, results, fields) {
        if (error) throw error;
        logger.info("Deleting meal: " + mealId);
        meal = results;
      }
    );

    pool.query(
      `DELETE FROM meal WHERE id = ${mealId} ;`,
      function (error, results, fields) {
        if (error) throw error;

        if (results.affectedRows > 0) {
          logger.info("#Deleted meal: " + meal);
          res.status(200).json({
            status: 200,
            result: meal,
          });
        } else {
          logger.debug("Meal does not exist");
          const error = {
            status: 400,
            message: "Meal does not exist",
          };
          next(error);
        }
      }
    );
  },
};

function fnConvertBooleanToNumber(inputBool) {
  if (inputBool) {
    return 1;
  } else {
    return 0;
  }
}

module.exports = mealController;
