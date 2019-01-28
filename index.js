require('dotenv').config()

const { Client } = require('pg')
const massive = require('massive')
const express = require('express')
// const faker = require('faker')

const app = express()
const port = 3000

const connection = {
  host: process.env.DATA_POSTGRES_HOST,
  port: 5432, // postgres default port
  database: 'gonano',
  user: process.env.DATA_POSTGRES_USER,
  password: process.env.DATA_POSTGRES_PASS,
  max: 10, // max poolsize
  min: 0 // min poolsize
}

// Create account table if this is the first time running the app
// Would have named the table "user", but that is a reserved keyword in postgres
const client = new Client(connection)
client.connect()
client.query("CREATE TABLE IF NOT EXISTS account(email varchar(355) unique not null primary key, password varchar(50) not null)")
  .catch(e => console.error(e.stack))
  .then(() => client.end())

// Connect to massive so it can introspect the database
massive(connection)
  .then(db => {
    app.set('db', db)

    app.get('/', (req, res) => {
      console.log('TABLES:\n', req.app.get('db').listTables())
      res.send('Hello World!')
    })

    app.listen(
      port,
      '0.0.0.0', // necessary for the way nanobox handles networking
      () => console.log(`Example app listening on port ${port}!`)
    )
  })
