const pool = require('./database')
const app= require('./app.js')

app.listen(app.get('port'),()=>{
    console.log('servidor arriba en el puerto ' + port)
})