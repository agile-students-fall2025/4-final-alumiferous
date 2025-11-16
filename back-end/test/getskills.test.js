import * as chai from 'chai';
import chaiHttp from 'chai-http';
import request from 'supertest';
import app from '../app.js';

const expect = chai.expect;

chai.use(chaiHttp);

describe('GET /api/skills', function () {
  it('should return an array of skills', async function () {
    const res = await request(app).get('/api/skills');

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('should contain skills with correct feilds', async function () {
    const res = await request(app).get('/api/skills');
    const skills = res.body;

    expect(skills.length).to.be.above(0);

    const first = skills[0];

    expect(first).to.have.property('skillId');
    expect(first).to.have.property('name');
    expect(first).to.have.property('brief');
    expect(first).to.have.property('detail');
    expect(first).to.have.property('category');
    expect(first).to.have.property('username');
    expect(first).to.have.property('userId');
  });
});
