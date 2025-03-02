import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import fetch from 'node-fetch'
import { config } from './config.js'
import { getPool } from './db/pool.js'
import { queryForAll, queryForOne, queryForOneOfLastStatement } from './db/query.js'
import { migrate } from './db/init.js'

const app = express()

;(async () => {
  console.dir({ config })
  await migrate(config.db)
  const db = await getPool(config.db)

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  app.use(cors())

  async function validateUserEmail (email) {
    const res = await fetch(`${config.app.externalUrl}${email}`)
    if (res.status !== 200) return false
    const json = await res.json()
    return json.format === true
  }

  app.get('/api/users/:id', async (req, res, next) => {
    try {
      const id = req.params.id
      if (typeof id !== 'string' || id.length !== 36) {
        return res.sendStatus(404)
      }
      const user = await queryForOne(db, 'SELECT id, email, firstname FROM user WHERE id=:id', { id })
      if (!user) {
        return res.sendStatus(404)
      }
      res.send(user)
    } catch (error) {
      console.error('ERROR: ', error)
      next(error)
    }
  })

  app.get('/api/users', (req, res, next) => {
    queryForAll(db, 'SELECT id, email, firstname FROM user')
      .then(users => res.status(200).send(users))
      .catch(err => {
        console.error(`Unable to fetch users: ${err.message}. ${err.stack}`)
        return next(err)
      })
  })

  app.post('/api/users', async (req, res, next) => {
    try {
      const { email, firstname } = req.body
      // ... validate inputs here ...
      const userData = { email, firstname }

      const isValidUser = await validateUserEmail(email)
      if (!isValidUser) {
        return res.sendStatus(403)
      }

      const { id } = await queryForOneOfLastStatement(
        db,
        `BEGIN;
          SELECT UUID() INTO @id;
          INSERT INTO user (id, email, firstname) VALUES (@id, :email, :firstname);
          SELECT @id AS id;
        COMMIT;`,
        userData
      )
      res.status(201).send({ id, ...userData })
    } catch (err) {
      console.error(`Error: Unable to create user: ${err.message}. ${err.stack}`)
      return next(err)
    }
  })

  console.log('Starting web server...')

  const port = process.env.PORT || 8000
  const server = app.listen(port, () => console.log(`Server started on: ${JSON.stringify(server.address())}`))
})()
export default app
