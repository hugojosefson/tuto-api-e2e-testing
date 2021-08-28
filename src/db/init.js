import knex from 'knex'
import { config } from '../config.js'

const db = knex({
  client: 'mysql2',
  connection: {
    database: 'mysql',
    host: config.db.host,
    user: config.db.user,
    password: config.db.password
  }
})

console.log('Creating tables ...')

db.schema
  .hasTable('users')
  .then((exists) => {
    if (!exists) {
      console.log('Creating table \'users\'')
      return db.schema.createTable('users', (table) => {
        table.increments()
        table.string('email').notNullable()
        table.string('firstname').notNullable()
        table.timestamps(true, true)
      })
    }
  })
  .then(() => {
    console.log('Tables created successfully')
    process.exit(0)
  })
  .catch(err => {
    console.log(`Unable to init tables : ${err}`)
    process.exit(1)
  })
