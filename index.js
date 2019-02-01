require('dotenv').config()

const { Pool } = require('pg')
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
  max: 10 // max poolsize
}

// Create account table if this is the first time running the app
// Would have named the table "user", but that is a reserved keyword in postgres
// 60 is the length of the bcrypt hash
const pool = new Pool(connection)
pool
  .query('CREATE TABLE IF NOT EXISTS account(email varchar(355) unique not null primary key, password varchar(60) not null)')
  .catch(err => console.error('Error executing query', err.stack))

// app.post('/add', async (req, res) => {
//   const { email, password } = req.body
//   await pool.query('INSERT INTO account (email, password) VALUES ($1, $2)', [email, password])
//   return res.json({msg:'done'})
// })

// app.get('/get', async (req, res) => {
//   const { rows } = await pool.query('SELECT * FROM account')
//   return res.json(rows)
// })

app.post('/login', (req, res) => {
  // use req.body.email to lookup hash... const hash =
  if (bcrypt.compareSync(req.body.password, hash)) {
    // use passport jwt strategy to issue a jwt
    // not sure if we'll need to make use of passport basic auth
  }
})

app.post('/signup', async (req, res) => {
  const { email, password } = req.body

  // check password strength
  if (checkPasswordStrength(password) < 2) {
    return res.status(400).json({ error: 'Weak password' })
  }
  // check if email is valid
  if (!checkEmailValidity(email)) {
    return res.status(400).json({ error: 'Invalid email' })
  }
  // check that account/email doesn't already exist
  if (
    (await pool.query('SELECT * FROM account WHERE email = $1', [email]))
    .rows
    .length === 1
  ) {
    return res.status(400).json({ error: 'Account already exists' })
  }

  const hash = bcrypt.hashSync(password, salt)

  await pool.query('INSERT INTO account (email, password) VALUES ($1, $2)', [email, hash])

  return res.status(200).json({ message: 'Account created' })
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

app.listen(
  port,
  '0.0.0.0', // necessary for the way nanobox handles networking
  () => console.log(`Example app listening on port ${port}!`)
)
