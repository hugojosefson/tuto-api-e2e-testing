import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import fetch from 'node-fetch'
import { config } from './config.js'
import { getPool } from './db/pool.js'
import { queryForAll, queryForOneOfLastStatement } from './db/query.js'
import { migrate } from './db/init.js'

const app = express()

;(async () => {
  await migrate(config.db)
  const db = await getPool(config.db)

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  app.use(cors())

  async function validateUserEmail (email) {
    const res = await fetch(`${config.app.externalUrl}/validate?email=${email}`)
    if (res.status !== 200) return false
    const json = await res.json()
    return json.result === 'valid'
  }

  app.route('/api/users').post(async (req, res, next) => {
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

  app.route('/api/users').get((req, res, next) => {
    queryForAll(db, 'select id, email, firstname from user;')
      .then(users => res.status(200).send(users))
      .catch(err => {
        console.error(`Unable to fetch users: ${err.message}. ${err.stack}`)
        return next(err)
      })
  })

  console.log('Starting web server...')

  const port = process.env.PORT || 8000
  app.listen(port, (server) => console.log(`Server started on: ${server}`))
})()
export default app
