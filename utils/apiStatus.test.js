const expect = require('chai').expect
const sinon = require('sinon')
const request = require('request')
const { describe, it } = require('mocha')

describe('API integration test', function () { 
    describe("Test suite for /status route", () => {
        it('GET //status', (done) => {
            request.get('http://localhost:5000/status', (_err, res, body) => {
                expect(res.statusCode).to.be.equal(200);
                expect(body).to.be.equal({"redis":true,"db":true});
                done();
            });
        });
    })
}
);
