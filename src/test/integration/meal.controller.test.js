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
  describe("TC-301 Maaltijd aanmaken", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
      // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.

      database.getConnection(function (err, connection) {
        if (err) throw err;

        // Use the connection
        connection.query(CLEAR_DB, function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (err) throw err;
          // Let op dat je done() pas aanroept als de query callback eindigt!
          logger.debug("beforeEach done");
          done();
        });
      });
    });

    it("301-1 Verplicht veld ontbreekt", (done) => {
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
    it("301-2 Niet ingelogd", (done) => {
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
    // it("301-3 Maaltijd succesvol toegevoegd", (done) => {
    //   chai
    //     .request(index)
    //     .post("/api/meal")
    //     .auth(validToken, { type: "bearer" })
    //     .send({
    //       name: "Frietje",
    //       description: "Friet met mayo",
    //       isActive: true,
    //       isVega: false,
    //       isVegan: true,
    //       isToTakeHome: true,
    //       maxAmountOfParticipants: 5,
    //       price: 5.99,
    //       dateTime: "2022-08-23",
    //       imageUrl: "https://imgur.com/a/0WO84",
    //       allergenes: "aardappel",
    //     })
    //     .end((req, res) => {
    //       res.should.be.an("object");
    //       let { status, result } = res.body;
    //       status.should.equals(201);
    //       result.should.be.an("object");
    //       done();
    //     });
    // });
  });

  describe("TC-302 Maaltijd wijzigen", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
      // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.

      database.getConnection(function (err, connection) {
        if (err) throw err;

        // Use the connection
        connection.query(CLEAR_DB, function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (err) throw err;
          // Let op dat je done() pas aanroept als de query callback eindigt!
          logger.debug("beforeEach done");
          done();
        });
      });
    });

    it("302-1 Verplicht veld ontbreekt", (done) => {
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

    it("302-2 Niet ingelogd", (done) => {
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

    it("302-4 Maaltijd bestaat niet", (done) => {
      chai
        .request(index)
        .put("/api/meal/1000000")
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
          allergenes: "aardappel",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be.a("string").that.equals("Meal does not exist");
          done();
        });
    });
    // it("302-5 Maaltijd succesvol gewijzigd", (done) => {
    //     chai
    //       .request(index)
    //       .put("/api/meal/1")
    //       .auth(validToken, { type: "bearer" })
    //       .send({
    //           name: "Frietje",
    //         description: "Friet met mayo",
    //         isActive: true,
    //         isVega: false,
    //         isVegan: true,
    //         isToTakeHome: true,
    //         maxAmountOfParticipants: 5,
    //         price: 5.99,
    //         dateTime: "2022-08-23",
    //         imageUrl: "https://imgur.com/a/0WO84",
    //         allergenes: "aardappel",
    //       })
    //       .end((req, res) => {

    //         res.should.be.an("object");
    //         let { status, message } = res.body;
    //         status.should.equals(404);
    //         message.should.be
    //           .a("string")
    //           .that.equals("Meal does not exist");
    //         done();;
    //       });
    //     });
  });
  describe("TC-303 Lijst van maaltijden opvragen", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
      // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.

      database.getConnection(function (err, connection) {
        if (err) throw err;

        // Use the connection
        connection.query(CLEAR_DB, function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (err) throw err;
          // Let op dat je done() pas aanroept als de query callback eindigt!
          logger.debug("beforeEach done");
          done();
        });
      });
    });

    it("303-1 Lijst van maaltijden reretourneerd", (done) => {
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
  describe("TC-304 Details van maaltijd opvragen", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
      // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.

      database.getConnection(function (err, connection) {
        if (err) throw err;

        // Use the connection
        connection.query(CLEAR_DB, function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (err) throw err;
          // Let op dat je done() pas aanroept als de query callback eindigt!
          logger.debug("beforeEach done");
          done();
        });
      });
    });

    it("304-1 Maaltijd bestaat niet", (done) => {
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
    // it("304-2 Details van maaltijd geretourneerd", (done) => {
    //     chai
    //       .request(index)
    //       .get("/api/meal/1")
    //       .end((req, res) => {
    //         res.should.be.an("object");
    //         let { status, message } = res.body;
    //         status.should.equals(200);
    //         message.should.be.an("object");
    //         done();
    //       });
    //   });
  });
  describe("TC-305 Maaltijd verwijderen", () => {
    beforeEach((done) => {
      logger.debug("beforeEach called");
      // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.

      database.getConnection(function (err, connection) {
        if (err) throw err;

        // Use the connection
        connection.query(CLEAR_DB, function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (err) throw err;
          // Let op dat je done() pas aanroept als de query callback eindigt!
          logger.debug("beforeEach done");
          done();
        });
      });
    });

    it("305-2 Niet ingelogd", (done) => {
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
    // it("305-2 Niet de eigenaar van de data", (done) => {
    //     chai
    //       .request(index)
    //       .get("/api/meal/99999")
    //       .end((req, res) => {
    //         res.should.be.an("object");
    //         let { status, message } = res.body;
    //         status.should.equals(404);
    //         message.should.be.a("string").that.equals("Meal does not exist");
    //         done();
    //       });
    //   });
    it("305-3 Maaltijd bestaat niet", (done) => {
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
    //   it("305-3 Maaltijd bestaat niet", (done) => {
    //     chai
    //       .request(index)
    //       .get("/api/meal/99999")
    //       .auth(validToken, { type: "bearer" })
    //       .end((req, res) => {
    //         res.should.be.an("object");
    //         let { status, message } = res.body;
    //         status.should.equals(404);
    //         message.should.be.a("string").that.equals("Meal does not exist");
    //         done();
    //       });
    //   });

  });
});
