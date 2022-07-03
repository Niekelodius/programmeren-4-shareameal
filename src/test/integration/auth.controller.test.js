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
const { expect } = require("chai");

let validToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY1Njg0NzE3NSwiZXhwIjoxNjU3ODgzOTc1fQ.61H7DsY8KVpizqLdlda1yf93TjiqYHKVrt69v96HYUY";
const invalidToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIyNywiaWF0IjoxNjUyNzg3NzA4LCJleHAiOjE2NTM4MjQ1MDh9.NAW7Ol_7WrEdPYH1B7-6mKFsGGpX3xPwEQBctIKlPvU";
  const CLEAR_DB = "DELETE  FROM `user` WHERE emailAdress = 'test@avans.nl' OR emailAdress = 'ng@avans.nl';";
const ADD_USER =
  "INSERT INTO `user`" +
  "(`firstName`, `lastName`, `street`, `city`, `password`, `emailAdress`, `phoneNumber`,`roles` )" +
  "VALUES ('Removable', 'man', 'behind', 'you', 'D389!!ach', 'test@avans.nl', '05322222222', 'editor');  ";

describe("Authentication /auth/login", () => {
  describe("TC-101 Login", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
      pool.query(CLEAR_DB, function (error, results, fields) {
        if (error) throw error;
        logger.debug("beforeEach done");
        pool.query(ADD_USER, function (error, results, fields) {
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

    it("101-1 Missing required field", (done) => {
      chai
        .request(index)
        .post("/api/auth/login")
        .send({
          emailAdress: "ng@avans.nl",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string");
          done();
        });
    });
    it("101-2 Invalid emailAddress", (done) => {
      chai
        .request(index)
        .post("/api/auth/login")
        .send({
          emailAdress: 1,
          password: "Niek",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string");
          done();
        });
    });
    it("101-3 Invalid password", (done) => {
      chai
        .request(index)
        .post("/api/auth/login")
        .send({
          emailAdress: "ng@avans.nl",
          password: 1,
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string");
          done();
        });
    });
    it("101-4 User does not exist", (done) => {
      chai
        .request(index)
        .post("/api/auth/login")
        .send({
          emailAdress: "ng@avans.nl",
          password: "D1mwwVhTT22!",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;

          status.should.equals(404);
          message.should.be.a("string");
          done();
        });
    });
    it("101-5 User succesfully logged in", (done) => {
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
          expect(result).to.have.own.property("token");
          done();
        });
    });
  });
});
