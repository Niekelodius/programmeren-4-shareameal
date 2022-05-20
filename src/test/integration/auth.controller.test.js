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


  describe("Authentication /auth/login", () => {
    describe("TC-101 Login", () => {
      beforeEach((done) => {
        logger.debug("beforeEach called");
        // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
        done();
      });
  
      it("101-1 Verplicht veld ontbreekt", (done) => {
        chai
          .request(index)
          .post("/auth/login")
          .send({
            emailAdress: "ng@avans.nl"
          })
          .end((req, res) => {
            res.should.be.an("object");
            let { status, message } = res.body;
            status.should.equals(400);
            message.should.be
              .a("string");
            done();
          });
      });
      it("101-2 Niet-valide email adres", (done) => {
        chai
          .request(index)
          .post("/auth/login")
          .send({
            emailAdress: 1,
            password: "Niek"
          })
          .end((req, res) => {
            res.should.be.an("object");
            let { status, message } = res.body;
            status.should.equals(400);
            message.should.be
              .a("string");
            done();
          });
      });
      it("101-3 Niet-valide wachtwoord", (done) => {
        chai
          .request(index)
          .post("/auth/login")
          .send({
            emailAdress: "ng@avans.nl",
            password: 1
          })
          .end((req, res) => {
            res.should.be.an("object");
            let { status, message } = res.body;
            status.should.equals(400);
            message.should.be
              .a("string");
            done();
          });
      });
      it("101-4 Gebruiker bestaat niet", (done) => {
        chai
          .request(index)
          .post("/auth/login")
          .send({
            emailAdress: "ng@avans.nl",
            password: "123"
          })
          .end((req, res) => {
            res.should.be.an("object");
            let { status, message } = res.body;

            status.should.equals(404);
            message.should.be
              .a("string");
            done();
          });
      });
    });
});