const assert = require("assert");
const mysql = require("mysql");
const dbconnection = require("../../database/dbConnection");
const logger = require("../config/config").logger;
const jwt = require("jsonwebtoken");

let userController = {
  validateUser: (req, res, next) => {
    let user = req.body;
    const userId = req.params.userId;
    let {
      firstName,
      lastName,
      street,
      city,
      isActive,
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
      assert(typeof phoneNumber === "string", "phoneNumber must be a string");
      next();
    } catch (err) {
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
      next();
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

    dbconnection.getConnection(function (err, connection) {
      connection.query(
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
            logger.log(error);
            const err = {
              status: 409,
              message: "Email not unique",
            };
            connection.release();
            next(err);
          } else {
            logger.log("#result = " + results.length);
            user.userId = results.insertId;
            res.status(200).json({
              status: 200,
              message: "Succesfully added user to database",
              result: user,
            });
          }
        }
      );
    });
  },

  editUser: (req, res, next) => {
    const userId = req.params.userId;
    let user = req.body;

    dbconnection.getConnection(function (err, connection) {
      connection.query(
        "UPDATE user SET firstName = ?, lastName = ?, city = ?, street = ?, password = ?, emailAdress = ?, isActive = ?, phoneNumber = ? WHERE id = ?;",
        [
          user.firstName,
          user.lastName,
          user.street,
          user.city,
          user.password,
          user.emailAdress,
          user.phoneNumber,
          user.roles,
          userId,
        ],
        function (error, results, fields) {
          // connection.release();
          if (error) throw err;

          if (results == 0) {
            const error = {
              status: 404,
              message: "User does not exist",
            };
            next(error);
          } else {
            res.status(200).json({
              statusCode: 200,
              message: user,
            });
          }

          logger.log("#result = " + results.length);
        }
      );
    });
  },



  getAllUsers: (req, res) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        //   'SELECT id, name FROM meal;',
        "SELECT * FROM user;",
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

  deleteUser: (req, res, next) => {
    const userId = req.params.userId;
    let user;

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!
      connection.query(
        `SELECT * FROM user WHERE id = ${userId};`,
        function (error, results, fields) {
          connection.release();
          if (error) throw error;
          logger.log("#result = " + results.length);
          user = results;
        }
      );
    });

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      connection.query(
        `DELETE FROM user WHERE id = ${userId} ;`,
        function (error, results, fields) {
          if (error) throw error;

          if (user.length > 0) {
            logger.log("#result = " + results.length);
            res.status(200).json({
              statusCode: 200,
              message: user,
            });
          } else {
            const error = {
              status: 400,
              message: "User does not exist",
            };
            next(error);
          }
        }
      );
    });
  },

  getUserById: (req, res, next) => {
    const userId = req.params.userId;
    dbconnection.getConnection(function (err, connection) {
      connection.query(
        `SELECT * FROM user WHERE id =${userId}`,
        (err, results, fields) => {
          if (err) throw err;
          if (results.length > 0) {
            res.status(200).json({
              status: 200,
              message: results,
            });
          } else {
            const error = {
              status: 404,
              message: "User does not exist",
            };
            next(error);
          }
        }
      );
    });
  },

  //https://assertion-server-program-4.herokuapp.com/api/assert/t2
  //   {
  //     "url": "https://share-a-meal-niek.herokuapp.com",
  //     "studentnumber": 2183046
  // }

  getProfile: (req, res, next) => {
    const auth = req.headers.authorization;
    const token = auth.substring(7, auth.length);
    const encodedLoad = jwt.decode(token);
    let userId = encodedLoad.id;

    dbconnection.getConnection(function (err, connection) {
      connection.query(
        `SELECT * FROM user WHERE id =${userId}`,
        (err, results, fields) => {
          if (err) throw err;
          if (results.length > 0) {
            res.status(200).json({
              status: 201,
              message: results,
            });
          } else {
            const error = {
              status: 401,
              message: "Forbidden",
            };
            next(error);
          }
        }
      );
    });
  },
};
module.exports = userController;
