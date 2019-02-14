require('dotenv').config()

// Alternatives and/or compliments to node-postgres include
// pg-promise, massive, squel, knex, sqitch, node-db-migrate,
// node-migrate, flyway, sequelize, typeorm, umzug, etc
const { Pool } = require('pg')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
// consider ditching passport for permit
const passport = require('passport')
const { BasicStrategy } = require('passport-http')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { checkPasswordStrength, checkEmailValidity } = require('./utils')

const app = express()
const port = 3000
const salt = bcrypt.genSaltSync(10)

passport.use(new BasicStrategy(
  async (email, password, cb) => {
    const user =
      (await pool.query('SELECT * FROM account WHERE email=$1', [email]))
      .rows[0]

    if (!user) return cb(null, false)

    const passwordValid = await bcrypt.compare(password, user.password)

    if (!passwordValid) return cb(null, false)

    let token = jwt.sign({
      // jwt claims go here
      // this includes standard claims like iat (issued at)
      // as well as any custom data you would like to include
      email: email
    }, process.env.JWT_SECRET)

    return cb(null, token)
  }
))

passport.use(new JwtStrategy(
  { secretOrKey: process.env.JWT_SECRET, jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() },
  (jwt_payload, cb) => {
    return cb(null, jwt_payload)
  }
))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())
// enable all cors requests
app.use(cors())
app.use(passport.initialize())

const connection = {
  host: 'postgres', // defined in docker-compose.yml
  port: 5432, // postgres default value
  database: 'postgres', // postres default value
  user: 'postgres', // postres default value
  password: 'postgres', // postres default value
  max: 10 // max poolsize
}

// Create account table if this is the first time running the app
// Would have named the table "user", but that is a reserved keyword in postgres
// 60 is the length of the bcrypt hash
const pool = new Pool(connection)

// Consider alternative ways to seed the database, rather than in the source code
// For example, check the documentation for the postgres docker image regarding
// docker-entrypoint-initdb.d
//
// The purpose for setTimeout (and there is likely a more elegant way to do this),
// is to delay until docker-compose has had a change to boot up the postgres container.
setTimeout(() => {
  pool
    .query('CREATE TABLE IF NOT EXISTS account(email VARCHAR(355) UNIQUE NOT NULL PRIMARY KEY, password VARCHAR(60) NOT NULL)')
    .then(() => console.log('Connected to database'))
    .catch(err => console.error('Error connecting to database', err.stack))
}, 10000)

app.get('/login', passport.authenticate('basic', { session: false }), (req, res) => {
  res.status(200).json({ jwt: req.user })
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

app.post('/changepassword', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { newPassword } = req.body

  if (checkPasswordStrength(newPassword) < 2) {
    return res.status(400).json({ error: 'Weak password' })
  }

  await pool.query('UPDATE account SET password = $1 WHERE email = $2', [bcrypt.hashSync(newPassword, salt), req.user.email])

  res.status(200).json({ message: 'Successfully changed password' })
})

app.post('/forgotpassword', (req, res) => {

})

app.post('/signout', (req, res) => {
  // might not need this endpoint... just invalidate the jwt on the client
})

app.post('/deleteaccount', (req, res) => {

})

app.use((req, res, next) => {
  return res.status(404).json({ message: 'Route not found' })
})

app.listen(
  port,
  () => console.log(`Example app listening on port ${port}!`)
)
