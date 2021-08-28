#!/usr/bin/env node

import { config } from '../config.js'
import { getPool } from './pool.js'
import { execute } from './query.js'

const MIGRATION = `
CREATE TABLE IF NOT EXISTS user (
  PRIMARY KEY (id),
  id MEDIUMINT NOT NULL AUTO_INCREMENT,
  email VARCHAR(256) NOT NULL,
  firstname VARCHAR(256) NOT NULL
);`

getPool(config.db).then(
  db => {
    console.log('Creating table (if not exists)...')
    execute(db, MIGRATION).then(
      () => {
        console.log('Creating table (if not exists)...DONE.')
        db.end()
      },
      error => {
        console.error(error.stack)
        process.exit(error.code || 1)
      }
    )
  },
  error => {
    console.error(error.stack)
    process.exit(error.code || 1)
  }
)
