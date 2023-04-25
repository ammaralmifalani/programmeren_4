const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../index');
require('tracer').setLevel('error');
chai.should();
chai.use(chaiHttp);
describe('server-info', function () {
  it('TC-102-1 - Server info should return succesful information', (done) => {
    chai
      .request(app)
      .get('/api/info')
      .end((err, res) => {
        res.body.should.be.an('object');
        res.body.should.has.property('status').to.be.equal(200);
        res.body.should.has.property('message');
        res.body.should.has.property('data');
        let { data, message } = res.body;
        data.should.be.an('object');
        data.should.has.property('studentName').to.be.equal('Ammar Almifalani');
        data.should.has.property('studentNumber').to.be.equal(2206669);
        done();
      });
  });

  it('TC-102-2 - Server should return valid error when endpoint does not exist', (done) => {
    chai
      .request(app)
      .get('/api/doesnotexist')
      .end((err, res) => {
        assert(err === null);

        res.body.should.be.an('object');
        let { data, message, status } = res.body;

        status.should.equal(404);
        message.should.be.a('string').that.is.equal('Endpoint not found');
        data.should.be.an('object');

        done();
      });
  });
});
