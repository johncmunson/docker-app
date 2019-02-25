'use strict'

const db = require('../db.js')

module.exports.up = async () => {
  try {
    await db.query(
      'ALTER TABLE account ADD activation_code uuid NOT NULL, ADD activated boolean NOT NULL DEFAULT FALSE'
    )
  } catch (err) {
    console.error('Failed migration', err.stack)
  }
}

module.exports.down = async () => {
  try {
    await db.query(
      'ALTER TABLE account DROP COLUMN activation_code, DROP COLUMN activated'
    )
  } catch (err) {
    console.error('Failed migration', err.stack)
  }
}
