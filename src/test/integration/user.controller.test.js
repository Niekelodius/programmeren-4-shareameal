const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../../index');
const assert = require('assert');
require('dotenv').config();
const dbconnection = require('../../../database/dbconnection');

const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';


//Insert user sql
const testUser =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "mail", "secret", "street", "city");';



chai.should();
chai.use(chaiHttp);

describe('Manage users api/user', () => {
    before((done) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err;
 
                    connection.query(CLEAR_USERS_TABLE, function (error, message, field) {
                        connection.release();
                        done();
                    });
        });
    })
    describe('UC-201 add user', () => {
        beforeEach((done) => {
            dbconnection.getConnection(function (connError, connection) {
                if (connError) throw connError;

                connection.query(CLEAR_USERS_TABLE, function (dbError, results, fields) {
                    connection.release();
                    if (dbError) throw dbError;

                    done();
                }
                )
            });
        });

        it('TC 201-1 When a required input is missing, an error should be returned', (done) => {
            chai.request(server).post('/api/user').send({
                //Firstname is missing
                lastName: "2",
                street: "",
                city: "",
                isActive: 1,
                emailAdress: "mail2",
                phoneNumber: "06",
                password: "secret"
            })
                .end((err, res) => {
                    assert.ifError(err);

                    res.should.have.status(400);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('firstName must be a string');

                    done();
                });
        });

        it("TC 201-4 When the user already exist, an error should be returned", (done) => {
            dbconnection.getConnection(function (connError, connection) {
                if (connError) throw connError;

                connection.query(testUser, function (dbError, results, fields) {
                    connection.release();

                    if (dbError) throw dbError;

                    chai.request(server).post('/api/user').send({
                        firstName: 'een',
                        lastName: "1",
                        street: " ",
                        city: " ",
                        isActive: 1,
                        emailAdress: "mail1",
                        phoneNumber: "06",
                        password: "secret"
                    })
                        .end((err, res) => {
                            assert.ifError(err);

                            res.should.have.status(409);
                            res.should.be.an('object');
                            res.body.should.be.an('object').that.has.all.keys('status', 'message');

                            let { status, message } = res.body;
                            status.should.be.a('number');
                            message.should.be.a('string').that.contains('Email not unique');

                            done();
                        });
                }
                )
            })
        });

        it("TC 201-5 when the user gets added to the database, the result should be succesful", (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "twee",
                lastName: "G2",
                street: "a",
                city: "b",
                roles: " editor",
                isActive: 1,
                emailAdress: "mail2",
                phoneNumber: "06",
                password: "secret"

//                 {
//     "firstName": "Niek",
//     "lastName": "Goossens",
//     "emailAdress": "ncag@gmail.com",
//     "password": "wachtwoord",
//     "isActive": 1,
//     "phoneNumber": "0123456789",
//     "roles": "editor",
//     "street": "achter",
//     "city": "dorp"
//   }
            })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message', 'result');


                    done();
                });
        })
    });

    describe('UC-204 user details', () => {
        it("TC 204-2 When a user id doesn't exist, an error should be returned", (done) => {
            chai.request(server).get("/api/user/1000")
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(404);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('User does not exist');

                    done();
                });
        });

        it("TC 204-3 When the user with id can be found, the result should be succesful", (done) => {
            dbconnection.getConnection(function (connError, connection) {
                if (connError) throw connError;

                connection.query(testUser, function (dbError, results, fields) {
                    connection.release();

                    if (dbError) throw dbError;

                    chai.request(server).get("/api/user/1")
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.should.be.an('object');

                            let { status, result } = res.body;
                            status.should.be.a('number');

                            done();
                        });

                });
            });
        });
    });
    describe('UC-205 Change user details', () => {
        beforeEach((done) => {
            dbconnection.getConnection(function (connError, connection) {
                if (connError) throw connError;
                connection.query(CLEAR_USERS_TABLE, function (dbError, results, fields) {
                    connection.release();

                    if (dbError) throw dbError;

                    done();
                }
                )
            });
        });
        it("TC 205-1 When a required input is missing when updating a user, an error should should be returned", (done) => {
            dbconnection.getConnection(function (connError, connection) {
                if (connError) throw connError;

                connection.query(testUser, function (dbError, results, fields) {
                    connection.release();
                    if (dbError) throw dbError;

                    chai.request(server).put('/api/user/1').send({
                        lastName: "een",
                        street: " ",
                        city: " ",
                        isActive: 1,
                        emailAdress: "mail1",
                        phoneNumber: "06",
                        password: "secret"
                    })
                        .end((err, res) => {
                            assert.ifError(err);

                            res.should.have.status(400);
                            res.should.be.an('object');
                            res.body.should.be.an('object').that.has.all.keys('status', 'message');

                            let { status, message } = res.body;
                            status.should.be.a('number');
                            message.should.be.a('string').that.contains('firstName must be a string');

                            done();
                        });
                });
            });
        });


        it("TC 205-6 When a user is successfully updated, the result should be succesful", (done) => {
            dbconnection.getConnection(function (connError, connection) {
                if (connError) throw connError;

                connection.query(testUser, function (dbError, results, fields) {
                    connection.release();

                    if (dbError) throw dbError;

                    chai.request(server).put('/api/user/1').send({
                        firstName: "test",
                        lastName: "test",
                        street: " ",
                        city: " ",
                        isActive: 1,
                        emailAdress: "mail2",
                        phoneNumber: "06",
                        password: "secret"
                    })
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.should.be.an('object');
                            res.body.should.be.an('object').that.has.all.keys('message', 'statusCode');

                            done();
                        });
                });
            });
        });
    });

    describe('UC-205 Change user details', () => {
        beforeEach((done) => {
            dbconnection.getConnection(function (connError, connection) {
                if (connError) throw connError;
                connection.query(CLEAR_USERS_TABLE, function (dbError, results, fields) {
                    connection.release();

                    if (dbError) throw dbError;

                    done();
                }
                )
            });
        });
        it("TC 206-1 When a user can not be found when trying to delete, an error should be returned", (done) => {
            chai.request(server).delete("/api/user/1000")
                .end((err, res) => {
                    assert.ifError(err);
                    res.should.have.status(400);
                    res.should.be.an('object');
                    res.body.should.be.an('object').that.has.all.keys('status', 'message');

                    let { status, message } = res.body;
                    status.should.be.a('number');
                    message.should.be.a('string').that.contains('User does not exist');

                    done();
                });
        });

        it("TC 206-4 When a user is successfully deleted, the result should be succesful", (done) => {
            dbconnection.getConnection(function (connError, connection) {
                if (connError) throw connError;

                connection.query(testUser, function (dbError, results, fields) {
                    connection.release();
                    if (dbError) throw dbError;

                    chai.request(server).delete('/api/user/1')
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.should.be.an('object');
                            res.body.should.be.an('object').that.has.all.keys('statusCode', 'message');



                            done();
                        });
                });
            });
        })
    });
});
