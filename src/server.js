import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import fetch from 'node-fetch'
import knex from 'knex'
import { createClient } from 'redis'
import { config } from './config.js'

const db = knex({
  client: 'mysql2',
  connection: {
    database: 'mysql',
    host: config.db.host,
    user: config.db.user,
    password: config.db.password
  }
})

const redis = createClient({
  host: config.redis.host,
  port: config.redis.port
})

const app = express()

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

    const result = await db('users').insert(userData)
    const id = result[0]
    await redis.set(id, JSON.stringify(userData))
    res.status(201).send({ id, ...userData })
  } catch (err) {
    console.error(`Error: Unable to create user: ${err.message}. ${err.stack}`)
    return next(err)
  }
})

app.route('/api/users').get((req, res, next) => {
  db('users')
    .select('id', 'email', 'firstname')
    .then(users => res.status(200).send(users))
    .catch(err => {
      console.error(`Unable to fetch users: ${err.message}. ${err.stack}`)
      return next(err)
    })
})

console.log('Starting web server...')

const port = process.env.PORT || 8000
app.listen(port, (server) => console.log(`Server started on: ${server}`))

export default app
