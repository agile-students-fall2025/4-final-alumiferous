import { use, expect } from 'chai'
import { default as chaiHttp, request } from 'chai-http'
import app from '../app.js'

use(chaiHttp)

// Chat routes
describe('Chats API', () => {
  it('should return non-empty array', done => {
    request.execute(app)
      .get('/api/chats')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res).to.be.json
        expect(res.body).to.be.an('array')
        expect(res.body.length).to.be.greaterThan(0)
        done()
      })
  })

  it('should create a new chat', done => {
    const chatData = { user_id: 'testuser', chat_name: 'Test Chat' }
    request.execute(app)
      .post('/api/chats')
      .send(chatData)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(201)
        expect(res.body).to.have.property('chat_name', 'Test Chat')
        expect(res.body).to.have.property('user_id', 'testuser')
        done()
      })
  })

  it('missing fields should fail', done => {
    request.execute(app)
      .post('/api/chats')
      .send({ user_id: 'testuser' })// missing chat_name
      .end((err, res) => {
        expect(res).to.have.status(400)
        expect(res.body).to.have.property('success', false)
        done()
      })
  })

  it('for non-existent chat should 404', done => {
    request.execute(app)
      .delete('/api/chats/doesnotexist')
      .end((err, res) => {
        expect(res).to.have.status(404)
        expect(res.body).to.have.property('success', false)
        done()
      })
  })

  it('for non-existent chat should return 404', done => {
    request.execute(app)
      .put('/api/chats/doesnotexist')
      .send({ chat_name: 'New Name' })
      .end((err, res) => {
        expect(res).to.have.status(404)
        expect(res.body).to.have.property('success', false)
        done()
      })
  })
})


// Messages routes
describe('Messages API', () => {
  it('should return messages', done => {
    request.execute(app)
      .get('/api/messages?chat_id=1')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res).to.be.json
        expect(res.body).to.be.an('array')
        done()
      })
  })

  it('should create a new message', done => {
    const msgData = { chat_id: '1', sender_name: 'Alice', content: 'Hello!' }
    request.execute(app)
      .post('/api/messages')
      .send(msgData)
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(201)
        expect(res.body).to.have.property('chat_id', '1')
        expect(res.body).to.have.property('sender_name', 'Alice')
        expect(res.body).to.have.property('content', 'Hello!')
        done()
      })
  })

  it('missing fields should fail', done => {
    request.execute(app)
      .post('/api/messages')
      .send({ chat_id: '1', sender_name: 'Alice' })
      .end((err, res) => {
        expect(res).to.have.status(400)
        expect(res.body).to.have.property('success', false)
        done()
      })
  })
})
