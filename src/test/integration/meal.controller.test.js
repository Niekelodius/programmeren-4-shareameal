process.env.DATABASE = process.env.DATABASE || "share-a-meal";
process.env.LOGLEVEL = "warn";

const chai = require("chai");
const chaiHttp = require("chai-http");
const database = require("../../../database/dbConnection");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const assert = require("assert");
const { jwtSecretKey, logger } = require("../../../src/config/config");
const index = require("../../../index");
const res = require("express/lib/response");
chai.should();
chai.use(chaiHttp);

let validToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTY1MzA1NDQwMiwiZXhwIjoxNjU0MDkxMjAyfQ.qjG8JF3E-usyhLJCg02mDoKmtO3V36dPUH4vgJxfCIA";
const invalidToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIyNywiaWF0IjoxNjUyNzg3NzA4LCJleHAiOjE2NTM4MjQ1MDh9.NAW7Ol_7WrEdPYH1B7-6mKFsGGpX3xPwEQBctIKlPvU";

const CLEAR_DB = "DELETE  FROM `meal` WHERE emailAdress = 'ng@avans.nl';";

describe("Manage meals /api/meal", () => {
  describe("TC-301 Add meal", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
      database.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(CLEAR_DB, function (error, results, fields) {
          connection.release();
          if (err) throw err;
          logger.debug("beforeEach done");
          done();
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
      database.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(CLEAR_DB, function (error, results, fields) {
          connection.release();
          if (err) throw err;
          logger.debug("beforeEach done");
          done();
        });
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
      database.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(CLEAR_DB, function (error, results, fields) {
          connection.release();
          if (err) throw err;
          logger.debug("beforeEach done");
          done();
        });
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
          result.should.be.an("array");
          done();
        });
    });
  });
  describe("TC-304 Request meal details", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
      database.getConnection(function (err, connection) {
        if (err) throw err;

        connection.query(CLEAR_DB, function (error, results, fields) {
          connection.release();

          if (err) throw err;
          logger.debug("beforeEach done");
          done();
        });
      });
    });

    it("304-1 Meal does not exist", (done) => {
      chai
        .request(index)
        .get("/api/meal/99999")
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be.a("string").that.equals("Meal does not exist");
          done();
        });
    });
  });
  describe("TC-305 Delete meal", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");

      database.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(CLEAR_DB, function (error, results, fields) {
          connection.release();

          if (err) throw err;
          logger.debug("beforeEach done");
          done();
        });
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
