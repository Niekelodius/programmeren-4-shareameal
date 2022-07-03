process.env.DATABASE = process.env.DATABASE || "share-a-meal";
process.env.LOGLEVEL = "warn";

const chai = require("chai");
const chaiHttp = require("chai-http");
const pool = require("../../../database/dbConnection");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const assert = require("assert");
const { jwtSecretKey, logger } = require("../../../src/config/config");
const index = require("../../../index");
const res = require("express/lib/response");
const { expect } = require("chai");
const { stat } = require("fs");
chai.should();
chai.use(chaiHttp);

let validToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY1Njg0NzE3NSwiZXhwIjoxNjU3ODgzOTc1fQ.61H7DsY8KVpizqLdlda1yf93TjiqYHKVrt69v96HYUY";
const invalidToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIyNywiaWF0IjoxNjUyNzg3NzA4LCJleHAiOjE2NTM4MjQ1MDh9.NAW7Ol_7WrEdPYH1B7-6mKFsGGpX3xPwEQBctIKlPvU";

const CLEAR_DB = "DELETE FROM `meal`;";
const CLEAR_USER = "DELETE FROM `user` WHERE emailAdress = 'test@avans.nl';";
const ADD_MEAL =
  "INSERT INTO `meal` " +
  "(`id`, `isActive`, `isVega`, `isVegan`, `isToTakeHome`, `dateTime`, `maxAmountOfParticipants`,`price`, `imageUrl`, `createDate`, `updateDate`, `name`, `description`, `allergenes` )" +
  "VALUES (1,1,0,0,1,'2022-03-22 17:35:00',4,12.75,'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg','2022-02-26 18:12:40.048998','2022-04-26 12:33:51.000000','Pasta Bolognese met tomaat, spekjes en kaas','Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!','gluten,lactose')";
const ADD_USER =
  "INSERT INTO `user`" +
  "(`firstName`, `lastName`, `street`, `city`, `password`, `emailAdress`, `phoneNumber`,`roles` )" +
  "VALUES ('Removable', 'man', 'behind', 'you', 'D389!!ach', 'test@avans.nl', '05322222222', 'editor');  ";
