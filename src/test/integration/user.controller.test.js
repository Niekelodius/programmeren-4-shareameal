process.env.DATABASE = process.env.DATABASE || "share-a-meal";
process.env.LOGLEVEL = "warn";


const chai = require("chai");
const chaiHttp = require("chai-http");
const database = require("../../../database/dbConnection");
require('dotenv').config()
const jwt = require('jsonwebtoken')
const assert = require('assert')
const { jwtSecretKey, logger } = require('../../../src/config/config')
const index = require("../../../index");
const res = require("express/lib/response");
chai.should();
chai.use(chaiHttp);

let userId;

let validToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTY1MzA1NDQwMiwiZXhwIjoxNjU0MDkxMjAyfQ.qjG8JF3E-usyhLJCg02mDoKmtO3V36dPUH4vgJxfCIA"
const invalidToken =  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIyNywiaWF0IjoxNjUyNzg3NzA4LCJleHAiOjE2NTM4MjQ1MDh9.NAW7Ol_7WrEdPYH1B7-6mKFsGGpX3xPwEQBctIKlPvU"

const CLEAR_DB = "DELETE  FROM `user` WHERE emailAdress = 'ng@avans.nl';"
const GET_USER = "SELECT id FROM `user` WHERE emailAdress = 'goos@avans.nl';"
const ADD_USER = "INSERT INTO user (firstName, lastName, street, city, password, emailAdress, phoneNumber, roles) VALUES('Removable', 'man', 'behind', 'you', 'D389!!ach', 'goos@avans.nl', '05322222222', 'editor')"



// {
//   "id": 3,
//   "firstName": "Herman",
//   "lastName": "Huizinga",
//   "isActive": 1,
//   "emailAdress": "h.huizinga@server.nl",
//   "password": "secret",
//   "phoneNumber": "06-12345678",
//   "roles": "editor,guest",
//   "street": "",
//   "city": ""
// }


