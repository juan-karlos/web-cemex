const express = require ('express')
const morgan = require('morgan')
const app = express()

app.set('port',process.env.PORT ||3200)

app.use(express.json()),
app.use(morgan('dev')),
app.use(express.urlencoded({extended:false}))

app.use(require("./routes/verificacion.routes"))

module.exports=app