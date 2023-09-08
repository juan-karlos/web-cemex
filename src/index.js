const pool = require('./database')
const app= require('./app.js')
require ('dotenv').config({path:'./src/.env'})

 const puerto = process.env.PORT;

app.listen(app.get('port'),()=>{
    console.log('servidor arriba en el puerto ' + puerto )
})