const assert = require('assert');
let database = [];
let id = 0;
const mysql = require('mysql');
const dbconnection = require('../../database/dbConnection');

let userController = {

    validateUser: (req, res, next) => {
        let user = req.body;
        const userId = req.params.userId;
        let { firstName, lastName, street, city, isActive, password, emailAdress, phoneNumber } = user;

        try {
            assert(typeof firstName === 'string', 'firstName must be a string');
            assert(typeof lastName === 'string', 'lastName must be a string');
            assert(typeof password === 'string', 'password must be a string');
            assert(typeof emailAdress === 'string', 'emailAdress must be a string');
            assert(typeof street === 'string', 'street must be a string');
            assert(typeof city === 'string', 'city must be a string');
            assert(typeof phoneNumber === 'string', 'phoneNumber must be a string');
            next();
        } catch (err) {
            const error = {
                status: 400,
                message: err.message
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
        let { firstName, lastName, isActive, street, city, password, emailAdress, phoneNumber , roles} = user;

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!
            connection.query(
                `INSERT INTO user ( firstName, lastName, isActive, street, city, password, emailAdress, phoneNumber, roles ) VALUES (${mysql.escape(user.firstName)}, ${mysql.escape(user.lastName)}, ${mysql.escape(user.isActive)},
                 ${mysql.escape(user.street)}, ${mysql.escape(user.city)}, ${mysql.escape(user.password)}, ${mysql.escape(user.emailAdress)}, ${mysql.escape(user.phoneNumber)},  ${mysql.escape(user.roles)} );`,
                function (error, results, fields) {
                    if (error) {
                        console.log(error);
                        const err = {
                            status: 409,
                            message: "Email not unique"
                        }
                        // res.status(409).json({
                        //     status: 409,
                        //     message: "Email not unique"
                        // })
                        connection.release();
                        next(err);
                    }

                    else {
                        console.log('#result = ' + results.length);
                        user.userId = results.insertId;
                        res.status(200).json({
                            status: 200,
                            message: user,
                        });
                    }
                }
            );
        });
    },



    editUser: (req, res, next) => {
        const userId = req.params.userId;
        let user = req.body;
        let { firstName, lastName, street, city, password, emailAdress, phoneNumber } = user;

        dbconnection.getConnection(function (err, connection) {
            connection.query(
                `UPDATE user SET firstName = ${mysql.escape(user.firstName)} , lastName = ${mysql.escape(user.lastName)} , street = ${mysql.escape(user.street)} 
                , city = ${mysql.escape(user.city)} , password = ${mysql.escape(user.password)} , emailAdress = ${mysql.escape(user.emailAdress)} , phoneNumber = ${mysql.escape(user.phoneNumber)} 
                WHERE id = ${userId} ;`,
                function (error, results, fields) {
                    // connection.release();
                    if (error) throw err;
                    
                    if (results == 0) {
                        const error = {
                          status: 404,
                          message: "User does not exist"
                        };
                        next(error);
                      } else {
                        res.status(200).json({
                            statusCode: 200,
                            message: user
                        });
                      }
                    
                    console.log('#result = ' + results.length);
     
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
                'SELECT * FROM user;',
                function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release();

                    // Handle error after the release.
                    if (error) throw error;

                    // Don't use the connection here, it has been returned to the pool.
                    console.log('#result = ' + results.length);
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
                    console.log('#result = ' + results.length);
                    user = results;
                }
            );
        });
        

        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!

            connection.query(
                `DELETE FROM user WHERE id = ${userId} ;`,
                function (error, results, fields) {
                    connection.release();
                    if (error) throw error;
                    
                    if (user.length > 0) {
                        console.log('#result = ' + results.length);
                        res.status(200).json({  
                            statusCode: 200,
                            message: user,
                        });
                    }else{
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
        dbconnection.getConnection(function (err, connection){
            connection.query(
                `SELECT * FROM user WHERE id =${userId}`,
                (err, results, fields) => {
                  if (err) throw err;
                  if (results.length > 0) {
                    res.status(200).json({
                      status: 200,
                      message: results
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
        res.status(200).json({
            status: 401,
            message: `Unauthorized`,
        });
    }

};
module.exports = userController;