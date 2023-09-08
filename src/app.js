const express = require ('express')
const morgan = require('morgan')
const passport = require('passport')
const app = express()

app.set('port',process.env.PORT ||3500)

app.use(express.json()),
app.use(morgan('dev')),
app.use(express.urlencoded({extended:false}))
app.use(passport.initialize());

//rutas de los registros
app.use('/api/login',require("./routes/login.routes"));
app.use('/api/requerimiento',require('./routes/reg_requeriminto.routes'));
app.use('/api/unidad',require("./routes/uni_opera.routes"));
app.use('/api/regi',require("./routes/registro.routes"));
app.use('/api/historial',require("./routes/historial.routes"));
module.exports=app