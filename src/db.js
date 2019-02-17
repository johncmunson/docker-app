const { Pool } = require('pg')

const connection = {
  host: 'postgres', // defined in docker-compose.yml
  port: 5432, // postgres default value
  database: 'postgres', // postgres default value
  user: 'postgres', // postgres default value
  password: 'postgres', // postgres default value
  max: 10 // max poolsize
}

const pool = new Pool(connection)

module.exports = {
  query: (text, params) => pool.query(text, params)
}
