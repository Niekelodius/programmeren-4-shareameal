const assert = require("assert");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const dbconnection = require("../../database/dbConnection");
const { type } = require("express/lib/response");
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

    logger.debug(meal);
    try {
      assert(typeof name == "string", "Name must be filled in and a string");
      assert(
        typeof description == "string",
        "Description must be filled in or a string"
      );
      assert(typeof isActive == "boolean", "Must be active or not");
      assert(typeof isVega == "boolean", "Must be vega or not");
      assert(typeof isVegan == "boolean", "Must be vegan or not");
      assert(typeof isToTakeHome == "boolean", "must be a boolean value");
      assert(typeof dateTime == "string", "Must be filled in");
      assert(typeof imageUrl == "string", "Must have a image url");
      assert(typeof allergenes == "object", "Must be an array");

      //assert(typeof allergenes == '')
      assert(
        typeof maxAmountOfParticipants == "number",
        "Maximum amount of participants required"
      );
      assert(typeof price == "number", "Price is required");
      logger.debug("Validation complete");
      next();
    } catch (error) {
      logger.debug(error.message);
      logger.debug("Validation failed");
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
    //Decodes token to a readable object {id:(id), emailAdress:(emailAdress)}
    const encodedLoad = jwt.decode(token);
    const mealId = req.params.mealId;
    const userId = encodedLoad.userId;
    let cookId;
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!
      connection.query(
        `SELECT cookId FROM meal WHERE id = ${mealId};`,
        function (error, results, fields) {
          cookId = results[0].cookId; 
        })
      connection.query(
        `SELECT roles FROM user WHERE id = ${userId};`,
        function (error, results, fields) {
          logger.debug("roles" + results[0].roles);
          if (!(cookId === userId || results[0].roles === "editor")) {
            const err = {
              status: 403,
              message: "Unauthorized",
            };
            next(err);
          }else{
            next();
          }

        }
      );
    });
  },

  getMeals: (req, res) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        //   'SELECT id, name FROM meal;',
        "SELECT * FROM meal;",
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) throw error;

          // Don't use the connection here, it has been returned to the pool.
          logger.log("#result = " + results.length);
          logger.debug(results)
          res.status(200).json({
            status: 200,
            result: results,
          });

          // pool.end((err) => {
          //   console.log('pool was closed');
          // });
        }
      );
    });
  },

  addMeal: (req, res, next) => {
    let meal = req.body;
    logger.warn("test");

    //id is nog hardcoded fix dat
    //Receives payload from authorization with the token
    const auth = req.headers.authorization;
    const token = auth.substring(7, auth.length);
    //Decodes token to a readable object {id:(id), emailAdress:(emailAdress)}
    const encodedLoad = jwt.decode(token);
    let cookId = encodedLoad.userId;

    meal.isVega = fnConvertBooleanToNumber(meal.isVega);
    meal.isVegan = fnConvertBooleanToNumber(meal.isVegan);
    meal.isToTakeHome = fnConvertBooleanToNumber(meal.isToTakeHome);

    meal.allergenes = meal.allergenes.toString();

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      connection.query(
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
            logger.debug(error);
            const err = {
              status: 409,
              message: "Could not add meal",
            };
            connection.release();
            next(err);
          } else {
            logger.debug("#result = " + results.length);
            meal.id = results.insertId
            res.status(201).json({
              status: 201,
              result: meal,
            });
          }
        }
      );
    });
  },

  updateMealById: (req, res, next) => {
    logger.trace("Update has started");
    let meal = req.body;
    const currentId = req.params.mealId;

    meal.isActive = fnConvertBooleanToNumber(meal.isActive);
    meal.isVega = fnConvertBooleanToNumber(meal.isVega);
    meal.isVegan = fnConvertBooleanToNumber(meal.isVegan);
    meal.isToTakeHome = fnConvertBooleanToNumber(meal.isToTakeHome);

    //Search for current meal
    dbconnection.getConnection(function (err, connection) {
      connection.query(
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
          // logger.log(error);

          if (results.affectedRows == 0) {
            const error = {
              status: 404,
              message: "Meal does not exist",
            };
            next(error);
          } else {

            res.status(200).json({
              status: 200,
              result: meal,
            });
          }
          logger.log("#result = " + results.length);
        }
      );
    });
  },

  getMealById: (req, res, next) => {
    const mealId = req.params.mealId;
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        `SELECT * FROM meal WHERE id = ${mealId};`,
        function (error, results, fields) {
          connection.release();
          if (error) throw error;
          logger.log("#result = " + results.length);
          if (results.length > 0) {
            
            res.status(200).json({
              statusCode: 200,
              result: results,
            });
          } else {
            const error = {
              status: 404,
              message: "Meal does not exist",
            };
            next(error);
          }
        }
      );
    });
  },

  deleteMeal: (req, res, next) => {
    const mealId = req.params.mealId;
    let meal;

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!
      connection.query(
        `SELECT * FROM meal WHERE id = ${mealId};`,
        function (error, results, fields) {
          connection.release();
          if (error) throw error;
          logger.log("#result = " + results.length);
          meal = results;
        }
      );
    });

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      connection.query(
        `DELETE FROM meal WHERE id = ${mealId} ;`,
        function (error, results, fields) {
          if (error) throw error;

          if (results.affectedRows > 0) {
            logger.log("#result = " + results.length);
            res.status(200).json({
              status: 200,
              result: meal,
            });
          } else {
            const error = {
              status: 400,
              message: "Meal does not exist",
            };
            next(error);
          }
        }
      );
    });
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
