#!/usr/bin/env node

import { resolve } from 'path'
import marv from 'marv/api/promise.js'
import marvMysqlDriver from 'marv-mysql-driver'
import { ensureDbServerIsUp } from './pool.js'

export async function migrate (dbConfig) {
  await ensureDbServerIsUp(dbConfig)
  const directory = resolve('migrations')
  const migrations = await marv.scan(directory)
  const driver = marvMysqlDriver({ connection: dbConfig })
  await marv.migrate(migrations, driver)
}
