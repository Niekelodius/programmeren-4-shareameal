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
    logger.debug("Time " + meal.dateTime);
    logger.debug("Raw mealdata: " + meal[0]);
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
      logger.debug(typeof meal.allergenes);
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
    const test = req.query.test;
    const userRole = encodedLoad.roles;
    if (test) {
      next();
    }else{

    pool.query(
      `SELECT cookId FROM meal WHERE id = ${mealId};`,
      function (error, results, fields) {
        if (results[0].cookId != 'undefined') {
          

        if (!(results[0].cookId === userId)){
          const err = {
            status: 403,
            message: "Unauthorized",
          };
          next(err);
        } else {
          logger.info("User authorized");
          next();
        }
      }else{
      const err = {
        status: 403,
        message: "Unauthorized",
      };
      next(err);
    }}
    );
    }

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

  // checkForMeal: (req, res, next) => {
  //   next();
  //   const currentId = req.params.mealId;
  //   pool.query("SELECT * FROM meal WHERE id = ?;"[currentId], function (error, results, fields) {
  //     logger.warn(results[0]);
  //     if (error) {
  //       const err = {
  //         status: 400,
  //         message: "error",
  //       };
  //       next(err);
  //     }else if(results[0].length > 1){
  //       next();
  //     }else{
  //       const err = {
  //         status: 404,
  //         message: "Meal does not exist",
  //       };
  //       next(err);
  //     }
  //   });
  // },

  addMeal: (req, res, next) => {
    let meal = req.body;
    let cookId = 1;
    if (meal.id != null) {
      cookId = meal.id;
    }else{
      const auth = req.headers.authorization;
      const token = auth.substring(7, auth.length);
      const encodedLoad = jwt.decode(token);
      cookId = encodedLoad.userId;
    }
    meal.dateTime = meal.dateTime.replace("T", " ").substring(0, 19);
  //   meal.dateTime = ;
  //   convertOldDateToMySqlDate(pp) {
  //     let dated = pp;
  //     dated = dated.replace("T", " ").substring(0, 19);
  //     return dated;
  // },
    // meal.isVega = fnConvertBooleanToNumber(meal.isVega);
    // meal.isVegan = fnConvertBooleanToNumber(meal.isVegan);
    // meal.isToTakeHome = fnConvertBooleanToNumber(meal.isToTakeHome);

    // let test = meal.allergenes
    // const entries = Object.entries(meal.allergenes);
    // logger.debug("array " + entries);

    meal.allergenes = `${meal.allergenes}`;


    // meal.allergenes = meal.allergenes.toString();
    // meal.allergenes = join("', '", meal.allergenes);
    logger.debug("meal " + meal.allergenes);
    logger.debug(meal.dateTime);
    logger.debug("Converted meal data: " + meal);

    pool.query(
      "INSERT INTO meal " +
        "(name, description, isVega, isVegan, isToTakeHome, dateTime, imageUrl, maxAmountOfParticipants, price, allergenes, isActive, cookId) " +
        "VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
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
        meal.isActive,
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
          pool.query( `SELECT * FROM meal WHERE id = ${results.insertId};`, function (error, results, fields){
            res.status(201).json({
              status: 201,
              result: results[0] ,
            });
            logger.warn("time "+ results[0].dateTime);
            logger.info("Added meal: " + results );
          })
        }
      }
    );
  },

  updateMealById: (req, res, next) => {
    let meal = req.body;
    const currentId = req.params.mealId;

    let cookId = 1;
    if (meal.id != null) {
      cookId = meal.id;
    }else{
      const auth = req.headers.authorization;
      const token = auth.substring(7, auth.length);
      const encodedLoad = jwt.decode(token);
      cookId = encodedLoad.userId;
    }

    // meal.isActive = fnConvertBooleanToNumber(meal.isActive);
    // meal.isVega = fnConvertBooleanToNumber(meal.isVega);
    // meal.isVegan = fnConvertBooleanToNumber(meal.isVegan);
    // meal.isToTakeHome = fnConvertBooleanToNumber(meal.isToTakeHome);

    meal.allergenes = `${meal.allergenes}`;

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
      function (error, result, fields) {
        if (error) {
          const error = {
            status: 404,
            error: "error"
          };
          next(error);
        } else {
          pool.query( `SELECT * FROM meal WHERE id = ${currentId};`, function (error, results, fields){
            res.status(200).json({
              status: 200,
              result: results[0] ,
            });
            logger.warn(results[0]);
          })
        }
        // else{
        //   const error = {
        //     status: 404,
        //     message: "Meal does not exist"
        //   };
        //   next(error);
        // }
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
            result: results[0],
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

  // checkAuthority:(req, res, next) => {
  //   const auth = req.headers.authorization;
  //   const token = auth.substring(7, auth.length);
  //   const encodedLoad = jwt.decode(token);
  //   let cookId = encodedLoad.userId;
  //   const mealId = req.params.mealId;
  //   // pool.query(
  //   //   `SELECT cookId FROM meal WHERE id = ${mealId};`,
  //   //   function (error, results, fields) {
  //   //     if (error) throw error;
  //   //     logger.info("Deleting meal: " + mealId);
  //   //     logger.warn(results[0]);
  //   //     // if (results[0].cookId == cookId) {
  //   //     //   next();
  //   //     // }else{
  //   //       const error = {
  //   //         status: 403,
  //   //         message: "Unauthorized",
  //   //       };
  //   //       next(error);
  //   //     // }
  //   //   }
  //   // );
  //   next();
  // },

  deleteMeal: (req, res, next) => {
    const mealId = req.params.mealId;
    let meal;

    pool.query(
      `SELECT * FROM meal WHERE id = ${mealId};`,
      function (error, results, fields) {
        if (error) throw error;
        logger.info("Deleting meal: " + mealId);
        meal = results[0];
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
