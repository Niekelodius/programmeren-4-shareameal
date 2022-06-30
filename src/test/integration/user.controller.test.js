// process.env.LOGLEVEL = "warn";

// const chai = require("chai");
// const chaiHttp = require("chai-http");
// const database = require("../../../database/dbConnection");
// require("dotenv").config();
// const jwt = require("jsonwebtoken");
// const assert = require("assert");
// const { jwtSecretKey, logger } = require("../../../src/config/config");
// const index = require("../../../index");
// const res = require("express/lib/response");
// chai.should();
// chai.use(chaiHttp);

// let userId = 5;

// let validToken =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ0LCJpYXQiOjE2NTY1ODU4MDUsImV4cCI6MTY1NzYyMjYwNX0.uo-dQ3uSh0jkLGY3oEnIFpRVZ6hwzsSxqrZsCdN4P4c";
// const invalidToken =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIyNywiaWF0IjoxNjUyNzg3NzA4LCJleHAiOjE2NTM4MjQ1MDh9.NAW7Ol_7WrEdPYH1B7-6mKFsGGpX3xPwEQBctIKlPvU";

// const CLEAR_DB = "DELETE  FROM `user` WHERE emailAdress = 'ng@avans.nl';";
// const GET_USER = "SELECT id FROM `user` WHERE emailAdress = 'goos@avans.nl';";
// const ADD_USER =
//   "INSERT INTO `user`" +
//   "(`firstName`, `lastName`, `street`, `city`, `password`, `emailAdress`, `phoneNumber`,`roles` )" +
//   "VALUES ('Removable', 'man', 'behind', 'you', 'D389!!ach', 'goos@avans.nl', '05322222222', 'editor');  ";

// describe("Manage users /api/user", () => {
//   describe("TC-201 Register as new user", () => {
//     beforeEach((done) => {
//       logger.debug("beforeEach called");
//       database.getConnection(function (err, connection) {
//         if (err) throw err;
//         connection.query(CLEAR_DB, function (error, results, fields) {
//           connection.release();
//           if (err) throw err;
//           logger.debug("beforeEach done");
//           done();
//         });
//       });
//     });

//     it("201-1 Missing required field", (done) => {
//       chai
//         .request(index)
//         .post("/api/user")
//         .send({
//           lastName: "G",
//           isActive: true,
//           street: "a",
//           city: "b",
//           roles: "editor",
//           emailAdress: "ng@avans.nl",
//           password: "123",
//           phoneNumber: "0651234567",
//         })
//         .end((req, res) => {
//           res.should.be.an("object");
//           let { status, message } = res.body;
//           status.should.equals(400);
//           message.should.be
//             .a("string")
//             .that.equals("firstName must be a string");
//           done();
//         });
//     });

//     it("201-2 Invalid emailAddress", (done) => {
//       chai
//         .request(index)
//         .post("/api/user")
//         .send({
//           firstName: "N",
//           lastName: "G",
//           emailAdress: "ng.avans.nl",
//           isActive: true,
//           roles: "editor",
//           street: "a",
//           city: "b",

//           password: "123",
//           phoneNumber: "0651234567",
//         })
//         .end((req, res) => {
//           res.should.be.an("object");
//           let { status, message } = res.body;
//           status.should.equals(400);
//           message.should.be.a("string").that.equals("invalid email");
//           done();
//         });
//     });

//     it("201-3 Invalid password", (done) => {
//       chai
//         .request(index)
//         .post("/api/user")
//         .send({
//           firstName: "N",
//           lastName: "G",
//           isActive: true,
//           roles: "editor",
//           street: "a",
//           city: "b",
//           password: "",
//           emailAdress: "ng@avans.nl",
//           phoneNumber: "0651234567",
//         })
//         .end((req, res) => {
//           res.should.be.an("object");
//           let { status, message } = res.body;
//           status.should.equals(400);
//           message.should.be.a("string").that.equals("invalid password");
//           done();
//         });
//     });

//     it("201-4 User already exists", (done) => {
//       chai
//         .request(index)
//         .post("/api/user")
//         .send({
//           firstName: "N",
//           lastName: "G",
//           isActive: true,
//           roles: "editor",
//           street: "a",
//           city: "b",
//           emailAdress: "ng@avans.nl",
//           password: "D1mwwVhTT22!",
//           phoneNumber: "0651234567",
//         })
//         .end((req, res) => {
//           res.should.be.an("object");
//           chai
//             .request(index)
//             .post("/api/user")
//             .send({
//               firstName: "N",
//               lastName: "G",
//               isActive: true,
//               roles: "editor",
//               street: "a",
//               city: "b",
//               emailAdress: "ng@avans.nl",
//               password: "D1mwwVhTT22!",
//               phoneNumber: "0651234567",
//             })
//             .end((req, res) => {
//               res.should.be.an("object");
//               let { status, message } = res.body;
//               status.should.equals(409);
//               message.should.be.a("string").that.equals("Email not unique");
//               done();
//             });
//         });
//     });

//     it("201-5 Succesfully return user", (done) => {
//       chai
//         .request(index)
//         .post("/api/user")
//         .send({
//           firstName: "N",
//           lastName: "G",
//           isActive: true,
//           roles: "editor",
//           street: "a",
//           city: "b",
//           emailAdress: "ng@avans.nl",
//           password: "D1mwwVhTT22!",

//         })
//         .end((req, res) => {
//           res.should.be.an("object");
//           let { status, message } = res.body;
//           status.should.equals(200);
//           message.should.be
//             .a("string")
//             .that.equals("Succesfully added user to database");
//           done();
//         });
//     });
//   });

