var XLSX = require("xlsx");
const moment = require("moment");
const pool = require("../database");
const path= require('path')
const controlexel = {};


controlexel.insertmasiva = async (req, res) => {
  const excelPath = "./src/exel/cemex-Mayo.xlsx";
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const datos = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  
  let nombre_planta;
  let segmento;
  let zona;
  let estado;
  let Porcentaje_cumplimiento;
  let fija;
  let activo;

  let nombre_requerimiento;
  let peso;
  let impacto;
  let siglas;
  let observaciones;
  let validez_unica;
  const nombresUnicos = new Set();

  // empiza
  try {
    for (let i = 0; i < datos.length; i++) {
      const nombrePlanta = datos[i].nombre_planta;

      if (!nombresUnicos.has(nombrePlanta)) {
        nombre_planta = datos[i].nombre_planta;
        (segmento = datos[i].segmento),
          (zona = datos[i].zona),
          (estado = datos[i].estado),
          (Porcentaje_cumplimiento = datos[i].porcentaje_cumplimiento);

        nombresUnicos.add(nombrePlanta);

        await pool.query(
          "INSERT INTO unidad_operativa (nombre_planta, segmento, zona, Estado, porcentaje_cumplimiento, fija, activo) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [nombre_planta, segmento, zona, estado, Porcentaje_cumplimiento, 1, 1]
        );
      }
    }
    console.log("");
    console.log("........................................");
    console.log("INSERCION DE LOS REQUERIMIENTOS REALIZADA");
    console.log("");

    for (let i = 0; i < datos.length; i++) {
      const nombrerec = datos[i].nombre_requerimiento;

      if (!nombresUnicos.has(nombrerec)) {
        // Imprime la información solo si el nombre de planta no se ha encontrado antes
        (nombre_requerimiento = datos[i].nombre_requerimiento),
          (peso = datos[i].peso),
          (impacto = datos[i].impacto);
        siglas = datos[i].siglas;
        if (siglas === undefined) {
          siglas = "siglas";
        }

        nombresUnicos.add(nombrerec);

        await pool.query(
          `INSERT INTO requerimiento (nombre_requerimiento, peso,impacto,siglas)VALUES(?,?,?,?)`,
          [nombre_requerimiento, peso, impacto, siglas]
        );
      }
    }

    const sqlQuery = `INSERT INTO registro (id_planta, id_requerimiento, fecha_inicio, fecha_vencimiento, observaciones, estatus, url, validez_unica)
SELECT uo.id_planta, req.id_requerimiento, ?, ?, ?, ?, ?, ?
FROM unidad_operativa AS uo
JOIN requerimiento AS req ON uo.nombre_planta = ? AND req.nombre_requerimiento = ?
WHERE (uo.id_planta, req.id_requerimiento) NOT IN (SELECT id_planta, id_requerimiento FROM registro);`;

    console.log("");
    console.log(
      "---------------------------------------------------------------------"
    );
    console.log("INSERCION DE LOS REQUERIMIENTOS ECHA ");

    for (let i = 0; i < datos.length; i++) {
      let nombre_planta = datos[i].nombre_planta;

      if (typeof nombre_planta === "number") {
        nombre_planta = nombre_planta.toString;
      }

      let nombre_requerimiento = datos[i].nombre_requerimiento;

      let fecha1 = datos[i].fecha_inicio;
      let fech1 = "";

      let fecha = datos[i].fecha_vencimiento;
      let fech2 = ""; // Inicializa la variable para que esté disponible fuera del bloque condicional

      if (typeof fecha1 === "number") {
        let fecha2 = moment(new Date((fecha1 - 25569) * 86400 * 1000));
        // Si deseas verificar si la fecha es válida, puedes hacerlo aquí
        if (fecha2.isValid()) {
          fech1 = fecha2.format("YYYY/MM/DD");
        }
      } else {
        const diahoy = new Date();
        const year = diahoy.getFullYear();
        const month = String(diahoy.getMonth() + 1).padStart(2, "0");
        const day = String(diahoy.getDate()).padStart(2, "0");
        fech1 = `${year}/${month}/${day}`;
      }

      if (typeof fecha === "number") {
        let fecha1 = moment(new Date((fecha - 25569) * 86400 * 1000));
        // Si deseas verificar si la fecha es válida, puedes hacerlo aquí
        if (fecha1.isValid()) {
          fech2 = fecha1.format("YYYY/MM/DD");
        }
      }

      observaciones = datos[i].observaciones;
      let estatus = datos[i].estatus;
      validez_unica = fecha === undefined ? 1 : 0;

      // if (fech2 == ""){
      //   estatus="Vigente";
      // }

      await pool.query(sqlQuery, [
        fech1 || null,
        fech2 || null,
        observaciones,
        estatus,
        null,
        validez_unica,
        nombre_planta,
        nombre_requerimiento,
      ]);
    }

    console.log("");
    console.log(
      "---------------------------------------------------------------------"
    );
    console.log("INSERCION DE LOS REGISTROS ECHA ECHA ");

    res.json({ mesage: "Se inserto correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mesage: "error al insertar los registros" });
  }
};


controlexel.rutas=async(req,res)=>{
  const rutaArchivoOriginal = path.join(__dirname,"..","..","..","..","/web-cemex");
  console.log(rutaArchivoOriginal)
 
  const rutaNuevoArchivo = path.join(__dirname,"..","..","..","..","/web-cemex");
  console.log(rutaNuevoArchivo)
  res.send("Prueba")
}

module.exports = controlexel;