describe("Manage users /api/user", () => {
  describe("TC-201 Register as new user", () => {
    
    beforeEach((done) => {
      logger.debug("beforeEach called");
      // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
      
      database.getConnection(function (err, connection) {
        if (err) throw err

        // Use the connection
        connection.query(
          CLEAR_DB,
          function (error, results, fields) {
            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.
            if (err) throw err
            // Let op dat je done() pas aanroept als de query callback eindigt!
            logger.debug("beforeEach done");
            done();
          }
        );
      });
    });

    it("201-1 Field missing or invalid", (done) => {
      chai
        .request(index)
        .post("/api/user")
        .send({
          lastName: "G",
          isActive: true,
          street: "a",
          city: "b",
          roles: "editor",
          emailAdress: "ng@avans.nl",
          password: "123",
          phoneNumber: "0651234567",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("firstName must be a string");
          done();
        });
    });

    it("201-2 Email invalid, return valid error", (done) => {
      chai
        .request(index)
        .post("/api/user")
        .send({
          firstName: "N",
          lastName: "G",
          emailAdress: "ng.avans.nl",
          isActive: true,
          roles: "editor",
          street: "a",
          city: "b",

          password: "123",
          phoneNumber: "0651234567",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string").that.equals("invalid email");
          done();
        });
    });

    it("201-3 Password invalid, return valid error", (done) => {
      chai
        .request(index)
        .post("/api/user")
        .send({
          firstName: "N",
          lastName: "G",
          isActive: true,
          roles: "editor",
          street: "a",
          city: "b",
          password: "123",
          emailAdress: "ng@avans.nl",
          phoneNumber: "0651234567",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string").that.equals("invalid password");
          done();
        });
    });

    it("201-4 User already exists", (done) => {
      chai
        .request(index)
        .post("/api/user")
        .send({
          firstName: "N",
          lastName: "G",
          isActive: true,
          roles: "editor",
          street: "a",
          city: "b",
          emailAdress: "ng@avans.nl",
          password: "D1mwwVhTT22!",
          phoneNumber: "0651234567",
        })
        .end((req, res) => {
          res.should.be.an("object");
          chai
            .request(index)
            .post("/api/user")
            .send({
              firstName: "N",
              lastName: "G",
              isActive: true,
              roles: "editor",
              street: "a",
              city: "b",
              emailAdress: "ng@avans.nl",
              password: "D1mwwVhTT22!",
              phoneNumber: "0651234567",
            })
            .end((req, res) => {
              res.should.be.an("object");
              let { status, message } = res.body;
              status.should.equals(409);
              message.should.be.a("string").that.equals("Email not unique");
              done();
            });
        });
    });

    it("201-5 Succesfully added user", (done) => {
      chai
        .request(index)
        .post("/api/user")
        .send({
          firstName: "N",
          lastName: "G",
          isActive: true,
          roles: "editor",
          street: "a",
          city: "b",
          emailAdress: "ng@avans.nl",
          password: "D1mwwVhTT22!",
          phoneNumber: "0651234567",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(200);
          message.should.be
            .a("string")
            .that.equals("Succesfully added user to database");
          done();
        });
    });
  });

  describe("TC-202 Overview of all users", () => {
    //
    beforeEach((done) => {
      logger.debug("beforeEach called");
      // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
      database.getConnection(function (err, connection) {

        // Use the connection
        connection.query(
          CLEAR_DB,
          function (error, results, fields) {
            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.
            // Let op dat je done() pas aanroept als de query callback eindigt!
            logger.debug("beforeEach done");
            done();
          }
        );
      });
    });

    it("202-1 Don't show any users", (done) => {
      chai
        .request(index)
        .get("/api/user")
        .end((req, res) => {
          let { status, message } = res.body;
          message.should.be.an('array')
          // .that.equals("[]");
          done();
        });
    });

    it("202-2 Show 2 users", (done) => {
      chai
        .request(index)
        .get("/api/user")
        .end((req, res) => {
          let { status, message } = res.body;
          message.should.be.an('array')
          // .that.equals("[]");
          done();
        });
    });
  });
  describe("TC-203 Request userprofile", () => {
    //
    beforeEach((done) => {
      logger.debug("beforeEach called");
      // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
      database.getConnection(function (err, connection) {

        // Use the connection
        connection.query(
          CLEAR_DB,
          function (error, results, fields) {
            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.
            // Let op dat je done() pas aanroept als de query callback eindigt!
            logger.debug("beforeEach done");
            done();
          }
        );
      });
    });
    it("203-1 invalid token", (done) => {
      chai
        .request(index)
        .get("/api/user/profile")
        .auth(invalidToken, {type: 'bearer'})
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equals(401);
          message.should.be.a("string")
          .that.equals("Invalid token");
          done();
        });
    });

    it("203-2 valid token and user exists", (done) => {
      chai
        .request(index)
        .get("/api/user/profile")
        .auth(validToken, {type: 'bearer'})
        .end((req, res) => {
          // let { status, message } = res.body;
          // status.should.equals(401);
          // message.should.be.a("string")
          // .that.equals("Invalid token");
          done();
        });
    });



  });


  describe("TC-204 User details", () => {
    //
    beforeEach((done) => {
      logger.debug("beforeEach called");
      // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
      database.getConnection(function (err, connection) {

        // Use the connection
        connection.query(
          CLEAR_DB,
          function (error, results, fields) {
            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.
            // Let op dat je done() pas aanroept als de query callback eindigt!
            logger.debug("beforeEach done");
            done();
          }
        );
      });
    });
    it("204-1 invalid token", (done) => {
      chai
        .request(index)
        .get("/api/user/2")
        .auth(invalidToken, {type: 'bearer'})
        .end((req, res) => {
          let { status, message } = res.body;
          // status.should.equals(401);
          // message.should.be.a("string")
          // .that.equals("Invalid token");
          done();
        });
    });

    it("204-2 valid token and user does not exist", (done) => {
      chai
        .request(index)
        .get("/api/user/9000")
        .auth(validToken, {type: 'bearer'})
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be.a("string")
          .that.equals("User does not exist");
          done();
        });
    });

    it("204-3 valid token and user does exist", (done) => {
      chai
        .request(index)
        .get("/api/user/1")
        .auth(validToken, {type: 'bearer'})
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equals(200);
          message.should.be.an("array");
          done();
        });
    });

    



  });

  describe("TC-205 Edit user", () => {
    //
    beforeEach((done) => {
      logger.debug("beforeEach called");
      // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
      database.getConnection(function (err, connection) {

        // Use the connection
        connection.query(
          CLEAR_DB + ADD_USER ,
          function (error, results, fields) {
            if (error) {
              logger.warn(error);
            }

            // When done with the connection, release it.
  

            // Handle error after the release.
            // Let op dat je done() pas aanroept als de query callback eindigt!
            logger.debug("beforeEach done");
            connection.query(
              GET_USER,
              function (error, results, fields) {
                logger.warn("results: "+results[0].id);
                userId = results[0].id;
                if (error) {
                  logger.warn(error);
                }
                
                // When done with the connection, release it.
                connection.release();
    
                // Handle error after the release.
                // Let op dat je done() pas aanroept als de query callback eindigt!
                logger.debug("beforeEach done");
                done();
              }
            );
          }
          
        );


      });
    });
    it("205-1 missing field emailAdress", (done) => {
      chai
        .request(index)
        .put("/api/user/"+userId)
        .auth(validToken, {type: 'bearer'})
        .send({
            firstName: "Herman",
            lastName: "Huizinga",
            isActive: 1,
            password: "secret",
            phoneNumber: "06-12345678",
            roles: "editor,guest",
            street: "",
            city: ""

        })
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string")
          .that.equals("emailAdress must be a string");
          done();
        });
    });

    it("205-3 invalid password", (done) => {
      chai
        .request(index)
        .put("/api/user/"+userId)
        .auth(validToken, {type: 'bearer'})
        .send({
            firstName: "Herman",
            lastName: "Huizinga",
            isActive: 1,
            password: "secret",
            phoneNumber: "06-12345678",
            roles: "editor,guest",
            street: "",
            city: ""

        })
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string")
          .that.equals("emailAdress must be a string");
          done();
        });
    });
    it("205-4 user does not exist", (done) => {
      chai
        .request(index)
        .put("/api/user/300000")
        .auth(validToken, {type: 'bearer'})
        .send({
            firstName: "Herman",
            lastName: "Huizinga",
            isActive: 1,
            emailAdress: "h.huizinga@server.nl",
            password: "D1mD29!!df",
            phoneNumber: "06-12345678",
            roles: "editor,guest",
            street: "",
            city: ""

        })
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string")
          .that.equals("User does not exist");
          done();
        });
    });

    it("205-5 Not logged in", (done) => {
      chai
        .request(index)
        .put("/api/user/"+userId)
        .send({
            firstName: "Herman",
            lastName: "Huizinga",
            isActive: 1,
            emailAdress: "h.huizinga@server.nl",
            password: "D1mD29!!df",
            phoneNumber: "06-12345678",
            roles: "editor,guest",
            street: "",
            city: ""

        })
        .end((req, res) => {
          let { error , status} = res.body;
          error.should.be.a("string").that.equals("Authorization header missing!");
          done();
        });
    });
    it("205-6 Succesfully edited user", (done) => {
      chai
        .request(index)
        .put("/api/user/"+userId)
        .auth(validToken, {type: 'bearer'})
        .send({
            firstName: "Removable",
            lastName: "man",
            isActive: 1,
            emailAdress: "goos@avans.nl",
            password: "D1mD29!!df",
            phoneNumber: "05322222222",
            roles: "editor,guest",
            street: "behind",
            city: "you"

        })
        .end((req, res) => {
          let { status, message } = res.body;
 
          status.should.equals(200);
          message.should.be.an("object");
          logger.warn(res.body);
          done();
        });
    });
  });

  describe("TC-206 Delete user", () => {
    //
    beforeEach((done) => {
      logger.debug("beforeEach called");
      // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
      database.getConnection(function (err, connection) {

        // Use the connection
        connection.query(
          ADD_USER,
          function (error, results, fields) {
            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.

            // Let op dat je done() pas aanroept als de query callback eindigt!
            logger.debug("beforeEach done");
            done();
          }
        );
      });
    });
    it("206-1 User does not exist ", (done) => {
      chai
        .request(index)
        .delete("/api/user/300000")
        .auth(validToken, {type: 'bearer'})
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string")
          .that.equals("User does not exist");
          done();
        });

      });

      it("206-2 Not logged in ", (done) => {
        chai
          .request(index)
          .delete("/api/user/4")

          .end((req, res) => {
            let { error , status} = res.body;
            error.should.be.a("string").that.equals("Authorization header missing!");
            done();
          });
  
        });

        // it("206-3 Actor is not the owner ", (done) => {
        //   chai
        //     .request(index)
        //     .delete("/api/user/4")
        //     .auth(validToken, {type: 'bearer'}) 
        //     .end((req, res) => {
        //       let { status, message } = res.body;
        //   status.should.equals(400);
        //   message.should.be.a("string")
        //   .that.equals("User does not exist");
        //   done();
        //     }); 
        //   });


        // it("206-4 Succesfully deleted user ", (done) => {
        //   chai
        //     .request(index)
        //     .delete("/api/user/4")
  
        //     .end((req, res) => {
        //       let { error , status} = res.body;
        //       error.should.be.a("string").that.equals("Authorization header missing!");
        //       done();
        //     });
    
        //   });

    });
    


});
