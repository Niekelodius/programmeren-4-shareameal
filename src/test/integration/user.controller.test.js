const chai = require('chai');
const chaiHttp = require('chai-http');
// const req = require('express/lib/request');
const dbconnection = require('../../database/dbconnection')
const server = require('../../../index');
const assert = require('assert')

let database = [];


chai.should();
chai.use(chaiHttp);

let user = [{
                  id: 0,
                        firstName: "Niek",
                        lastName: "Goossens",
                        password: "dddddd",
                        city: "Dorpje",
                        street: "NiekLaan",
                        emailAdress: "nca.goosens@student1.avans.nl",
                        phoneNumber: "06123456789"
}];

let user2 = [{
    id: 0,
          firstName: "Niek",
          lastName: "Goossens",
          password: "dddddd",
          city: "Dorpje",
          street: "NiekLaan",
          emailAdress: "nca.goosens@student2.avans.nl",
          phoneNumber: "06123456789"
}];

describe('Manage users /api/user', () => {
    describe('UC-201 add user', () => {
        beforeEach(() => {
            database = [];
        });
        it('When a required input is missing, a valid error should be returned', (done) => {
            chai
                .request(server)
                .post('/api/user')
                .send({

                    lastName: "Goossens",
                    password: "dddddd",
                    city: "Dorpje",
                    street: "NiekLaan",
                    emailAdress: "nca.goosens@student1.avans.nl",
                    phoneNumber: "06123456789"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body;
                    status.should.equals(400);
                    result.should.be.a('string').that.equals('firstName must be a string')
                })
            done();
        });
        it('When a user is added, the user must be added to the database', (done) => {
            chai
                .request(server)
                .post('/api/user')
                .send({
                    firstName: "Niek",
                    lastName: "Goossens",
                    password: "dddddd",
                    city: "Dorpje",
                    street: "NiekLaan",
                    emailAdress: "nca.goosens@student1.avans.nl",
                    phoneNumber: "06123456789"
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body;
                    status.should.equals(201);
                    assert.deepEqual(user, [{
                        id: 0,
                        firstName: "Niek",
                        lastName: "Goossens",
                        password: "dddddd",
                        city: "Dorpje",
                        street: "NiekLaan",
                        emailAdress: "nca.goosens@student1.avans.nl",
                        phoneNumber: "06123456789"
                    }])
                })
            done();
        });
        it('When the email is not unique, the user will not be added to the database', (done) => {
            chai.request(server).post('/api/user').send({
                firstName: "Niek",
                lastName: "Goossens",
                password: "dddddd",
                city: "Dorpje",
                street: "NiekLaan",
                emailAdress: "nca.goosens@student1.avans.nl",
                phoneNumber: "06123456789"
            }).end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.be.equals(400);
                result.should.be.a('string').that.equals('emailAdress must be unique');
                assert.notDeepEqual(user, [{
                    id: 1,
                    firstName: "Niek",
                    lastName: "Goossens",
                    password: "dddddd",
                    city: "Dorpje",
                    street: "NiekLaan",
                    emailAdress: "nca.goosens@student1.avans.nl",
                    phoneNumber: "06123456789"
                }])
                done();
            })
        })

    });
    describe('UC-202 get user', () => {
        beforeEach(() => {
            database = [user];
        });
    });
    it('An overview of all the users should be returned', (done) => {
        chai.request(server).post('/api/user').send({
            firstName: "Niek",
            lastName: "Goossens",
            password: "dddddd",
            city: "Dorpje",
            street: "NiekLaan",
            emailAdress: "nca.goosens@student2.avans.nl",
            phoneNumber: "06123456789"
        }).end();

        chai
            .request(server)
            .get('/api/user')
            .end((err, res) => {
                res.should.be.an('object')
                let { status, result } = res.body;
                status.should.equals(201);
                result.should.be.a('array').that.equals(user2)
            })
        done();
    });

})