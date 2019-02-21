'use strict'

const db = require('../src/db')

module.exports.up = async () => {
  try {
    await db.query(
      'CREATE TABLE IF NOT EXISTS account(email VARCHAR(355) UNIQUE NOT NULL PRIMARY KEY, password VARCHAR(60) NOT NULL)'
    )
  } catch (err) {
    console.error('Failed migration', err.stack)
  }
}

module.exports.down = async () => {
  try {
    await db.query('DROP TABLE IF EXISTS account')
  } catch (err) {
    console.error('Failed migration', err.stack)
  }
}
