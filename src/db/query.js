export async function queryForAll (db, sql, values) {
  const [rowDataPackets] = await db.query(sql, values)
  return rowDataPackets
}

export async function queryForOne (db, sql, values) {
  return (await queryForAll(db, sql, values))[0]
}

export async function execute (db, sql, values) {
  await db.execute(sql, values)
}

export async function insertForId (db, sql, values) {
  const [{ insertId }] = await db.query(sql, values)
  return insertId
}
