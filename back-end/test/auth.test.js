import { use, expect } from 'chai'
import { default as chaiHttp, request } from 'chai-http'
import app from '../app.js'

use(chaiHttp)

describe('Auth API', () => {
  it('should login successfully with valid credentials', done => {
    request.execute(app)
      .post('/api/auth/login')
      .send({ email: 'demo@example.com', password: '123456' })
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body).to.have.property('success', true)
        expect(res.body).to.have.property('username')
        expect(res.body).to.have.property('token')
        done()
      })
  })

  it('should fail login with missing fields', done => {
    request.execute(app)
      .post('/api/auth/login')
      .send({ email: 'demo@example.com' }) // missing password
      .end((err, res) => {
        expect(res).to.have.status(400)
        expect(res.body).to.have.property('success', false)
        done()
      })
  })

  it('should signup successfully with valid data', done => {
    request.execute(app)
      .post('/api/auth/signup')
      .send({
        email: 'newuser@example.com',
        password: 'abcdef',
        firstName: 'New',
        lastName: 'User'
      })
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(201)
        expect(res.body).to.have.property('success', true)
        expect(res.body).to.have.property('username')
        expect(res.body).to.have.property('token')
        done()
      })
  })

  it('should fail signup with invalid email', done => {
    request.execute(app)
      .post('/api/auth/signup')
      .send({
        email: 'bademail',
        password: 'abcdef',
        firstName: 'New',
        lastName: 'User'
      })
      .end((err, res) => {
        expect(res).to.have.status(400)
        expect(res.body).to.have.property('success', false)
        done()
      })
  })

  it('should logout successfully', done => {
    request.execute(app)
      .post('/api/auth/logout')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body).to.have.property('success', true)
        done()
      })
  })
})