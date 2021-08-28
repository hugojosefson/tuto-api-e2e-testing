import { createPool } from 'mysql2/promise.js'

export async function getPool (dbConfig) {
  return await createPool({
    ...dbConfig,
    namedPlaceholders: true,
    multipleStatements: true
  })
}
