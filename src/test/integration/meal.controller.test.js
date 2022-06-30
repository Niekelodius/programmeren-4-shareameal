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
chai.should();
chai.use(chaiHttp);

let validToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ0LCJpYXQiOjE2NTY1ODU4MDUsImV4cCI6MTY1NzYyMjYwNX0.uo-dQ3uSh0jkLGY3oEnIFpRVZ6hwzsSxqrZsCdN4P4c";
const invalidToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIyNywiaWF0IjoxNjUyNzg3NzA4LCJleHAiOjE2NTM4MjQ1MDh9.NAW7Ol_7WrEdPYH1B7-6mKFsGGpX3xPwEQBctIKlPvU";

const CLEAR_DB = "DELETE FROM `meal`;";
const ADD_MEAL = "INSERT INTO `meal` VALUES (1,1,0,0,1,'2022-03-22 17:35:00',4,12.75,'https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg',1,'2022-02-26 18:12:40.048998','2022-04-26 12:33:51.000000','Pasta Bolognese met tomaat, spekjes en kaas','Een heerlijke klassieker! Altijd goed voor tevreden gesmikkel!','gluten,lactose')"

describe("Manage meals /api/meal", () => {
  describe("TC-301 Add meal", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
        pool.query(CLEAR_DB, function (error, results, fields) {
          if (error) throw error;
          logger.debug("beforeEach done");
          done();
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
          error.should.be
            .a("string")
            .that.equals("Authorization header missing!");
          done();
        });
    });
  });

  describe("TC-302 Edit meal", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
      pool.query(CLEAR_DB, function (error, results, fields) {
          if (error) throw error;
          logger.debug("beforeEach done");
          done();
        });
    });

    it("302-1 Missing required field", (done) => {
      chai
        .request(index)
        .put("/api/meal/1")
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

    it("302-2 Not logged in", (done) => {
      chai
        .request(index)
        .put("/api/meal/1")
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
          logger.warn(res.body);
          error.should.be
            .a("string")
            .that.equals("Authorization header missing!");
          done();
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
            else{
              mealId = results.insertId;
              logger.warn("real mealid: "+mealId);
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
        .get("/api/meal/"+mealId)
        .end((req, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.an("array");
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
          done();
        });
    });

    it("305-2 Not logged in", (done) => {
      chai
        .request(index)
        .delete("/api/meal/99999")
        .end((req, res) => {
          let { error, status } = res.body;
          error.should.be
            .a("string")
            .that.equals("Authorization header missing!");
          done();
        });
    });
    it("305-3 Meal does not exist", (done) => {
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
