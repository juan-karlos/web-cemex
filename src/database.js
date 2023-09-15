const {createPool} = require('mysql2/promise')
require ('dotenv').config({path:'./src/.env'})

PORT = process.env.PORT
DB_HOST = process.env.DB_HOST 
DB_USER=process.env.DB_USER
DB_PASSWORD = process.env.DB_PASSWORD
DB_NAME =process.env.DB_NAME
DB_PORT=process.env.DB_PORT
 
const pool = createPool({
   user:DB_USER,
   password:DB_PASSWORD,
   host:DB_HOST,
   port:DB_PORT,
   database:DB_NAME
})

module.exports = pool