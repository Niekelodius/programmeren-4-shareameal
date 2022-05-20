const assert = require("assert");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const dbconnection = require("../../database/dbConnection");
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
    } = meal;

    logger.debug(meal);
    try {
      assert(typeof name == "string", "Name must be filled in or a string");
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
          res.status(200).json({
            statusCode: 200,
            message: results,
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

    //id is nog hardcoded fix dat
    //Receives payload from authorization with the token
    const auth = req.headers.authorization;
    const token = auth.substring(7, auth.length);
    //Decodes token to a readable object {id:(id), emailAdress:(emailAdress)}
    const encodedLoad = jwt.decode(token);
    let cookId = encodedLoad.id;

    meal.isVega = fnConvertBooleanToNumber(meal.isVega);
    meal.isVegan = fnConvertBooleanToNumber(meal.isVegan);
    meal.isToTakeHome = fnConvertBooleanToNumber(meal.isToTakeHome);
    // meal.allergenes = meal.allergenes.join();

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!
      //   connection.query(
      //     `INSERT INTO meal ( name, description, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, allergenes ) VALUES (${mysql.escape(
      //       meal.name
      //     )}, ${mysql.escape(meal.description)}, ${mysql.escape(meal.isActive)},
      //         ${mysql.escape(meal.isVegan)}, ${mysql.escape(
      //       meal.isToTakeHome
      //     )}, ${mysql.escape(meal.dateTime)}, ${mysql.escape(
      //       meal.maxAmountOfParticipants
      //     )},  ${mysql.escape(meal.price)}, ${mysql.escape(
      //       meal.price
      //     )},${mysql.escape(meal.imageUrl)}, ${mysql.escape(
      //       meal.cookId
      //     )},${mysql.escape(meal.allergenes)} );`,

      connection.query(
        "INSERT INTO meal " +
          "(name, description, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price, cookId) " +
          "VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          meal.name,
          meal.description,
          meal.isVega,
          meal.isVegan,
          meal.isToTakeHome,
          meal.dateTime,
          meal.imageUrl,
          meal.allergenes,
          meal.maxAmountOfParticipants,
          meal.price,
          cookId,
        ],
        function (error, results, fields) {
          if (error) {
            logger.debug(error);
            const err = {
              status: 409,
              message: "Could not add meal",
            };
            // res.status(409).json({
            //     status: 409,
            //     message: "Email not unique"
            // })
            connection.release();
            next(err);
          } else {
            logger.debug("#result = " + results.length);
            // user.userId = results.insertId;
            res.status(200).json({
              status: 200,
              message: meal,
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
        function (error, results, fields){
          if (error) throw err;
          // logger.log(error);

          if (results == 0) {
            const error = {
              status: 404,
              message: "Meal does not exist",
            };
            next(error);
          } else {
            res.status(200).json({
              statusCode: 200,
              message: meal,
            });
          }
          logger.log("#result = " + results.length);
        }
      );
    });
  },

  getMealById: (req, res) => {
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
              message: results,
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
    const userId = req.params.mealId;
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

          if (meal.length > 0) {
            logger.log("#result = " + results.length);
            res.status(200).json({
              statusCode: 200,
              message: meal,
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
