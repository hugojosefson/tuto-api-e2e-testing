/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import chai from 'chai'
import chaiHttp from 'chai-http'
import { config } from '../src/config.js'
import { queryForOne } from '../src/db/query.js'
import { getPool } from '../src/db/pool.js'

const SERVER_URL = process.env.APP_URL || 'http://localhost:8000'
const MOCK_SERVER_PORT = process.env.MOCK_SERVER_PORT || 8002

chai.use(chaiHttp)
chai.should()

const TEST_USER = {
  email: 'john@doe.com',
  firstname: 'John'
}

let db
let createdUserId

const mock = {
  app: express(),
  server: null,
  requests: [],
  status: 404,
  responseBody: {}
}

function setupMock (status, body) {
  mock.status = status
  mock.responseBody = body
}

async function initMock () {
  mock.app.use(bodyParser.urlencoded({ extended: false }))
  mock.app.use(bodyParser.json())
  mock.app.use(cors())
  mock.app.get('*', (req, res) => {
    mock.requests.push(req)
    res.status(mock.status).send(mock.responseBody)
  })

  mock.server = await mock.app.listen(MOCK_SERVER_PORT)
  console.log(`Mock server started on port: ${JSON.stringify(mock.server.address())}`)
}

function teardownMock () {
  if (mock.server) {
    mock.server.close()
    delete mock.server
  }
}

describe('Users', () => {
  before(async () => {
    await initMock()
    db = await getPool(config.db)
  })

  after(async () => {
    teardownMock()
    await db.end()
  })

  beforeEach(() => (mock.requests = []))

  it('should create a new user', done => {
    setupMock(200, { format: true })

    chai
      .request(SERVER_URL)
      .post('/api/users')
      .send(TEST_USER)
      .end((err, res) => {
        if (err) {
          done(err)
        } else {
          res.should.have.status(201)
          res.should.be.json
          res.body.should.be.a('object')
          res.body.should.have.property('id')
          res.body.should.have.property('email')
          res.body.should.have.property('firstname')
          res.body.id.should.not.be.null
          res.body.email.should.equal(TEST_USER.email)
          res.body.firstname.should.equal(TEST_USER.firstname)
          createdUserId = res.body.id

          mock.requests.length.should.equal(1)
          mock.requests[0].path.should.equal(`/api/email/${TEST_USER.email}`)

          queryForOne(db, 'SELECT * FROM user WHERE id=:id', { id: createdUserId }).then(
            cacheData => {
              cacheData.should.have.property('email')
              cacheData.should.have.property('firstname')
              cacheData.email.should.equal(TEST_USER.email)
              cacheData.firstname.should.equal(TEST_USER.firstname)
              done()
            },
            done
          )
        }
      })
  })

  it('should find the created user', done => {
    chai
      .request(SERVER_URL)
      .get('/api/users')
      .end((err, res) => {
        if (err) {
          done(err)
        } else {
          res.should.have.status(200)
          res.body.should.be.a('array')

          const foundUser = res.body.find(user => user.id === createdUserId)
          foundUser.should.be.a('object')
          foundUser.id.should.equal(createdUserId)
          foundUser.email.should.equal(TEST_USER.email)
          foundUser.firstname.should.equal(TEST_USER.firstname)
          done()
        }
      })
  })

  it('should get the created user', done => {
    chai
      .request(SERVER_URL)
      .get(`/api/users/${createdUserId}`)
      .end((err, res) => {
        if (err) {
          done(err)
        } else {
          res.should.have.status(200)
          const user = res.body
          user.should.be.a('object')
          user.id.should.equal(createdUserId)
          user.email.should.equal(TEST_USER.email)
          user.firstname.should.equal(TEST_USER.firstname)
          done()
        }
      })
  })

  it('should not create user if mail is spammy', done => {
    setupMock(200, { format: false })

    chai
      .request(SERVER_URL)
      .post('/api/users')
      .send(TEST_USER)
      .end((err, res) => {
        res.should.have.status(403)
        done(err)
      })
  })

  it('should not create user if spammy mail API is down', done => {
    setupMock(404, { format: false })

    chai
      .request(SERVER_URL)
      .post('/api/users')
      .send(TEST_USER)
      .end((err, res) => {
        res.should.have.status(403)
        done(err)
      })
  })
})
