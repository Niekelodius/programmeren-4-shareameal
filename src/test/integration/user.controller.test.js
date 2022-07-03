process.env.LOGLEVEL = "warn";
process.env.DATABASE = process.env.DATABASE || "share-a-meal";

const chai = require("chai");
const chaiHttp = require("chai-http");
const pool = require("../../../database/dbConnection");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const assert = require("assert");
const { jwtSecretKey, logger } = require("../../../src/config/config");
const index = require("../../../index");
const res = require("express/lib/response");
chai.should();
chai.use(chaiHttp);
const { expect } = require("chai");
const { stat } = require("fs");

let userId = 5;

let validToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY1Njg0NzE3NSwiZXhwIjoxNjU3ODgzOTc1fQ.61H7DsY8KVpizqLdlda1yf93TjiqYHKVrt69v96HYUY";
const invalidToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIyNywiaWF0IjoxNjUyNzg3NzA4LCJleHAiOjE2NTM4MjQ1MDh9.NAW7Ol_7WrEdPYH1B7-6mKFsGGpX3xPwEQBctIKlPvU";
const CLEAR_MEAL = "DELETE FROM `meal`;";
const CLEAR_DB =
  "DELETE  FROM `user` WHERE emailAdress = 'test@avans.nl' OR emailAdress = 'ng@avans.nl';";
const GET_USER = "SELECT id FROM `user` WHERE emailAdress = 'goos@avans.nl';";
const ADD_USER =
  "INSERT INTO `user`" +
  "(`firstName`, `lastName`, `street`, `city`, `password`, `emailAdress`, `phoneNumber`,`roles` )" +
  "VALUES ('Removable', 'man', 'behind', 'you', 'D389!!ach', 'test@avans.nl', '05322222222', 'editor');  ";

