const { expect } = require('chai');
const sinon = require('sinon');
const request = require('request');
const { describe, it } = require('mocha');

describe('aPI integration test', () => {
  describe('test suite for /status route', () => {
    it('gET //status', () => new Promise((done) => {
      request.get('http://localhost:5000/status', (_err, res, body) => {
        expect(res.statusCode).to.be.equal(200);
        expect(body).to.be.equal({ redis: true, db: true });
        done();
      });
    }));
  });
});
