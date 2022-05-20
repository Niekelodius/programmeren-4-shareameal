process.env.DATABASE = process.env.DATABASE || "share-a-meal-testdb";

const chai = require("chai");
const chaiHttp = require("chai-http");
const database = require("../../../database/dbConnection");
const index = require("../../../index");
const { logger } = require("../../config/config");
chai.should();
chai.use(chaiHttp);

let userId;

describe("Manage users /api/user", () => {
  describe("TC-201-1 Register new user", () => {
    it("First name missing or invalid", (done) => {
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
  });
  describe("TC-201-1 Register new user", () => {
    it("Email missing or invalid, return valid error", (done) => {
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
          phoneNumber: "0651234567",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("emailAdress must be a string");
          done();
        });
    });
  });
  describe("TC-201-1 Register new user", () => {
    it("Password missing or invalid, return valid error", (done) => {
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
          phoneNumber: "0651234567",
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("password must be a string");
          done();
        });
    });
  });
  describe("TC-201-1 Register new user", () => {
    it("Succesfully added user", (done) => {
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
          password: "123",
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


    database.getConnection((err, connection) => {
      if (err) {
        throw err;
      }
      connection.query(
        "DELETE FROM user WHERE emailAdress = 'ng@avans.nl';",
        (error, result, field) => {
            connection.release();
        }
      );
    });

    //202

    //203

    //204

    //205


});