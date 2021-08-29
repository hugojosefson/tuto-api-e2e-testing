#!/usr/bin/env node

import { resolve } from 'path'
import marv from 'marv/api/promise.js'
import driver from 'marv-mysql-driver'
import { config } from '../config.js'

;(async () => {
  const directory = resolve('migrations')
  const migrations = await marv.scan(directory)
  await marv.migrate(migrations, driver({ connection: config.db }))
})()