describe("Manage users /api/user", () => {
  describe("TC-201 Register as new user", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
      pool.query(CLEAR_MEAL, function (error, results, fields) {
        if (error) throw error;
        logger.debug("beforeEach done");
        pool.query(CLEAR_DB, function (error, results, fields) {
          if (error) throw error;
          pool.query(ADD_USER, function (error, results, fields) {
            if (error) throw error;
            else {
              userId = results.insertId;
              logger.warn("real userId: " + userId);
            }
            done();
            logger.debug("beforeEach done");
          });
        });
      });
    });

    it("201-1 Missing required field", (done) => {
      chai
        .request(index)
        .post("/api/user")
        .send({
          lastName: "G",
          isActive: 1,
          street: "a",
          city: "b",
          roles: "admin",
          emailAdress: "ng@avans.nl",
          password: "D1mWW22!",
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

    it("201-2 Invalid emailAddress", (done) => {
      chai
        .request(index)
        .post("/api/user")
        .send({
          firstName: "N",
          lastName: "G",
          emailAdress: "ng.avans.nl",
          isActive: true,
          roles: "admin",
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

    it("201-3 Invalid password", (done) => {
      chai
        .request(index)
        .post("/api/user")
        .send({
          firstName: "N",
          lastName: "G",
          isActive: true,
          roles: "admin",
          street: "a",
          city: "b",
          password: "",
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
          roles: "admin",
          street: "a",
          city: "b",
          emailAdress: "test@avans.nl",
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

    it("201-5 Succesfully return user", (done) => {
      chai
        .request(index)
        .post("/api/user")
        .send({
          firstName: "N",
          lastName: "G",
          isActive: true,
          roles: "admin",
          street: "a",
          city: "b",
          emailAdress: "ng@avans.nl",
          password: "D1mwwVhTT22!",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          expect(result).to.have.own.property("id");
          status.should.equals(200);
          expect(result).to.deep.include({
            firstName: "N",
            lastName: "G",
            isActive: 1,
            roles: "admin",
            street: "a",
            city: "b",
            emailAdress: "ng@avans.nl",
            password: "D1mwwVhTT22!",
          });
          done();
        });
    });
  });

  describe("TC-202 Overview of all users", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
      pool.query(CLEAR_MEAL, function (error, results, fields) {
        if (error) throw error;
        logger.debug("beforeEach done");
        pool.query(CLEAR_DB, function (error, results, fields) {
          if (error) throw error;
          done();
        });
      });
    });

    // it("202-1 Show 0 users", (done) => {
    //   chai
    //     .request(index)
    //     .get("/api/user")
    //     .end((req, res) => {
    //       let { status, result } = res.body;
    //       status.should.equals(200);
    //       expect([result]).to.deep.include([]);
    //       done();
    //     });
    // });

    it("202-2 Show 2 users", (done) => {
      pool.query(ADD_USER, function (error, results, fields) {
        if (error) throw error;
        else {
          userId = results.insertId;
          logger.warn("real userId: " + userId);
        }

        logger.debug("beforeEach done");
      });
      chai
        .request(index)
        .get("/api/user")
        .end((req, res) => {
          let { status, result } = res.body;
          logger.warn(result);
          status.should.equals(200);
          result.should.be.an("array");
          // expect([result]).to.deep.include([{

          // }])
          done();
        });
    });

    it("202-3 Show users with searchterm on non-existent name", (done) => {
      pool.query(ADD_USER, function (error, results, fields) {
        if (error) throw error;
        else {
          userId = results.insertId;
          logger.warn("real userId: " + userId);
        }

        logger.debug("beforeEach done");
      });
      chai
        .request(index)
        .get("/api/user?firstname=naam")
        .end((req, res) => {
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.an("array");
          // expect([result]).to.deep.include([{

          // }])
          done();
        });
    });
    it("202-4 Show users with searchterm isActive = false", (done) => {
      pool.query(ADD_USER, function (error, results, fields) {
        if (error) throw error;
        else {
          userId = results.insertId;
          logger.warn("real userId: " + userId);
        }

        logger.debug("beforeEach done");
      });
      chai
        .request(index)
        .get("/api/user?isActive=false")
        .end((req, res) => {
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.an("array");
          // expect([result]).to.deep.include([{

          // }])
          done();
        });
    });
    it("202-5 Show users with searchterm isActive = true", (done) => {
      pool.query(ADD_USER, function (error, results, fields) {
        if (error) throw error;
        else {
          userId = results.insertId;
          logger.warn("real userId: " + userId);
        }

        logger.debug("beforeEach done");
      });
      chai
        .request(index)
        .get("/api/user?isActive=true")
        .end((req, res) => {
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.an("array");
          // expect([result]).to.deep.include([{

          // }])
          done();
        });
    });
    it("202-6 Show users with searchterm on existing name", (done) => {
      pool.query(ADD_USER, function (error, results, fields) {
        if (error) throw error;
        else {
          userId = results.insertId;
          logger.warn("real userId: " + userId);
        }

        logger.debug("beforeEach done");
      });
      chai
        .request(index)
        .get("/api/user?firstname=test@avans.nl")
        .end((req, res) => {
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.an("array");
          // expect([result]).to.deep.include([{

          // }])
          done();
        });
    });
  });
  describe("TC-203 Request userprofile", () => {
    let userToken;
    beforeEach((done) => {
      logger.debug("beforeEach called");
      pool.query(CLEAR_MEAL, function (error, results, fields) {
        if (error) throw error;
        logger.debug("beforeEach done");
        pool.query(CLEAR_DB, function (error, results, fields) {
          if (error) throw error;
          pool.query(ADD_USER, function (error, results, fields) {
            if (error) throw error;
            // pool.query(
            //     "SELECT `id`, `emailAdress`, `password`, `firstName`, `lastName` FROM `user` WHERE `emailAdress` = 'test@avans.nl'",
            //     (err, rows, fields) => {
            //       // connection.release();
            //       if (err) {
            //         logger.error("Error: ", err.toString());
            //       }
            //       if (rows) {
            //         // 2. Er was een resultaat, check het password.
            //         if (
            //           rows &&
            //           rows.length === 1
            //         ) {
            //           logger.warn(
            //             "passwords DID match, sending userinfo and valid token"
            //           );
            //           // Extract the password from the userdata - we do not send that in the response.
            //           const { password, ...userinfo } = rows[0];
            //           // Create an object containing the data we want in the payload.
            //           const payload = {
            //             userId: userinfo.id,
            //           };

            //           jwt.sign(
            //             payload,
            //             jwtSecretKey,
            //             { expiresIn: "12d" },
            //             function (err, token) {
            //               userToken = token
            //               logger.warn("User logged in, sending: ", token);
            //               done();
            //             }
            //           );
            //         } else {
            //           logger.info("User not found or password invalid");
            //         }
            //       }
            //     }
            //   );
            done();
            // pool.query("", function (error, results, fields) {
            //     if (error) throw error;
            //     else{
            //       userId = results.insertId;
            //       logger.warn("real userId: "+userId);

            //       jwt.sign(
            //         payload,
            //         jwtSecretKey,
            //         { expiresIn: "12d" },
            //         function (err, token) {
            //           logger.debug("User logged in, sending: ", userinfo, token);
            //           res.status(200).json({
            //             status: 200,
            //             result: { ...userinfo, token },
            //           });
            //         }
            //       );
            //     }
            //     done();
            //     logger.debug("beforeEach done");
            //   });
          });
        });
      });
    });
    it("203-1 Invalid token", (done) => {
      chai
        .request(index)
        .get("/api/user/profile")
        .auth(invalidToken, { type: "bearer" })
        .end((req, res) => {
          let { status, message, error } = res.body;
          logger.warn(error);
          status.should.equals(401);
          message.should.be.a("string").that.equals("error");
          done();
        });
    });

    //   it("203-2 Valid token and user exists", (done) => {
    //     chai
    //       .request(index)
    //       .get("/api/user/profile")
    //       .auth(userToken, { type: "bearer" })
    //       .end((req, res) => {
    //         let { status, message } = res.body;
    //         status.should.equals(200);
    //         expect(result).to.have.own.property('id', 'firstName', 'lastName', 'isActive', 'password', 'phoneNumber', 'street', 'city');
    //         done();
    //       });
    //   });
  });

  describe("TC-204 User details", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
      pool.query(CLEAR_MEAL, function (error, results, fields) {
        if (error) throw error;
        logger.debug("beforeEach done");
        pool.query(CLEAR_DB, function (error, results, fields) {
          if (error) throw error;
          pool.query(ADD_USER, function (error, results, fields) {
            if (error) throw error;
            else {
              userId = results.insertId;
              logger.warn("real userId: " + userId);
            }
            done();
            logger.debug("beforeEach done");
          });
        });
      });
    });
    it("204-1 Invalid token", (done) => {
      chai
        .request(index)
        .get("/api/user/2")
        .auth(invalidToken, { type: "bearer" })
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equals(401);
          message.should.be.a("string").that.equals("error");
          done();
        });
    });

    it("204-2 User-ID does not exist", (done) => {
      chai
        .request(index)
        .get("/api/user/9000")
        .auth(validToken, { type: "bearer" })
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be.a("string").that.equals("User does not exist");
          done();
        });
    });

    it("204-3 User-ID exists", (done) => {
      chai
        .request(index)
        .get("/api/user/" + userId)
        .auth(validToken, { type: "bearer" })
        .end((req, res) => {
          let { status, result } = res.body;
          status.should.equals(200);
          expect(result).to.deep.include({
            firstName: "Removable",
            lastName: "man",
            roles: "editor",
            street: "behind",
            phoneNumber: "05322222222",
            city: "you",
            emailAdress: "test@avans.nl",
            password: "D389!!ach",
          });
          done();
        });
    });
  });

  describe("TC-205 Edit user", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
      pool.query(CLEAR_MEAL, function (error, results, fields) {
        if (error) throw error;
        logger.debug("beforeEach done");
        pool.query(CLEAR_DB, function (error, results, fields) {
          if (error) throw error;
          pool.query(ADD_USER, function (error, results, fields) {
            if (error) throw error;
            else {
              userId = results.insertId;
              logger.warn("real userId: " + userId);
            }
            done();
            logger.debug("beforeEach done");
          });
        });
      });
    });

    it("205-1 Missing field emailAddress", (done) => {
      chai
        .request(index)
        .put("/api/user/" + userId)
        .auth(validToken, { type: "bearer" })
        .send({
          firstName: "Herman",
          lastName: "Huizinga",
          isActive: 1,
          password: "secret",
          phoneNumber: "06-12345678",
          roles: "admin,guest",
          street: "",
          city: "",
        })
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("emailAdress must be a string");
          done();
        });
    });

    it("205-3 Invalid emailaddress", (done) => {
      chai
        .request(index)
        .put("/api/user/" + userId)
        .auth(validToken, { type: "bearer" })
        .send({
          firstName: "Herman",
          lastName: "Huizinga",
          isActive: 1,
          password: "secret",
          phoneNumber: "06-12345678",
          roles: "admin,guest",
          street: "",
          city: "",
        })
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("emailAdress must be a string");
          done();
        });
    });
    it("205-4 User does not exist", (done) => {
      chai
        .request(index)
        .put("/api/user/" + 9999999)
        .auth(validToken, { type: "bearer" })
        .send({
          firstName: "Removable",
          lastName: "man",
          roles: "admin",
          street: "behind",
          phoneNumber: "0657776634",
          city: "you",
          emailAdress: "test@avans.nl",
          password: "D1mwwVhTT22!",
        })
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string").that.equals("User does not exist");
          done();
        });
    });

    it("205-5 Not logged in", (done) => {
      chai
        .request(index)
        .put("/api/user/" + userId)
        .send({
          firstName: "Removable",
          lastName: "man",
          roles: "admin",
          street: "behind",
          phoneNumber: "05322222222",
          city: "you",
          emailAdress: "test@avans.nl",
          password: "D1mwwVhTT22!",
        })
        .end((req, res) => {
          let { error, status } = res.body;
          status.should.equals(401);
          error.should.be
            .a("string")
            .that.equals("Authorization header missing!");
          done();
        });
    });
    // it("205-6 User succesfully edited", (done) => {
    //   // chai
    //   //   .request(index)
    //   //   .post("/api/auth/login")
    //   //   .send({
    //   //     emailAdress: "test@avans.nl",
    //   //     password: "D389!!ach",
    //   //   })
    //   //   .end((req, res) => {
    //   //     res.should.be.an("object");
    //   //     let { status, result } = res.body;

    //   //     logger.warn(result);
    //   //     status.should.equals(200);
    //   //     validToken = result.token;
    //   //     expect(result).to.have.own.property("token");
    //       chai
    //         .request(index)
    //         .put("/api/user/" + userId)
    //         .auth(validToken)
    //         .send({
    //           firstName: "Removable",
    //           lastName: "man",
    //           roles: "admin",
    //           street: "behind",
    //           phoneNumber: "05322222222",
    //           city: "you",
    //           emailAdress: "test@avans.nl",
    //           password: "D1mwwVhTT22!",
    //         })
    //         .end((req, res) => {
    //           let {error, status } = res.body;
    //           logger.warn(error);
    //           status.should.equals(200);
    //           // error.should.be
    //           //   .a("string")
    //           //   .that.equals("Authorization header missing!");
    //           done();
    //         });
    //     // });
    // });
  });

  describe("TC-206 Delete user", () => {
    //
    beforeEach((done) => {
      logger.debug("beforeEach called");
      pool.query(CLEAR_MEAL, function (error, results, fields) {
        if (error) throw error;
        logger.debug("beforeEach done");
        pool.query(CLEAR_DB, function (error, results, fields) {
          if (error) throw error;
          pool.query(ADD_USER, function (error, results, fields) {
            if (error) throw error;
            else {
              userId = results.insertId;
              logger.warn("real userId: " + userId);
            }
            done();
            logger.debug("beforeEach done");
          });
        });
      });
    });
    it("206-1 User does not exist ", (done) => {
      chai
        .request(index)
        .delete("/api/user/" + 99999)
        .auth(validToken, { type: "bearer" })
        .end((req, res) => {
          let { message, status } = res.body;
          status.should.equals(400);
          message.should.be.a("string").that.equals("User does not exist");
          done();
        });
    });
    it("206-2 Not logged in ", (done) => {
      chai
        .request(index)
        .delete("/api/user/4")

        .end((req, res) => {
          let { error, status } = res.body;
          status.should.equals(401);
          error.should.be
            .a("string")
            .that.equals("Authorization header missing!");
          done();
        });
    });
    it("206-3 User does not own data ", (done) => {
      chai
        .request(index)
        .delete("/api/user/" + userId)
        .auth("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY1Njg0ODAwNywiZXhwIjoxNjU3ODg0ODA3fQ.lMHgieQgXN6HWqmJPoau7auhG8gfCylyfOzq-6hJdRE", { type: "bearer" })
        .end((req, res) => {
          let { message, status } = res.body;
          status.should.equals(403);
          message.should.be.a("string").that.equals("Unauthorized");
          done();
        });
    });
      it("206-4 Succesfully deleted user ", (done) => {
        chai
          .request(index)
          .delete("/api/user/"+userId+"?test=true")
          .auth(validToken, { type: "bearer" })
          .end((req, res) => {
            let { message, status } = res.body;
            logger.warn(res.body);
            status.should.equals(200)
            // message.should.be
            //   .a("string")
            //   .that.equals("Unauthorized");
            done();
          });
      });
  });
});
