const express = require ('express')
const morgan = require('morgan')
const passport = require('passport')
const app = express()

app.set('port',process.env.PORT ||3200)

app.use(express.json()),
app.use(morgan('dev')),
app.use(express.urlencoded({extended:false}))
app.use(passport.initialize());


app.use('/api/login',require("./routes/login.routes"))
app.use('/api/login',require("./routes/reg_requeriminto.routes"))



module.exports=app