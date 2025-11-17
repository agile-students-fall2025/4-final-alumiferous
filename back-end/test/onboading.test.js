import * as chai from 'chai';
import chaiHttp from 'chai-http';
import request from 'supertest';
import app from '../app.js';

const expect = chai.expect;

chai.use(chaiHttp);

describe('POST /api/onboarding', function () {
  it('should create a new user and return it', async function () {
    const newUser = {
      username: 'testuser',
      skillsAcquired: [],
      skillsWanted: [],
      motivations: [],
      appUsage: 'Learning',
      weeklyCommitment: '1-2 hrs',
    };

    const res = await request(app)
      .post('/api/onboarding')
      .send(newUser)
      .set('Accept', 'application/json');

    expect(res.status).to.equal(201);
    // backend returns { message, user }
    expect(res.body).to.have.property('user');
    const user = res.body.user;

    expect(user).to.have.property('userId');
    expect(user).to.have.property('username', newUser.username);
    expect(user).to.have.property('skillsAcquired').that.is.an('array');
    expect(user).to.have.property('skillsWanted').that.is.an('array');
    expect(user).to.have.property('motivations').that.is.an('array');
    expect(user).to.have.property('appUsage', newUser.appUsage);
    expect(user).to.have.property('weeklyCommitment');
    expect(user).to.have.property('profilePhoto');
    expect(user).to.have.property('about');
  });
});
