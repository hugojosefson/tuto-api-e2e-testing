function penultimate (arr) {
  return arr[arr.length - 2]
}

export async function execute (db, sql, values) {
  try {
    await db.execute(sql, values)
  } catch (e) {
    console.error('ERROR during execute: ' + JSON.stringify({ e }, null, 2))
  }
}

export async function queryForAll (db, sql, values) {
  try {
    const dbResponse = await db.query(sql, values)
    const [rowDataPackets] = dbResponse
    return rowDataPackets
  } catch (e) {
    console.error('ERROR during queryForAll: ' + JSON.stringify({ e }, null, 2))
  }
}

export async function queryForAllOfLastStatement (db, sql, values) {
  return penultimate(await queryForAll(db, sql, values))
}

export async function queryForOne (db, sql, values) {
  return (await queryForAll(db, sql, values))[0]
}

export async function queryForOneOfLastStatement (db, sql, values) {
  return (await queryForAllOfLastStatement(db, sql, values))[0]
}
