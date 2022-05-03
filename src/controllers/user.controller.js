const assert = require('assert');
let database = [];
let id = 0;
const dbconnection = require('../../database/dbconnection');

let userController = {

    validateUser: (req, res, next) => {
        let user = req.body;
        const userId = req.params.userId;

        let { firstName, lastName, street, city, password, emailAdress , phoneNumber} = user;

        console.log(userId);
        try {
            database.some(element => {
                if (element.emailAdress === emailAdress) {
                    assert.equal(element.id, userId, 'emailAdress must be unique');
                }
            });

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
                result: err.message
            };
            next(error);
        }
    },

    userFinder: (req, res, next) => {
        const userId = req.params.userId;
        let user = database.filter((item) => item.id == userId);
        try {
            assert.equal(user.length, 1, `User with ID ${userId} not found`);
            next();
        } catch (err) {
            const error = {
                status: 400,
                result: err.message
            };
            next(error);
        }
    },

    addUser: (req, res) => {
        let user = req.body;
        user = {
            id,
            ...user,
        };
        id++;
        database.push(user);
        console.log("added " + user);
        res.status(201).json({
            status: 201,
            result: database,
        });
    },


    editUser: (req, res, next) => {
        const userId = req.params.userId;
        let newUser = req.body;
        id = parseInt(userId);
        newUser = {
            id,
            ...newUser,
        };
        console.log(newUser);
        database[userId] = newUser;

        res.status(201).json({
            status: 201,
            result: newUser,
        });
        console.log(`Modified user ${userId}`);
    },

    getAllUsers: (req, res) => {
        // res.status(201).json({
        //     status: 201,
        //     result: database,
        // });
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!
      
            // Use the connection
            connection.query(
              'SELECT id, name FROM meal;',
              function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();
      
                // Handle error after the release.
                if (error) throw error;
      
                // Don't use the connection here, it has been returned to the pool.
                console.log('#result = ' + results.length);
                res.status(200).json({
                  statusCode: 200,
                  results: results,
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
        console.log(`User with ID ${userId} has been deleted`);
        let user = database.filter((item) => item.id == userId);
        console.log(user);
        database.splice(userId, 1);
        res.status(201).json({
            status: 201,
            result: user,
        });

    },

    getUserById: (req, res, next) => {
        const userId = req.params.userId;
        console.log(`User met ID ${userId} gezocht`);
        let user = database.filter((item) => item.id == userId);

        console.log(user);
        res.status(201).json({
            status: 201,
            result: user,
        });

    },

    getProfile: (req, res, next) => {
        res.status(200).json({
            status: 401,
            result: `Unauthorized`,
        });
    }

};
module.exports = userController;