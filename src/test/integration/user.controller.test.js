const chai = require('chai');
const chaiHttp = require('chai-http');
// const req = require('express/lib/request');
const server = require('../../../index');
const assert = require('assert')

let database = [];

chai.should();
chai.use(chaiHttp);

describe('Manage users /api/user', ()=>{
    describe('UC-201 add user', ()=> {
        beforeEach(() => {
            database = [];
        });
        it('When a required input is missing, a valid error should be returned', (done) =>{
            chai
            .request(server)
            .post('/api/user')
            .send({

                "lastName": "Goossens",
                "password": "dddddd",
                "emailAdress": "nca.goosens@student.avans.nl" 
            })
            .end((err, res) =>{
                res.should.be.an('object')
                let {status, result} = res.body;
                status.should.equals(400);
                result.should.be.a('string').that.equals('firstName must be a string')
            })
            done();
        });
    });
})