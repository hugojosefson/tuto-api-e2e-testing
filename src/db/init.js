#!/usr/bin/env node

import { config } from '../config.js'
import { getPool } from './pool.js'
import { execute } from './query.js'

;(async () => {
  const db = await getPool(config.db)
  try {
    console.log('Dropping table (if exists)...')
    await execute(db, `
      DROP TABLE IF EXISTS user;
    `)
    console.log('Dropping table (if exists)...DONE.')

    console.log('Creating table...')
    await execute(db, `
      CREATE TABLE user (
        PRIMARY   KEY (id),
        id        CHAR(36)     NOT NULL,
        email     VARCHAR(256) NOT NULL,
        firstname VARCHAR(256) NOT NULL
      );
    `)
    console.log('Creating table...DONE.')

    db.end()
  } catch (error) {
    console.error(error.stack)
    db.end()
    process.exit(error.code || 1)
  }
})()
