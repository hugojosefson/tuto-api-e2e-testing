import { createPool } from 'mysql2/promise.js'

export async function getPool (dbConfig) {
  return await createPool({
    ...dbConfig,
    namedPlaceholders: true,
    multipleStatements: true
  })
}

async function sleep (seconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000)
  })
}

async function tryConnect (dbConfig) {
  let pool
  try {
    pool = await getPool(dbConfig)
    await pool.execute('select 0')
    return pool
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.warn('WARN Retrying, because pool is not ready yet.')
    } else {
      console.warn('WARN Retrying, because pool is not ready yet. Unexpected error: ', error)
    }
    if (pool && typeof pool.end === 'function') {
      await pool.end()
    }
    await sleep(2)
    return 'try_again'
  }
}

async function eventuallyConnect (dbConfig) {
  let pool = 'try_again'
  while (pool === 'try_again') {
    pool = await tryConnect(dbConfig)
  }
  return pool
}

export async function ensureDbServerIsUp (dbConfig) {
  const pool = await eventuallyConnect(dbConfig)
  if (pool && typeof pool.end === 'function') {
    await Promise.resolve(pool.end())
    console.error('Ended the pool.')
  }
}