describe("Manage meals /api/meal", () => {
  describe("TC-301 Add meal", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
      pool.query(CLEAR_DB, function (error, results, fields) {
        if (error) throw error;
        pool.query(CLEAR_USER, function (error, results, fields) {
          if (error) throw error;
          pool.query(ADD_USER, function (error, results, fields) {
            if (error) throw error;
            logger.debug("beforeEach done");
            done();
          });
        });
      });
    });

    it("301-1 Missing required field", (done) => {
      chai
        .request(index)
        .post("/api/meal")
        .auth(validToken, { type: "bearer" })
        .send({
          description: "Friet met mayo",
          isActive: true,
          isVega: false,
          isVegan: true,
          isToTakeHome: true,
          maxAmountOfParticipants: 5,
          price: 5.99,
          dateTime: "2022-08-23",
          imageUrl: "https://imgur.com/a/0WO84",
          allergenes: "aardappel",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("Name must be filled in and a string");
          done();
        });
    });
    it("301-2 Not logged in", (done) => {
      chai
        .request(index)
        .post("/api/meal")

        .send({
          name: "Frietje",
          description: "Friet met mayo",
          isActive: true,
          isVega: false,
          isVegan: true,
          isToTakeHome: true,
          maxAmountOfParticipants: 5,
          price: 5.99,
          dateTime: "2022-08-23",
          imageUrl: "https://imgur.com/a/0WO84",
          allergenes: "aardappel",
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
    it("301-3 Succesfully added meal", (done) => {
      chai
        .request(index)
        .post("/api/auth/login")
        .send({
          emailAdress: "test@avans.nl",
          password: "D389!!ach",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;

          logger.warn(result);
          status.should.equals(200);
          validToken = result.token;
          expect(result).to.have.own.property("token");
          // done();
          chai
            .request(index)
            .post("/api/meal")
            .auth(validToken, { type: "bearer" })
            .send({
              name: "Friet",
              description: "Friet met mayo",
              isActive: true,
              isVega: false,
              isVegan: true,
              isToTakeHome: true,
              cookId: 1,
              maxAmountOfParticipants: 5,
              price: 5.99,
              dateTime: "2022-08-23T22:00:00.000Z",
              imageUrl: "https://imgur.com/a/0WO84",
              allergenes: [],
            })
            .end((req, res) => {
              let { result, status } = res.body;
              status.should.equals(201);
              expect(result).to.deep.include({
                isActive: 1,
                isVega: 0,
                isVegan: 1,
                isToTakeHome: 1,
                maxAmountOfParticipants: 5,
                price: "5.99",
                imageUrl: "https://imgur.com/a/0WO84",
                name: "Friet",
                description: "Friet met mayo",
                allergenes: "",
              });
              done();
            });
        });
    });
  });

  describe("TC-302 Edit meal", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
      pool.query(CLEAR_DB, function (error, results, fields) {
        if (error) throw error;
        logger.debug("beforeEach done");
        pool.query(ADD_MEAL, function (error, results, fields) {
          if (error) throw error;
          mealId = results.insertId;
          pool.query(CLEAR_USER, function (error, results, fields) {
            if (error) throw error;
            pool.query(ADD_USER, function (error, results, fields) {
              if (error) throw error;
              logger.debug("beforeEach done");
              done();
            });
          });
          logger.debug("beforeEach done");
        });
      });
    });

    it("302-1 Missing required field", (done) => {
      chai
        .request(index)
        .put("/api/meal/" + mealId)
        .auth(validToken, { type: "bearer" })
        .send({
          description: "Friet met mayo",
          isActive: true,
          isVega: false,
          isVegan: true,
          isToTakeHome: true,
          maxAmountOfParticipants: 5,
          price: 5.99,
          dateTime: "2022-08-23",
          imageUrl: "https://imgur.com/a/0WO84",
          allergenes: ["aardappel", "mayo"],
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("Name must be filled in and a string");
          done();
        });
    });

    it("302-2 Not logged in", (done) => {
      chai
        .request(index)
        .put("/api/meal/" + mealId)
        .send({
          name: "Frietje",
          description: "Friet met mayo",
          isActive: true,
          isVega: false,
          isVegan: true,
          isToTakeHome: true,
          maxAmountOfParticipants: 5,
          price: 5.99,
          dateTime: "2022-08-23",
          imageUrl: "https://imgur.com/a/0WO84",
          allergenes: ["aardappel", "mayo"],
        })
        .end((req, res) => {
          let { error, status } = res.body;
          logger.warn(res.body);
          error.should.be
            .a("string")
            .that.equals("Authorization header missing!");
          done();
        });
    });
    it("302-4 Meal doesn't exist", (done) => {
      chai
        .request(index)
        .put("/api/meal/99999999")
        .auth(validToken, { type: "bearer" })
        .send({
          name: "Frietje",
          description: "Friet met mayo",
          isActive: true,
          isVega: false,
          isVegan: true,
          isToTakeHome: true,
          maxAmountOfParticipants: 5,
          price: 5.99,
          dateTime: "2022-08-23",
          imageUrl: "https://imgur.com/a/0WO84",
          allergenes: ["aardappel", "mayo"],
        })
        .end((req, res) => {
          let { message, status } = res.body;
          status.should.equals(404);
          message.should.be.a("string").that.equals("Meal does not exist");
          done();
        });
    });
    it("302-5 Succesfully edited meal", (done) => {
      chai
        // .request(index)
        // .post("/api/auth/login")
        // .send({
        //   emailAdress: "test@avans.nl",
        //   password: "D389!!ach",
        // })
        // .end((req, res) => {
        //   res.should.be.an("object");
        //   let { status, result } = res.body;

        //   logger.warn(result);
        //   status.should.equals(200);
        //   validToken = result.token;
        //   expect(result).to.have.own.property("token");
          chai
            .request(index)
            .put("/api/meal/" + mealId)
            .auth(validToken, { type: "bearer" })
            .send({
              name: "Frietjes",
              description: "Frietjes met mayo",
              id: 1,
              isActive: false,
              isVega: true,
              isVegan: false,
              isToTakeHome: false,
              maxAmountOfParticipants: 6,
              price: 6.99,
              dateTime: "2022-08-23",
              imageUrl: "https://imgur.com/a/0WO84",
              allergenes: ["aardappel", "mayo"],
            })

            .end((req, res) => {
              let { result, status } = res.body;
              logger.warn(res.body);
              status.should.equals(200);
              logger.warn("result: " + result);
              expect(result).to.deep.include({
                isActive: 0,
                isVega: 1,
                isVegan: 0,
                isToTakeHome: 0,
                maxAmountOfParticipants: 6,
                price: "6.99",
                imageUrl: "https://imgur.com/a/0WO84",
                name: "Frietjes",
                description: "Frietjes met mayo",
                allergenes: "",
              });
              done();
            // });
        });
    });
  });
  describe("TC-303 Request list of meals", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
      pool.query(CLEAR_DB, function (error, results, fields) {
        if (error) throw error;
        logger.debug("beforeEach done");
        pool.query(ADD_MEAL, function (error, results, fields) {
          if (error) throw error;
          logger.debug("beforeEach done");
        });
        done();
      });
    });

    it("303-1 Return list of meals", (done) => {
      chai
        .request(index)
        .get("/api/meal")
        .end((req, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          logger.warn(result);
          var time = new Date();
          result.should.be.an("array");
          done();
        });
    });
  });
  describe("TC-304 Request meal details", () => {
    let mealId = 0;
    beforeEach((done) => {
      logger.debug("beforeEach called");
      pool.query(CLEAR_DB, function (error, results, fields) {
        if (error) throw error;
        logger.debug("beforeEach done");
        pool.query(ADD_MEAL, function (error, results, fields) {
          if (error) throw error;
          else {
            mealId = results.insertId;
            logger.warn("real mealid: " + mealId);
          }
          done();
          logger.debug("beforeEach done");
        });
      });
    });

    it("304-1 Meal does not exist", (done) => {
      chai
        .request(index)
        .get("/api/meal/9999999")
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be.a("string").that.equals("Meal does not exist");
          done();
        });
    });

    it("304-2 Meal details get returned", (done) => {
      chai
        .request(index)
        .get("/api/meal/" + mealId)
        .end((req, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          expect(result).to.deep.include({
            isActive: 1,
            isVega: 0,
            isVegan: 0,
            isToTakeHome: 1,
            maxAmountOfParticipants: 4,
            price: "12.75",
            imageUrl:
              "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
            name: "Pasta Bolognese met tomaat, spekjes en kaas",
            description:
              "Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!",
            allergenes: "gluten,lactose",
          });
          done();
        });
    });
  });
  describe("TC-305 Delete meal", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");

      pool.query(CLEAR_DB, function (error, results, fields) {
        if (error) throw error;
        logger.debug("beforeEach done");
        pool.query(ADD_MEAL, function (error, results, fields) {
          mealId = results.insertId;
          if (error) throw error;
          logger.debug("beforeEach done");
        });
        done();
      });
    });
    it("305-2 Not logged in", (done) => {
      chai
        .request(index)
        .delete("/api/meal/99999")
        .end((req, res) => {
          let { error, status } = res.body;
          status.should.equals(401);
          error.should.be
            .a("string")
            .that.equals("Authorization header missing!");
          done();
        });
    });
    it("305-3 Does not own the meal", (done) => {
      chai
        .request(index)
        .delete("/api/meal/" + mealId)
        .auth(validToken, { type: "bearer" })
        .end((req, res) => {
          let { message, status } = res.body;
          status.should.equals(403);
          message.should.be.a("string").that.equals("Unauthorized");
          done();
        });
    });
    it("305-4 Meal does not exist", (done) => {
      chai
        .request(index)
        .get("/api/meal/99999")
        .auth(validToken, { type: "bearer" })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be.a("string").that.equals("Meal does not exist");
          done();
        });
    });
  });
});
