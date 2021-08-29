import { createPool } from 'mysql2/promise.js'

async function sleep (seconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000)
  })
}

export async function getPool (dbConfig) {
  while (true) {
    let pool
    try {
      pool = await createPool({
        ...dbConfig,
        namedPlaceholders: true,
        multipleStatements: true
      })
      await pool.execute('select 0')
      return pool
    } catch (error) {
      if (['ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST'].includes(error.code)) {
        console.warn('WARN Retrying, because pool is not ready yet.')
      } else {
        console.warn('WARN Retrying, because pool is not ready yet. Unexpected error: ', error)
      }
      if (pool && typeof pool.end === 'function') {
        await pool.end()
      }
      await sleep(2)
    }
  }
}

export async function ensureDbServerIsUp (dbConfig) {
  const pool = await getPool(dbConfig)
  await pool.end()
}