//   describe("TC-202 Overview of all users", () => {
//     beforeEach((done) => {
//       logger.debug("beforeEach called");
//       database.getConnection(function (err, connection) {
//         connection.query(CLEAR_DB, function (error, results, fields) {
//           connection.release();
//           logger.debug("beforeEach done");
//           done();
//         });
//       });
//     });

//     it("202-1 Show user array", (done) => {
//       chai
//         .request(index)
//         .get("/api/user")
//         .end((req, res) => {
//           let { status, result } = res.body;
//           result.should.be.an("array");
//           done();
//         });
//     });
//   });
//   describe("TC-203 Request userprofile", () => {
//     beforeEach((done) => {
//       logger.debug("beforeEach called");
//       database.getConnection(function (err, connection) {
//         connection.query(CLEAR_DB, function (error, results, fields) {
//           connection.release();
//           logger.debug("beforeEach done");
//           done();
//         });
//       });
//     });
//     it("203-1 Invalid token", (done) => {
//       chai
//         .request(index)
//         .get("/api/user/profile")
//         .auth(invalidToken, { type: "bearer" })
//         .end((req, res) => {
//           let { status, message } = res.body;
//           status.should.equals(401);
//           message.should.be.a("string").that.equals("Invalid token");
//           done();
//         });
//     });

//     it("203-2 Valid token and user exists", (done) => {
//       chai
//         .request(index)
//         .get("/api/user/profile")
//         .auth(validToken, { type: "bearer" })
//         .end((req, res) => {
//           done();
//         });
//     });
//   });

//   describe("TC-204 User details", () => {
//     //
//     beforeEach((done) => {
//       logger.debug("beforeEach called");
//       database.getConnection(function (err, connection) {
//         connection.query(CLEAR_DB, function (error, results, fields) {
//           connection.release();
//           logger.debug("beforeEach done");
//           done();
//         });
//       });
//     });
//     it("204-1 Invalid token", (done) => {
//       chai
//         .request(index)
//         .get("/api/user/2")
//         .auth(invalidToken, { type: "bearer" })
//         .end((req, res) => {
//           let { status, message } = res.body;
//           done();
//         });
//     });

//     it("204-2 User-ID does not exist", (done) => {
//       chai
//         .request(index)
//         .get("/api/user/9000")
//         .auth(validToken, { type: "bearer" })
//         .end((req, res) => {
//           let { status, message } = res.body;
//           status.should.equals(404);
//           message.should.be.a("string").that.equals("User does not exist");
//           done();
//         });
//     });

//     it("204-3 User-ID exists", (done) => {
//       chai
//         .request(index)
//         .get("/api/user/1")
//         .auth(validToken, { type: "bearer" })
//         .end((req, res) => {
//           let { status, result } = res.body;
//           status.should.equals(200);
//           result.should.be.an("array");
//           done();
//         });
//     });
//   });

//   describe("TC-205 Edit user", () => {
//     it("205-1 Missing field emailAddress", (done) => {
//       chai
//         .request(index)
//         .put("/api/user/" + userId)
//         .auth(validToken, { type: "bearer" })
//         .send({
//           firstName: "Herman",
//           lastName: "Huizinga",
//           isActive: 1,
//           password: "secret",
//           phoneNumber: "06-12345678",
//           roles: "editor,guest",
//           street: "",
//           city: "",
//         })
//         .end((req, res) => {
//           let { status, message } = res.body;
//           status.should.equals(400);
//           message.should.be
//             .a("string")
//             .that.equals("emailAdress must be a string");
//           done();
//         });
//     });

//     it("205-3 Invalid emailaddress", (done) => {
//       chai
//         .request(index)
//         .put("/api/user/" + userId)
//         .auth(validToken, { type: "bearer" })
//         .send({
//           firstName: "Herman",
//           lastName: "Huizinga",
//           isActive: 1,
//           password: "secret",
//           phoneNumber: "06-12345678",
//           roles: "editor,guest",
//           street: "",
//           city: "",
//         })
//         .end((req, res) => {
//           let { status, message } = res.body;
//           status.should.equals(400);
//           message.should.be
//             .a("string")
//             .that.equals("emailAdress must be a string");
//           done();
//         });
//     });

//     it("205-5 Not logged in", (done) => {
//       chai
//         .request(index)
//         .put("/api/user/" + userId)
//         .send({
//           firstName: "Herman",
//           lastName: "Huizinga",
//           isActive: 1,
//           emailAdress: "h.huizinga@server.nl",
//           password: "D1mD29!!df",
//           phoneNumber: "06-12345678",
//           roles: "editor,guest",
//           street: "",
//           city: "",
//         })
//         .end((req, res) => {
//           let { error, status } = res.body;
//           error.should.be
//             .a("string")
//             .that.equals("Authorization header missing!");
//           done();
//         });
//     });
//   });

//   describe("TC-206 Delete user", () => {
//     //
//     beforeEach((done) => {
//       logger.debug("beforeEach called");
//       database.getConnection(function (err, connection) {
//         connection.query(ADD_USER, function (error, results, fields) {
//           connection.release();
//           logger.debug("beforeEach done");
//           done();
//         });
//       });
//     });
//     it("206-2 Not logged in ", (done) => {
//       chai
//         .request(index)
//         .delete("/api/user/4")

//         .end((req, res) => {
//           let { error, status } = res.body;
//           error.should.be
//             .a("string")
//             .that.equals("Authorization header missing!");
//           done();
//         });
//     });
//   });
// });
