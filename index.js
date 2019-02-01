require('dotenv').config()

const { Client } = require('pg')
const massive = require('massive')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const { checkPasswordStrength, checkEmailValidity } = require('./utils')
// const faker = require('faker')

const app = express()
const port = 3000
const salt = bcrypt.genSaltSync(10)

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// enable all cors requests
app.use(cors())

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
client.query('CREATE TABLE IF NOT EXISTS account(email varchar(355) unique not null, password varchar(50) not null, PRIMARY KEY(email))')
  .catch(e => console.error(e.stack))
  .then(() => client.end())

// Connect to massive so it can introspect the database
const db = massive(connection)
  .then(db => {
    app.set('db', db) // recommended per massive docs. access later via req.app.get('db')

    // consider forwarding POST requests at '/' to '/login'

    app.post('/login', (req, res) => {
      // use req.body.email to lookup hash... const hash =
      if (bcrypt.compareSync(req.body.password, hash)) {
        // use passport jwt strategy to issue a jwt
        // not sure if we'll need to make use of passport basic auth
      }
    })

    app.post('/signup', async (req, res) => {
      const email = req.body.email
      const password = req.body.password

      if (checkPasswordStrength(password) < 2) {
        return res.status(400).json({ error: 'Weak password' })
      }
      if (!checkEmailValidity(email)) {
        return res.status(400).json({ error: 'Invalid email' })
      }
      if (await req.app.get('db').account.findOne({ email: email })) { // check that account/email doesn't already exist
        return res.status(400).json({ error: 'Account already exists' })
      }

      const hash = bcrypt.hashSync(password, salt)

      req.app.get('db').account.save({ email: email, password: hash })

      console.log(await req.app.get('db').account.findOne({ email: email }))

      return res.status(200).json({ message: 'success!' })
    })

    app.post('/changepassword', (req, res) => {

    })

    app.post('/forgotpassword', (req, res) => {

    })

    app.post('/signout', (req, res) => {
      // might not need this endpoint... just invalidate the jwt on the client
    })

    app.post('/deleteaccount', (req, res) => {

    })

    app.use((req, res, next) => {
      return res.status(404).send('route not found')
    })

    // app.get('/', (req, res) => {
    //   console.log('TABLES:\n', req.app.get('db').listTables())
    //   res.send('Hello World!')
    // })

    app.listen(
      port,
      '0.0.0.0', // necessary for the way nanobox handles networking
      () => console.log(`Example app listening on port ${port}!`)
    )
  })
