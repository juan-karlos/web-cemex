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

app.use(cors(corsOptions));
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
