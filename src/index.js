require('dotenv').config()

// Alternatives and/or compliments to node-postgres include
// pg-promise, massive, squel, knex, sqitch, node-db-migrate,
// node-migrate, flyway, sequelize, typeorm, umzug, etc
const db = require('./db')
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
      (await db.query('SELECT * FROM account WHERE email=$1', [email]))
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

db
  .query('CREATE TABLE IF NOT EXISTS account(email VARCHAR(355) UNIQUE NOT NULL PRIMARY KEY, password VARCHAR(60) NOT NULL)')
  .then(() => console.log('Connected to database'))
  .catch(err => console.error('Error connecting to database', err.stack))

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
    (await db.query('SELECT * FROM account WHERE email = $1', [email]))
    .rows
    .length === 1
  ) {
    return res.status(400).json({ error: 'Account already exists' })
  }

  const hash = bcrypt.hashSync(password, salt)

  await db.query('INSERT INTO account (email, password) VALUES ($1, $2)', [email, hash])

  return res.status(200).json({ message: 'Account created' })
})

app.post('/changepassword', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { newPassword } = req.body

  if (checkPasswordStrength(newPassword) < 2) {
    return res.status(400).json({ error: 'Weak password' })
  }

  await db.query('UPDATE account SET password = $1 WHERE email = $2', [bcrypt.hashSync(newPassword, salt), req.user.email])

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
