var XLSX= require('xlsx')
const fs = require('fs');
const pool = require('../database')
const path = require('path'); // Se añade la importación de path

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

    const ruta = `./src/exel/${nombreSinEspacios}`;
    console.log(ruta);

    const exel = XLSX.readFile(ruta);
    const sheetname = exel.SheetNames[0];
    const datos = XLSX.utils.sheet_to_json(exel.Sheets[sheetname]);

    const nombresUnicosPlanta = new Set();
    const nombresUnicosRequerimiento = new Set();

    for (const dato of datos) {
      const nombrePlanta = dato.nombre_planta;
      const nombreRequerimiento = dato.nombre_requerimiento;


      if (!nombresUnicosPlanta.has(nombrePlanta)) {
        nombresUnicosPlanta.add(nombrePlanta);

        let [consulta] =await pool.query(
                      "SELECT nombre_planta,segmento,zona from unidad_operativa WHERE nombre_planta=? and segmento=? and zona=?",
                      [dato.nombre_planta,dato.segmento,dato.zona]);


          
        if(consulta.length<1){
          console.log("");
          console.log("Se Insertaron estos datos");
          console.log(dato.nombre_planta, dato.segmento, dato.zona, dato.estado, dato.porcentaje_cumplimiento, dato.fija, dato.activo);
          await pool.query(
            "INSERT INTO unidad_operativa (nombre_planta, segmento, zona, estado, porcentaje_cumplimiento, fija, activo) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [dato.nombre_planta, dato.segmento, dato.zona, dato.estado, dato.porcentaje_cumplimiento, dato.fija, dato.activo]
          );


        }else{
          console.log("Se Actualizo en la base de datos estos datos")
          console.log(dato.porcentaje_cumplimiento, dato.fija, dato.activo);

          await pool.query(
            "UPDATE unidad_operativa SET porcentaje_cumplimiento = IFNULL(?, porcentaje_cumplimiento), fija = IFNULL(?, fija), activo = IFNULL(?, activo) WHERE nombre_planta = ?",
            [dato.porcentaje_cumplimiento, dato.fija, dato.activo, dato.nombre_planta]
          );
        }
      
      }

      if (!nombresUnicosRequerimiento.has(nombreRequerimiento)) {
        nombresUnicosRequerimiento.add(nombreRequerimiento);
        
      const [requi]=await pool.query("SELECT nombre_requerimiento from requerimiento WHERE nombre_requerimiento=?",[dato.nombre_requerimiento])

      if(requi.length<1){
        console.log("Se insertaron los siguientes datos");
        console.log(dato.nombre_requerimiento, dato.peso, dato.impacto, dato.siglas || "siglas");


        await pool.query(
          "INSERT INTO requerimiento (nombre_requerimiento, peso, impacto, siglas) VALUES (?, ?, ?, ?)",
          [dato.nombre_requerimiento, dato.peso, dato.impacto, dato.siglas || "siglas"]
        );

       } 
     
      }

      const fechaInicio = dato.fecha_inicio || null;
      const fechaVencimiento = dato.fecha_vencimiento || null;
      const observaciones = dato.observaciones || "";
      const estatus = dato.estatus || "Vigente";
      const validezUnica = fechaVencimiento ? 0 : 1;

      // console.log("Se acualizaron los dartos de los registros")
      // console.log(fechaInicio, fechaVencimiento, observaciones, estatus, validezUnica, dato.nombre_planta, dato.nombre_requerimiento)

      await pool.query(
        `UPDATE registro
         JOIN unidad_operativa AS uo ON registro.id_planta = uo.id_planta
         JOIN requerimiento AS req ON registro.id_requerimiento = req.id_requerimiento
         SET registro.fecha_inicio = COALESCE(?, registro.fecha_inicio),
             registro.fecha_vencimiento = COALESCE(?, registro.fecha_vencimiento),
             registro.observaciones = COALESCE(?, registro.observaciones),
             registro.estatus = COALESCE(?, registro.estatus),
             registro.validez_unica = COALESCE(?, registro.validez_unica)
         WHERE uo.nombre_planta = ? 
         AND req.nombre_requerimiento = ? 
         AND NOT EXISTS (
           SELECT 1 FROM (
             SELECT id_planta, id_requerimiento FROM registro
           ) AS sub
           WHERE sub.id_planta = registro.id_planta 
           AND sub.id_requerimiento = registro.id_requerimiento
         );`,
        [fechaInicio, fechaVencimiento, observaciones, estatus, validezUnica, dato.nombre_planta, dato.nombre_requerimiento]
      );
    }

    console.log("Proceso de inserción de datos completado.");

    res.status(200).json({ message: "Datos insertados correctamente" });

  } catch (error) {
    console.error('Error en el procesamiento del archivo:', error);
    res.status(500).json({ error: 'Ocurrió un error al procesar el archivo' });
  }
};




module.exports = controllerImportExel;





