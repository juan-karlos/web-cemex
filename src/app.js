const express = require ('express')
const morgan = require('morgan')
const cors = require("cors")
const passport = require('passport')
const app = express()
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser')
const path = require("path");

const whitelist=[
    "http://localhost:4200",
    "http://192.168.100.62:4200"

]
const corsOptions ={
    origin:function(origin,callback){
        try{
            if(whitelist.indexOf(origin)!==-1||!origin){
                callback(null,true);
            }
        }catch{
            
             callback(new Error("Not Allowed by CORS"));
            
        }
        
    },

};

app.use(cors(corsOptions));


app.use('/recursos', express.static(path.join(__dirname, 'recursos')));

app.set('port',process.env.PORT ||3500)

app.use(fileUpload())

app.use(express.json()),
app.use(morgan('dev')),
app.use(bodyParser.json()),
app.use(express.urlencoded({extended:false}))
app.use (bodyParser.urlencoded({extended:false}))
app.use(passport.initialize());


//rutas de los registros
app.use('/api/login',require("./routes/login.routes"));
app.use('/api/requerimiento',require('./routes/reg_requeriminto.routes'));
app.use('/api/unidad',require("./routes/uni_opera.routes"));
app.use('/api/regi',require("./routes/registro.routes"));
app.use('/api/historial',require("./routes/historial.routes"));
app.use('/api/logica',require("./routes/logica.routes"));
module.exports=app