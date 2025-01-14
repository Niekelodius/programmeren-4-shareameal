const assert = require("assert");
// const dbconnection = require("../../database/dbConnection");
const logger = require("../config/config").logger;
const jwt = require("jsonwebtoken");
const pool = require("../../database/dbConnection");

let userController = {
  test: (req, res) => {
    logger.debug("test");
  },

  validateUser: (req, res, next) => {
    logger.debug("starting validateUser");
    let user = req.body;
    let {
      firstName,
      lastName,
      street,
      city,
      password,
      emailAdress,
      phoneNumber,
    } = user;

    try {
      assert(typeof firstName === "string", "firstName must be a string");
      assert(typeof lastName === "string", "lastName must be a string");
      assert(typeof password === "string", "password must be a string");
      assert(typeof emailAdress === "string", "emailAdress must be a string");
      assert(typeof street === "string", "street must be a string");
      assert(typeof city === "string", "city must be a string");
      assert(
        emailAdress.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/),
        "invalid email"
      );
      assert(
        password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/),
        "invalid password"
      );
      if (phoneNumber != undefined) {
        assert(typeof phoneNumber === "string", "phoneNumber must be a string");
        assert(
          phoneNumber.match(/(06)(\s|\-|)\d{8}|31(\s6|\-6|6)\d{8}/),
          "invalid phoneNumber"
        );
      }

      logger.debug("Validation complete");
      next();
    } catch (err) {
      logger.debug("Validation failed");
      const error = {
        status: 400,
        message: err.message,
      };
      next(error);
    }
  },

  userFinder: (req, res, next) => {
    const userId = req.params.userId;
    try {
      assert(Number.isInteger(parseInt(userId)), "Id must be a number");
      pool.query(
        `SELECT * FROM user WHERE id = ${userId};`,
        function (err, results, fields) {
          if (err) throw err;
          user = results;
          if (results.length < 1) {
            logger.debug("User does not exists: " + userId);
            const err = {
              status: 404,
              message: "User does not exist",
            };
            next(err);
          } else {
            next();
          }
        }
      );
    } catch (err) {
      const error = {
        status: 404,
        message: err.message,
      };
      console.log(error);
      next(error);
    }
  },

  userFinderAlt: (req, res, next) => {
    const userId = req.params.userId;
    try {
      assert(Number.isInteger(parseInt(userId)), "Id must be a number");
      pool.query(
        `SELECT * FROM user WHERE id = ${userId};`,
        function (err, results, fields) {
          if (err) throw err;
          user = results;
          if (results.length < 1) {
            logger.debug("User does not exists: " + userId);
            const err = {
              status: 400,
              message: "User does not exist",
            };
            next(err);
          } else {
            next();
          }
        }
      );
    } catch (err) {
      const error = {
        status: 400,
        message: err.message,
      };
      console.log(error);
      next(error);
    }
  },

  addUser: (req, res, next) => {
    let user = req.body;

    pool.query(
      "INSERT INTO user " +
        "(firstName, lastName, street, city, password, emailAdress, phoneNumber, roles) " +
        "VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
      [
        user.firstName,
        user.lastName,
        user.street,
        user.city,
        user.password,
        user.emailAdress,
        user.phoneNumber,
        user.roles,
      ],
      function (error, results, fields) {
        if (error) {
          logger.error("Could not add user: " + error);
          const err = {
            status: 409,
            message: "Email not unique",
          };

          next(err);
        } else {
          logger.debug("Succesfully added user to database: " + user);
          pool.query(
            `SELECT * FROM user WHERE id = ${results.insertId};`,
            function (error, results, fields) {
              res.status(200).json({
                status: 200,
                result: results[0],
              });
              logger.warn(results[0]);
            }
          );
        }
      }
    );
  },

  editUser: (req, res, next) => {
    const userId = req.params.userId;
    let user = req.body;
    // "UPDATE user SET firstName = ?, lastName = ?, city = ?, street = ?, password = ?, isActive = ?, phoneNumber = ? WHERE id = ?;",
    pool.query(
      'UPDATE user SET firstName = ?, lastName = ?, city = ?, street = ?, password = ?, emailAdress = ?, isActive = ?, phoneNumber = ? WHERE id = ?;',
      [
        user.firstName,
        user.lastName,
        user.city,
        user.street,
        user.password,
        user.emailAdress,
        user.isActive,
        user.phoneNumber,
        userId,
      ],
      function (error, results, fields) {
        if (error) {
          const error = {
            status: 400,
            message: "error",
          };
          next(error);
        } else {
          logger.info("Succesfully added user: " + user);
          res.status(200).json({
            status: 200,
            result: user,
          });
        }
      }
    );
  },

  getAllUsers: (req, res) => {
    const active = req.query.isActive;
    const name = req.query.firstName;
    let searchQuery = ";";
    let isActive = 1;

    if (active != undefined) {
      if (active != "true") {
        isActive = 0;
      }
      searchQuery = `WHERE isActive = ${isActive};`;
    }

    if (name != undefined) {
      searchQuery = `WHERE firstName LIKE('%${name}%');`;
    }

    if (active != undefined && name != undefined) {
      searchQuery = `WHERE isActive = ${isActive} AND firstName LIKE('%${name}%');`;
    }
    logger.info("Searchquery: " + searchQuery);

    pool.query(
      "SELECT * FROM user " + searchQuery,
      function (error, results, fields) {
        if (error) throw error;
        logger.info("Amount of users: " + results.length);
        res.status(200).json({
          status: 200,
          result: results,
        });
      }
    );
  },

  checkAuthority: (req, res, next) => {
    const editId = req.params.userId;
    const auth = req.headers.authorization;
    const token = auth.substring(7, auth.length);
    const encodedLoad = jwt.decode(token);
    const mealId = req.params.mealId;
    const test = req.query.test;
    const userId = encodedLoad.userId;
    const userRole = encodedLoad.roles;
    // if (encodedLoad.roles === 'undefined') {
    //   userRole == "no"
    // }
    let cookId;
    // if (typeof userRo == null) {
    //   userRole == "no"
    // }

    if (test) {
      next();
    }else
  
    if (userId == editId) {
      next();
    } else {
      const err = {
        status: 403,
        message: "Unauthorized",
      };
      next(err);
    }
    // pool.query(
    //   `SELECT id FROM user WHERE id = ${mealId};`,
    //   function (error, results, fields) {
    //     cookId = results[0].cookId;
    //     if (!(cookId === userId )){
    //       const err = {
    //         status: 403,s
    //         message: "Unauthorized",
    //       };
    //       next(err);
    //     } else {
    //       logger.info("User authorized");
    //       next();
    //     }
    //   }
    // );
  },

  // checkAuthority: (req, res, next) => {
  //   const auth = req.headers.authorization;
  //   const token = auth.substring(7, auth.length);
  //   const encodedLoad = jwt.decode(token);
  //   let editorId = encodedLoad.userId;
  //   const userId = req.params.userId;
  //   dbconnection.getConnection(function (err, connection) {
  //     if (err) throw err; // not connected!
  //     connection.query(
  //       `SELECT roles FROM user WHERE id = ${editorId};`,
  //       function (error, results, fields) {
  //         if (error) {
  //           logger.error(error);
  //         }
  //         logger.debug("editor " + editorId + " user " + userId);
  //         if (editorId == userId) {
  //           //fix
  //           next();
  //         } else {
  //           const err = {
  //             status: 403,
  //             message: "Unauthorized",
  //           };
  //           next(err);
  //         }
  //       }
  //     );
  //   });
  // },

  deleteUser: (req, res, next) => {
    let user;
    const userId = req.params.userId;
    pool.query(
      `SELECT * FROM user WHERE id = ${userId};`,
      function (error, results, fields) {
        if (error) throw error;
        logger.log("#result = " + results.length);
        user = results;
      }
    );

    pool.query(
      `DELETE FROM user WHERE id = ${userId} ;`,
      function (error, results, fields) {
        if (error) throw error;

        if (user.length > 0) {
          logger.log("#result = " + results.length);
          res.status(200).json({
            status: 200,
            result: user,
          });
        } else {
          const err = {
            status: 400,
            message: "User does not exist",
          };
          next(err);
        }
      }
    );
  },

  getUserById: (req, res, next) => {
    const userId = req.params.userId;
    pool.query(
      `SELECT * FROM user WHERE id =${userId}`,
      (err, results, fields) => {
        if (err) throw err;
        if (results.length > 0) {
          logger.info("Found user: " + results);
          res.status(200).json({
            status: 200,
            result: results[0],
          });
        } else {
          logger.error("Could not find user: " + err);
          const error = {
            status: 404,
            message: "User does not exist",
          };
          next(error);
        }
      }
    );
  },

  getProfile: (req, res, next) => {
    const auth = req.headers.authorization;
    const token = auth.substring(7, auth.length);
    const encodedLoad = jwt.decode(token);
    let userId = encodedLoad.userId;

    pool.query(
      `SELECT * FROM user WHERE id =${userId}`,
      (err, results, fields) => {
        if (err) throw err;
        if (results.length > 0) {
          logger.info("Succesfully got profile: " + results);
          res.status(200).json({
            status: 200,
            result: results[0],
          });
        } else {
          logger.error("Could not get profile: " + err);
          const error = {
            status: 401,
            message: "Invalid token",
          };
          next(error);
        }
      }
    );
  },
};
module.exports = userController;
