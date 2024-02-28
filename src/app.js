const cron = require("node-cron");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const passport = require("passport");
const app = express();
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const path = require("path");
const controladorVencimiento = require("./controllers/verificadorVencidos");
const controladorHistorial=require("./controllers/historial")

const { default: rateLimit } = require("express-rate-limit");

const currentDate = new Date();
const ultimoDiaDelMes = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() + 1,
  0
);
const monthCron = ultimoDiaDelMes.getMonth() + 1;

// Corrige la expresión de cron para ejecutar a las 23:50 en el último día de cada mes
const fechaFormateada = `50 23 ${ultimoDiaDelMes.getDate()} ${monthCron} *`;


// const whitelist = ["http://localhost:4200", "http://192.168.100.62:4200"];
const corsOptions = {
    origin: '*'
    // function (origin, callback) {
    //     if (whitelist.indexOf(origin) !== -1 || !origin) {
    //       callback(null, true);
    //     } else {
    //       callback(new Error("Not Allowed by CORS"));
    //     }
    //   },
    };
// const corsOptions={
//     origin:"*"
// }

const HOST =('0,0,0,0')

// Lista de bloqueo de IPs
const blockedIPs = new Set();

// Configuración del límite de peticiones
const limiter = rateLimit({
  windowMs: 1000, // 1 segundo
  max: 200, // Número máximo de peticiones por segundo
  handler: (req, res, next) => {
    // Alcanzado el límite, bloquear la IP
    blockedIPs.add(req.ip);
    res.status(403).send('Acceso prohibido. Tu IP ha sido bloqueada.');
  },
});

// Middleware de límite de peticiones
app.use((req, res, next) => {
  // Verificar si la IP está bloqueada
  if (blockedIPs.has(req.ip)) {
    return res.status(403).send('Acceso prohibido. Tu IP ha sido bloqueada.');
  }
  // Si la IP no está bloqueada, continuar con el siguiente middleware
  next();
});

app.use(cors(corsOptions));

// Aplicar el middleware de límite de peticiones a todas las rutas
app.use(limiter);



app.use("/recursos", express.static(path.join(__dirname, "recursos")));
app.set("port", process.env.PORT || 3500);

app.use(fileUpload());
app.use(express.json()),
app.use(morgan("dev")),
app.use(bodyParser.json()),
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

//rutas de los registros


// app.use('/recursos',express.static(path.join(__dirname,'src')))

app.use("/api/login", require("./routes/login.routes"));
app.use("/api/requerimiento", require("./routes/reg_requeriminto.routes"));
app.use("/api/unidad", require("./routes/uni_opera.routes"));
app.use("/api/regi", require("./routes/registro.routes"));
app.use("/api/historial", require("./routes/historial.routes"));
app.use("/api/logica", require("./routes/logica.routes"));



//programa que se insertara el ultimo diia del mes a las 11:20
cron.schedule(fechaFormateada,()=>{
  controladorHistorial.insertarHitorial();
})

// Programar la tarea diaria a la 12 am
cron.schedule("00 00 * * *", () => {
  controladorVencimiento.updateToVencimiento();
  controladorVencimiento.vencSiguienteDia();
});

//Programa la tarea cada semana a las 12:00am los dias domingo
cron.schedule("01 0 * * 0", () => {
  controladorVencimiento.VencenEstaSemana();
});

cron.schedule("02 0 1 * *", () => {
  controladorVencimiento.unMes();
});

cron.schedule("04 0 1 */3 *", () => {
  controladorVencimiento.tresMeses();
});

app.use((req, res, next) => {
  res.status(404).json({
    message: "enpoint no encontrado",
  });
});

module.exports = app;
