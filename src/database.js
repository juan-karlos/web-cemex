const {createPool} = require('mysql2/promise')

port = process.env.PORT || 3200
DB_HOST = process.env.DB_HOST || 'localhost'
DB_USER = process.env.DB_USER || 'root'
DB_PASSWORD = process.env.DB_PASSWORD||'42853190'
DB_NAME =process.env.BD_NAME || 'cemex'
DB_PORT=process.env.DB_PORT||3306

const pool =createPool({
    user:DB_USER,
    password:DB_PASSWORD,
    host:DB_HOST,
    port:DB_PORT,
    database:DB_NAME
})

module.exports=pool