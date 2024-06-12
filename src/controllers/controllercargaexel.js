const XLSX = require('xlsx');
const fs = require('fs');
const pool = require('../database');
const path = require('path');
const moment = require("moment")

const controllerImportExel = {};

controllerImportExel.recargaexel = async (req, res) => {
  try {
    if (!req.files || !req.files.xlsxFile) {
      console.log("No se proporcionó ningún archivo");
      return res.status(400).json({ message: "No se proporcionó ningún archivo" });
    }

    const xlsxFile = req.files.xlsxFile;
    const nombreOriginal = xlsxFile.name;
    const fechaHoraActual = new Date();
    const formatoFechaHora = fechaHoraActual.toISOString().replace(/[-:.T]/g, "");
    const nuevoNombre = `${nombreOriginal}_${formatoFechaHora}.xlsx`;
    const nombreSinEspacios = nuevoNombre.replace(/\s+/g, '_');

    const rutaArchivoOriginal = path.join(__dirname, "../exel", nombreOriginal);
    const rutaNuevoArchivo = path.join(__dirname, "../exel", nombreSinEspacios);

    await xlsxFile.mv(rutaArchivoOriginal);
    await fs.promises.rename(rutaArchivoOriginal, rutaNuevoArchivo);

    console.log("Archivo guardado correctamente:", rutaNuevoArchivo);

    const ruta = path.join(__dirname, "../exel", nombreSinEspacios);
    console.log(ruta);

    let exel = XLSX.readFile(ruta);
    let sheetname = exel.SheetNames[0];
    let datos = XLSX.utils.sheet_to_json(exel.Sheets[sheetname]);

    let plan = [];
    let per = [];
    const pla_unicos = new Set();
    const per_unicos = new Set();

    // Lista para almacenar los registros que se van a exportar
    let registrosParaExportar = [];

    for (const dato of datos) {
      const [registro] = await pool.query(
        `SELECT id_registro, nombre_requerimiento, nombre_planta, estatus, observaciones, validez_unica, fecha_vencimiento, zona, segmento
         FROM unidad_operativa 
         JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
         JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento 
         WHERE nombre_planta = ? AND nombre_requerimiento = ?`,
        [dato.nombre_planta, dato.nombre_requerimiento]
      );

      if (registro.length === 0) {
        const [planta] = await pool.query(
          "SELECT nombre_planta FROM unidad_operativa WHERE nombre_planta = ?",
          [dato.nombre_planta]
        );

        const [permiso] = await pool.query(
          "SELECT nombre_requerimiento FROM requerimiento WHERE nombre_requerimiento = ?",
          [dato.nombre_requerimiento]
        );

        if (!pla_unicos.has(dato.nombre_planta)) {
          if (planta.length === 0 && permiso.length >= 0) {
            console.log("No se encontró esta planta");
            console.log("nombre_planta: ", dato.nombre_planta);
            plan.push(dato.nombre_planta);
          } else {
            if (!per_unicos.has(dato.nombre_requerimiento)) {
              if (planta.length > 0 && permiso.length === 0) {
                console.log("No se encontró el permiso");
                console.log("nombre del permiso: ", dato.nombre_requerimiento);
                per.push(dato.nombre_requerimiento);
              }
              per_unicos.add(dato.nombre_requerimiento);
            }
          }
          pla_unicos.add(dato.nombre_planta);
        }
      } else {
        //registro encontrado es de la base de datos
        const registroEncontrado = registro[0];

        // const registroValidezUnicaBool = Boolean(registroEncontrado.validez_unica);
        // const datoValidezUnicaBool = Boolean(dato.validez_unica);

        const registroValidezUnicaBool = registroEncontrado.validez_unica === true || registroEncontrado.validez_unica === 'true' || registroEncontrado.validez_unica === 1 || registroEncontrado.validez_unica === '1';
        const datoValidezUnicaBool = dato.validez_unica === true || dato.validez_unica === 'true' || dato.validez_unica === 1 || dato.validez_unica === '1';

        // Convertir las fechas a formato AAAA-MM-DD
        let fechadat = registroEncontrado.fecha_vencimiento ? moment(new Date(registroEncontrado.fecha_vencimiento)).format("YYYY-MM-DD") : "";

        let fech2 = "";

        if (typeof dato.fecha_vencimiento === "number") {
          let fecha1 = moment(new Date((dato.fecha_vencimiento - 25569) * 86400 * 1000));
          if (fecha1.isValid()) {
            fech2 = fecha1.format("YYYY-MM-DD");
          }
        }

                // console.log("Datos de la base de datos")
                // console.log(typeof registroValidezUnicaBool);
                // console.log(registroValidezUnicaBool, datoValidezUnicaBool )
                // console.log("Datos sin conversion",registroEncontrado.validez_unica, dato.validez_unica  )
                // console.log("fecha del exel")
                // console.log(typeof datoValidezUnicaBool);



        if (registroEncontrado.estatus !== dato.estatus || fechadat !== fech2) {
          // console.log("Fecha de la base de datos   -"+fechadat+" fecha del exel  -"+fech2)
          // Agregar los datos al registro para exportar
          registrosParaExportar.push({
            nombre_planta: registroEncontrado.nombre_planta,
            nombre_requerimiento: dato.nombre_requerimiento,
            estatus_base: registroEncontrado.estatus,
            estatus_excel: dato.estatus,
            validez_unica_base: registroValidezUnicaBool,
            validez_unica_excel: datoValidezUnicaBool,
            fecha_vencimiento_base: fechadat,
            fecha_vencimiento_excel: fech2,
            zona: registroEncontrado.zona,
            segmento: registroEncontrado.segmento
            
          });
        }
      }
    }

    // Crear un nuevo libro de Excel con los registros para exportar
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(registrosParaExportar);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Diferencias");

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=diferencias.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

    console.log("Recuento de las plantas que no están: " + plan.length);
    console.log("Recuento de los permisos que no están: " + per.length);
  } catch (error) {
    console.error('Error en el procesamiento del archivo:', error);
    res.status(500).json({ error: 'Ocurrió un error al procesar el archivo' });
  }
};

module.exports = controllerImportExel;







