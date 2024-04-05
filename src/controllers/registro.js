const { json, text } = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const pool = require("../database");
const fs = require("fs", "fs-extra");
const { url } = require("inspector");
const archiver = require("archiver");
const fse = require("fs-extra");
const iconv = require("iconv-lite");
const moment = require("moment");
const exceljs=require('exceljs')

const controladorRegistro = {};

//descarga masiva de documentos

controladorRegistro.descargas = async (req, res) => {
  try {
    const { requerimiento, zona, segmento,rango1,rango2,banfech} = req.body;

    const urlQuery = `
      SELECT url
      FROM documentos
      WHERE url IS NOT NULL AND nombre_requerimiento=? AND zona=? AND segmento=?;
    `;

    const urlfechas =`SELECT url 
        FROM documentos 
        WHERE url IS NOT NULL 
        AND nombre_requerimiento = ? 
        AND zona = ?
        AND segmento = ? 
        AND fecha_inicio BETWEEN ? AND ? `
        
        let [rutas]= []

        if (banfech != true){
           [rutas] = await pool.query(urlQuery, [requerimiento, zona, segmento]);
           console.log(" no se implemento la fecha")
        }else{
          [rutas] = await pool.query(urlfechas, [requerimiento, zona, segmento,rango1,rango2]);
          console.log("se implemento fecha")
          console.log("fecha1",rango1,"fecha2",rango2)
        }
     

    console.log(rutas);

    if (rutas.length === 0) {
      console.log("No se encontraron datos en la ruta");
      return res.status(404).json({ message: "No se encontraron datos en la ruta" });
    }

    const urls = rutas.map((ruta) => ruta.url);
    console.log("Rutas mapeadas:", urls);

    const carpetaTemporal = `C:/Users/juank/OneDrive/Documentos/Cemex/web-cemex/web-cemex/archivos_temporales`;

    // Crear la carpeta temporal si no existe
    try {
      await fse.ensureDir(carpetaTemporal);
      console.log("Carpeta temporal creada exitosamente");
    } catch (error) {
      console.error("Error al crear la carpeta temporal:", error);
      return res.status(500).json({ message: "Error al crear la carpeta temporal" });
    }

    // Copiar los archivos a la carpeta temporal
    let archivosCopiados = 0;

    for (const urlCompleta of urls) {
      const urlObj = new URL(urlCompleta);
      const rutaDecodificada = decodeURIComponent(urlObj.pathname);
      console.log("Ruta decodificada:", rutaDecodificada);

      const nombreArchivo = path.basename(rutaDecodificada);
      console.log("Nombre del archivo:", nombreArchivo);

      const rutaArchivoOriginal = path.join(__dirname, "..", "..", "recursos", nombreArchivo);
      console.log("Ruta original:", rutaArchivoOriginal);

      const destino = path.join(carpetaTemporal);
      console.log("Destino:", destino);
      console.log(".........................................................")
      console.log("                ")

      try {
        const destino = path.join(carpetaTemporal, nombreArchivo);
        await fse.copy(rutaArchivoOriginal, destino);
        console.log(`Archivo ${nombreArchivo} copiado exitosamente.`);
        archivosCopiados++;
      } catch (error) {
        console.error(`Error al copiar el archivo ${nombreArchivo}: ${error.message}`);
        return res.status(500).json({ message: "Error al procesar archivos" });
      }
    }

    // Verificar si se copió al menos un archivo a la carpeta temporal
    if (archivosCopiados === 0) {
      console.log("No hay archivos disponibles para descargar");
      return res.status(404).json({ message: "No hay archivos disponibles para descargar" });
    }

    // Crear el archivo ZIP
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Nivel de compresión máximo
    });

    // Agregar archivos de la carpeta temporal al archivo ZIP
    archive.directory(carpetaTemporal, "archivos_temporales");

    res.attachment("descarga-masiva.zip");
    archive.pipe(res);

    // Manejar errores en la creación del archivo ZIP
    archive.on("error", (err) => {
      console.error(`Error al crear el archivo ZIP: ${err.message}`);
      res.status(500).json({ message: "No hay documentos para descargar, intente de nuevo" });
    });

    // Finalizar el archivo ZIP
    await archive.finalize();

    // Eliminar la carpeta temporal después de comprimir
    await fse.remove(carpetaTemporal);

    console.log("Descarga masiva completada");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hay problemas en el servidor" });
  }
};

controladorRegistro.docsplan = async (req,res)=>{
  const registro = { id_requerimiento: req.params.cb };
  id = JSON.stringify(registro);
  const recid = /(\d+)/g;
  const idrecu = id.match(recid);

  const quey = `SELECT * FROM documentos where id_registro = ?`

  try{
    const [documento]= await pool.query(quey,[idrecu]);
    if(documento.length>0){
      res.status(200).json(documento)
    }else{
      res.status(400).json({message:"No se encontraron documentos"})
    }
  } catch (error){
    console.log("hay un error", error)
    res.status(500).json({message:"Hay un error interno"})
  }
}

//obtiene un registro
controladorRegistro.obtenerUnRegi  = async (req, res) => {
  const registro = { id_requerimiento: req.params.cb };
  id = JSON.stringify(registro);
  const recid = /(\d+)/g;
  const idrecu = id.match(recid);
  try {
    const [permiso] = await pool.query(
      `SELECT id_registro,nombre_requerimiento,nombre_planta,fecha_inicio,fecha_vencimiento,observaciones,estatus,url,validez_unica
    FROM registro,unidad_operativa,requerimiento
    where unidad_operativa.id_planta=registro.id_planta and requerimiento.id_requerimiento = registro.id_requerimiento and registro.id_registro=?`,
      [idrecu]
    );
    res.json(permiso);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error en el servidor" });
  }
};

//controlador que trae todos los registros
controladorRegistro.obtenerRegistro = async (req, res) => {
  try {
    const [registros] =
      await pool.query(`SELECT id_registro,nombre_requerimiento,nombre_planta,porcentaje_cumplimiento,peso,zona,impacto,segmento,siglas,validez_unica,fecha_inicio,fecha_vencimiento,observaciones,estatus,url,validez_unica
    FROM registro,unidad_operativa,requerimiento
    where unidad_operativa.id_planta=registro.id_planta and requerimiento.id_requerimiento = registro.id_requerimiento
     `);
    res.json(registros);
    console.log("se enviaron los registros");
  } catch (Excepcion) {
    console.log(Excepcion);
    res
      .status(500)
      .json({ message: "hay un error en el systema intente mas tarde" });
  }
};
//controlador para poder acomodar los registros en un exel

controladorRegistro.importExel=async(req,res)=>{
  try {
// Obtén la fecha y hora actual
const fechaActual = moment();

// Formatea la fecha actual en el formato 'YYYY-MM-DD HH:mm:ss'
const fecha = moment().format('YYYY-MM-DD_HH-mm-ss');

    const consultaregis=`SELECT id_registro,nombre_requerimiento,nombre_planta,porcentaje_cumplimiento,validez_unica,segmento,peso,zona,impacto,siglas,fecha_inicio,fecha_vencimiento,observaciones,estatus,activo,fija
    FROM registro,unidad_operativa,requerimiento
    where unidad_operativa.id_planta=registro.id_planta and requerimiento.id_requerimiento = registro.id_requerimiento;
     `;
    const [registros] = await pool.query(consultaregis);

    if(registros.length>0){
       // Crear un nuevo libro de Excel
       const workbook = new exceljs.Workbook();
       const worksheet = workbook.addWorksheet("registros");
       // Agregar encabezados
       worksheet.columns = [
         { header: "nombre_requerimiento", key: "nombre_requerimiento", width: 30 },
         { header: "nombre_planta", key: "nombre_planta", width: 40 },
         { header: "porcentaje_cumplimiento", key: "porcentaje_cumplimiento", width: 10 },
         { header: "segmento", key: "segmento", width: 50 },
         { header: "peso", key: "peso", width: 15 },
         { header: "zona", key: "zona", width: 10 },
         { header: "impacto", key: "impacto", width: 30 },
         { header: "siglas", key: "siglas", width: 10 },
         { header: "observaciones", key: "observaciones", width: 80},
         { header: "estatus", key: "estatus", width: 25 },
         { header: "activo",  key: "activo",width:  10 },
         { header: "fija",  key:  "fija", width : 10 },
         { header: "fecha_inicio", key: "fecha_inicio", width: 10 },
         { header: "fecha_vencimiento", key: "fecha_vencimiento", width: 10 },
       ];
       // Agregar datos al libro de Excel
       worksheet.addRows(registros);
       const excelFileName = `Registros_de_fecha: ${fecha}.xlsx`;

 // Configurar la respuesta HTTP
res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
res.setHeader('Content-Disposition', `attachment; filename = ${excelFileName}`);
       // Guardar el libro de Excel en un buffer
       const buffer = await workbook.xlsx.writeBuffer();
       // Generar un nombre único para el archivo Excel
      res.end(Buffer.from(buffer));
      console.log("se enviaron los registros");
    }
  } catch (Excepcion) {
    console.log(Excepcion);
    res
      .status(500)
      .json({ message: "hay un error en el systema intente mas tarde" });
  }

};

// estos son los registros para la cosulta por medio de zona y segmento

controladorRegistro.obtenerRegistro_segmento = async (req, res) => {

  const {segmento,zona}=req.body
  let consulta;

  console.log(segmento,zona)
  try {
    if(segmento===undefined || segmento===""){
      consulta=`SELECT id_registro,nombre_requerimiento,nombre_planta,porcentaje_cumplimiento,peso,zona,segmento,impacto,siglas,validez_unica,fecha_inicio,fecha_vencimiento,observaciones,estatus,url,validez_unica
      FROM registro,unidad_operativa,requerimiento
      where unidad_operativa.id_planta=registro.id_planta and requerimiento.id_requerimiento = registro.id_requerimiento  and zona =?;`;
      const [registros] = await pool.query(consulta,[zona]);
      if(registros.length===0){
        res.status(400).json({message:`No se encontraron registros con el registro ${zona} `})
      }else{
        console.log(zona)
      res.status(200).json(registros)
      console.log("se enviaron los registros")

      }
      
    }else{
      consulta=`SELECT id_registro,nombre_requerimiento,nombre_planta,porcentaje_cumplimiento,peso,zona,segmento,impacto,siglas,validez_unica,fecha_inicio,fecha_vencimiento,observaciones,estatus,url,validez_unica
      FROM registro,unidad_operativa,requerimiento
      where unidad_operativa.id_planta=registro.id_planta and requerimiento.id_requerimiento = registro.id_requerimiento  and zona =? and segmento=?;`;
      const [registros] = await pool.query(consulta,[zona,segmento]);

      

      if(registros.length<=0){
        res.status(400).json({message:`No se encontraron registros con el registro ${zona} y ${segmento}`})
      }else{
      console.log(segmento,zona)
      res.status(200).json(registros)
      console.log("se enviaron los registros")
      }
    }
    console.log("se enviaron los registros");
  } catch (Excepcion) {
    console.log(Excepcion);
    res.status(500).json({ message: "hay un error en el systema intente mas tarde" });
  }
};

// Controlador para cargar el archivo PDF y agregar un nuevo registro

controladorRegistro.insertarPdf = async (req, res) => {
  const sqlQuery = `INSERT INTO registro (id_planta, id_requerimiento, fecha_inicio, 
    fecha_vencimiento, observaciones, estatus, url, validez_unica)
SELECT uo.id_planta, req.id_requerimiento, ?, ?, ?, ?, ?, ?
FROM unidad_operativa AS uo
JOIN requerimiento AS req ON uo.nombre_planta = ? AND req.nombre_requerimiento = ?
WHERE (uo.id_planta, req.id_requerimiento) NOT IN (SELECT id_planta, id_requerimiento FROM registro);`;

const documentos= `INSERT INTO documentos (id_registro, nombre_planta, nombre_requerimiento, url, fecha_inicio, 
  fecha_vencimiento, impacto, zona,
segmento, nombre_doc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`  // Verifica si se envió un archivo PDF
  console.log("se resivio la peticion");

  let {
    nombre_requerimiento,
    nombre_planta,
    fechaAcomodada2,
    estatus,
    observaciones,
    pdfUrls,
  } = req.body;

  let fechaAcomodada=moment().format("YYYY/MM/DD");
  let pdfUrlsSinEspacios; 
  let nombre_sinespacios ;

  if (fechaAcomodada2 == "Fecha inválida") {
          (fechaAcomodada2 = null);
  }
  const val = req.body.validez_unica;
  const validez_unica = val === "true" ? true : false;

  if(validez_unica==true){
    fechaAcomodada2=null
  }

  try {
    const [afectaciones] = await pool.execute(sqlQuery, [
      fechaAcomodada,
      fechaAcomodada2,
      observaciones,
      estatus,
      null,
      validez_unica,
      nombre_planta,
      nombre_requerimiento,
    ]);

    if (afectaciones.affectedRows > 0) {
      if (!req.files || !req.files.pdfFile) {
        pdfUrls = null;
        console.log(pdfUrls);
      } else {
        const pdfFile = req.files.pdfFile;
        const nombreOriginal = pdfFile.name;
        // Obtener la fecha y hora actual
        const fechaHoraActual = new Date();
        const formatoFechaHora = fechaHoraActual
          .toISOString()
          .replace(/[-:.T]/g, "");
        // Generar un nuevo nombre con la fecha y hora
        const nuevoNombre = `${nombreOriginal}_${formatoFechaHora}.pdf`;

        pdfUrls = `http://86.38.204.102:3200/api/regi/documento/${nuevoNombre}`;
        pdfUrlsSinEspacios = pdfUrls.replace(/\s+/g, '_');
        nombre_sinespacios =nuevoNombre.replace(/\s+/g, '_');
          console.log(pdfUrlsSinEspacios);
          console.log(nombre_sinespacios)

        if (!fs.existsSync("./recursos")) {
          fs.mkdirSync("./recursos");
        }

        const rutaArchivoOriginal = path.join(
          __dirname,"..","../recursos", nombreOriginal
        );
        const rutaNuevoArchivo = path.join(
          __dirname,"..","../recursos",nombre_sinespacios);

        console.log("Problema")

        
        pdfFile.mv(rutaArchivoOriginal, (err) => {
          if (err) {
            console.error("Error al cargar el archivo:", err);
            return res.status(500).json({ message: "Error al cargar el archivo" });
          }
        
          // Renombrar el archivo
          fs.rename(rutaArchivoOriginal, rutaNuevoArchivo, (err) => {
            if (err) {
              console.error("Error al renombrar el archivo:", err);
              return res.status(500).json({ message: "Error al renombrar el archivo" });
            }
        
        
          });
        });

        const [rows] = await pool.query(`
        SELECT id_registro, impacto, zona, segmento
        FROM registro 
        JOIN unidad_operativa ON registro.id_planta = unidad_operativa.id_planta 
        JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento 
        WHERE nombre_planta = ? 
        AND nombre_requerimiento = ?`, [nombre_planta, nombre_requerimiento]);
    
    
        const id_registro = rows[0].id_registro;
        const impacto = rows[0].impacto;
        const zona = rows[0].zona;
        const segmento = rows[0].segmento;
    
        console.log(id_registro, impacto, zona, segmento,nombre_planta, nombre_requerimiento,
          pdfUrlsSinEspacios, fechaAcomodada, fechaAcomodada2,nombreOriginal);


      console.log(`Este es el ID del registro ${id_registro }`);

      await pool.query(documentos,[id_registro, nombre_planta, nombre_requerimiento,
        pdfUrlsSinEspacios, fechaAcomodada, fechaAcomodada2, impacto, zona,
        segmento, nombreOriginal])
      }

      const quer = `
              SELECT SUM(peso) as total
              FROM unidad_operativa, registro, requerimiento 
              WHERE nombre_planta = ? AND 
              unidad_operativa.id_planta = registro.id_planta AND 
              registro.id_requerimiento = requerimiento.id_requerimiento
          `;

      const quer2 = ` SELECT SUM(peso) as parcial
          FROM unidad_operativa, registro, requerimiento 
          WHERE estatus = "Vigente" and nombre_planta = ? AND 
          unidad_operativa.id_planta = registro.id_planta AND 
          registro.id_requerimiento = requerimiento.id_requerimiento`;

      const actualiza = `update unidad_operativa set porcentaje_cumplimiento=?  where nombre_planta=?;`;
      const actualizaurl = `UPDATE registro AS r
          JOIN unidad_operativa AS uo ON r.id_planta = uo.id_planta
          JOIN requerimiento AS req ON r.id_requerimiento = req.id_requerimiento
          SET r.url =?
          WHERE uo.nombre_planta = ?
            AND req.nombre_requerimiento = ?`;

      const [resultado] = await pool.query(quer, [nombre_planta]);
      const total = parseFloat(resultado[0].total);
      

      const [resultado2] = await pool.query(quer2, [nombre_planta]);
      const parcial = parseFloat(resultado2[0].parcial);

      let resul = ((parcial / total) * 100).toString();
      console.log("se envio la peticon");

      await pool.query(actualiza, [resul, nombre_planta]);
      console.log("Se actualizo el porcentaje de cumplimineto");

      await pool.query(actualizaurl, [
        pdfUrlsSinEspacios,
        nombre_planta,
        nombre_requerimiento,
      ]);

      res.status(200).json({ message: "Producto insertado" });
      console.log("insercion en la tabla de registro ",
      { nombre_planta,
        nombre_requerimiento,
        fechaAcomodada,
        fechaAcomodada2,
        estatus,
        observaciones,
        pdfUrlsSinEspacios,
        validez_unica
    });

    } else {
      res
        .status(404)
        .json({
          message:
            "verifica que la planta este registrada o ya existe la relacion entre permiso-planta ",
        });
    }
  } catch (exepcion) {
    console.log(exepcion);
    res.status(500).json({ message: "error interno" });
  }
};

//controlador para buscar por fecha especifica de inicio
controladorRegistro.buscarFechaDia = async (req, res) => {
  try {
    const fech = req.body.fechaIni;
    const fe = fech + "%";
    const [fechas] = await pool.query(
      "select * from registro where fecha_inicio like ?",
      [fe]
    );
    if (fechas != "") {
      res.json(fechas);
    } else {
      res.json(
        "Formato de fecha incorrecto o ingresaste un caracter no valido"
      );
    }
  } catch (Exception) {
    res.status(500).json("No se pudo conectar a la base de datos");
  }
};

//controlador para buscar mediante el año y el mes de inicio
controladorRegistro.buscarFechaAAMM = async (req, res) => {
  try {
    const ani = req.body.anio;
    const me = req.body.mes;
    const [fechaIni] = await pool.query(
      "select * from registro where month(fecha_inicio)=? and year(fecha_inicio) = ?",
      [me, ani]
    );
    if (fechaIni != "") {
      res.json(fechaIni);
    } else {
      res.json("Verifica que el año y mes esten bien escritos");
    }
  } catch (Excepcion) {
    res.status(500).json("No se pudo conectar a la base de datos");
  }
};

//controlador para buscar por anio de inicio
controladorRegistro.buscarFechaAnio = async (req, res) => {
  try {
    const anio = req.body.ani;
    const [fe] = await pool.query(
      "select * from registro where year(fecha_inicio) = ?",
      [anio]
    );
    if (fe.length >= 1) {
      res.json(fe);
    } else {
      res.join("No se encontro ningun dato que coinsida");
    }
  } catch (Excepcion) {
    res.status(500).join("No se pudo conectar a la base de datos");
  }
};

//controlador para buscar por fecha especificada de vencimiento
controladorRegistro.buscarFechaAnioT = async (req, res) => {
  try {
    const fech = req.body.fechaVen;
    if (fech != "") {
      const fecha = fech + "%";
      const [fechas] = await pool.query(
        "select * from registro where fecha_vencimiento like ?",
        [fecha]
      );
      if (fechas.length >= 1) {
        res.json(res.json(fechas));
      } else {
        res.join("No se encontro ningun registro con la fecha especificada");
      }
    } else {
      res.join("formato de fechas invalido");
    }
  } catch (Excepcion) {
    res.status(500).json({ message: "No se pudo conectar a la base de datos" });
  }
};

//controlador para buscar por año y mes de vencimiento
controladorRegistro.buscarFechaAAMMT = async (req, res) => {
  try {
    const ani = req.body.anio;
    const me = req.body.mes;
    const [fechaVen] = await pool.query(
      "select * from registro where month(fecha_vencimiento)=? and year(fecha_vencimiento) = ?;",
      [me, ani]
    );
    if (fechaVen.length >= 1) {
      res.json(fechaVen);
    } else {
      res.json("No se encontro un registro con este año y mes especificado");
    }
  } catch (Excepcion) {
    res.status(200).json({ message: "No se pudo conectar a la base de datos" });
  }
};

//controlador para registroos por año de vencimiento
controladorRegistro.buscarFechaAT = async (req, res) => {
  try {
    const ani = req.body.anio;
    const [fechaVen] = await pool.query(
      "select * from registro where year(fecha_vencimiento) = ?",
      [ani]
    );
    if (fechaVen.length >= 1) {
      res.json(fechaVen);
    } else {
      res.json("no se encontraron registros de este año");
    }
  } catch (Excepcion) {
    res.status(500).json({ message: "No se pudo conectar a la base de datos" });
  }
};

//controlador para buscar fechas por rangos vencimiento
controladorRegistro.buscarFechRango = async (req, res) => {
  try {
    const { fechIni, fechFin } = req.body;
    if (fechIni != "" && fechFin != "") {
      const feI = fechIni + "%";
      const feF = fechFin + "%";
      const [rang] = await pool.query(
        "select * from registro where fecha_vencimiento >= ? and fecha_vencimiento<=?",
        [feI, feF]
      );
      if (rang.length >= 1) {
        res.json(res.json(rang));
      } else {
        res.json("No se encontraron registros en este rango insertado");
      }
    } else {
      res.json("formato de fecha invalida");
    }
  } catch (Excepcion) {
    res.status(500).json({ message: "No se pudo conectar a la base de datos" });
  }
};

controladorRegistro.actualizarRegistro = async (req, res) => {
  const query = `
    UPDATE registro
    SET
      id_planta = IFNULL((SELECT id_planta FROM unidad_operativa WHERE nombre_planta = ?), id_planta),
      id_requerimiento = IFNULL((SELECT id_requerimiento FROM requerimiento WHERE nombre_requerimiento = ?), id_requerimiento),
      fecha_inicio = IFNULL(?, fecha_inicio),
      fecha_vencimiento = IFNULL(?, fecha_vencimiento),
      observaciones = IFNULL(?, observaciones),
      estatus = IFNULL(?, estatus),
      url = IFNULL(?, url),
      validez_unica = IFNULL(?, validez_unica)
    WHERE
      id_registro = ?; 
  `;

  const quer = `
  SELECT SUM(peso) as total
  FROM unidad_operativa, registro, requerimiento 
  WHERE nombre_planta = ? AND 
  unidad_operativa.id_planta = registro.id_planta AND 
  registro.id_requerimiento = requerimiento.id_requerimiento
`;

  const quer2 = ` SELECT SUM(peso) as parcial
FROM unidad_operativa, registro, requerimiento 
WHERE estatus = "Vigente" and nombre_planta = ? AND 
unidad_operativa.id_planta = registro.id_planta AND 
registro.id_requerimiento = requerimiento.id_requerimiento`;

const documentos= `INSERT INTO documentos (id_registro, nombre_planta, 
  nombre_requerimiento, url, fecha_inicio, fecha_vencimiento, impacto, zona,
  segmento, nombre_doc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` 


  let {
    id_registro,
    nombre_requerimiento,
    nombre_planta,
    fechaAcomodada2,
    estatus,
    observaciones,
    pdfUrls,
  } = req.body;
  let fechaAcomodada = moment().format("YYYY/MM/DD");
  
  let pdfUrlsSinEspacios; 
  let nombre_sinespacios ;


  try {
    if (fechaAcomodada2 == "Fecha inválida") {
      fechaAcomodada2 = null;
    }

    if (!req.files || !req.files.pdfFile) {
      pdfUrls = null;
      console.log(pdfUrls);
    } else {
      const pdfFile = req.files.pdfFile;
      const nombreOriginal = pdfFile.name;

      // Obtener la fecha y hora actual
      const fechaHoraActual = new Date();
      const formatoFechaHora = fechaHoraActual
        .toISOString()
        .replace(/[-:.T]/g, "");

      // Generar un nuevo nombre con la fecha y hora
      const nuevoNombre = `${nombreOriginal}_${formatoFechaHora}.pdf`;

      pdfUrls = `http://86.38.204.102:3200/api/regi/documento/${nuevoNombre}`;
      pdfUrlsSinEspacios = pdfUrls.replace(/\s+/g, '_');
      nombre_sinespacios=nuevoNombre.replace(/\s+/g, '_');
        console.log(pdfUrlsSinEspacios);
        console.log(nombre_sinespacios);

      if (!fs.existsSync("./recursos")) {
        fs.mkdirSync("./recursos");
      }

      const rutaArchivoOriginal = path.join(
        __dirname,
        "..",
        "../recursos",
        nombreOriginal
      );
      const rutaNuevoArchivo = path.join(__dirname, "..","../recursos", nombre_sinespacios);

      pdfFile.mv(rutaArchivoOriginal, (err) => {
        if (err) {
          console.log("Error al cargar el archivo");
          console.log(err);
          return res
            .status(500)
            .json({ message: "Error al cargar el archivo" });
        }

        // Renombrar el archivo
        fs.rename(rutaArchivoOriginal, rutaNuevoArchivo, (err) => {
          if (err) {
            console.log("Error al renombrar el archivo");
            console.log(err);
            return res
              .status(500)
              .json({ message: "Error al renombrar el archivo" });
          }
        });
      });
      const [rows] = await pool.query(`
      SELECT id_registro, impacto, zona, segmento
      FROM registro 
      JOIN unidad_operativa ON registro.id_planta = unidad_operativa.id_planta 
      JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento 
      WHERE nombre_planta = ? 
      AND nombre_requerimiento = ?`, [nombre_planta, nombre_requerimiento]);

      const id_registro = rows[0].id_registro;
      const impacto = rows[0].impacto;
      const zona = rows[0].zona;
      const segmento = rows[0].segmento;

      
      console.log(`Este es el ID del registro ${id_registro }`);

      await pool.query(documentos,[id_registro, nombre_planta, nombre_requerimiento,pdfUrlsSinEspacios, fechaAcomodada, fechaAcomodada2, impacto, zona,
        segmento, nombreOriginal])

        console.log("Se inserto en la tabla de documentos")
      
    }
    const val = req.body.validez_unica;
    const validez_unica = val === "true" ? true : false;

    const [registro] = await pool.query(
      `SELECT * FROM registro WHERE id_registro=?`,
      [id_registro]
    );

    if (registro.length > 0) {
      await pool.query(query, [
        nombre_planta,
        nombre_requerimiento,
        fechaAcomodada,
        fechaAcomodada2,
        observaciones,
        estatus,
        pdfUrlsSinEspacios,
        validez_unica,
        id_registro,
      ]);

      const actualiza = `update unidad_operativa set porcentaje_cumplimiento=? where nombre_planta=?;`;

      const [resultado] = await pool.query(quer, [nombre_planta]);
      const total = parseFloat(resultado[0].total);

      const [resultado2] = await pool.query(quer2, [nombre_planta]);
      const parcial = parseFloat(resultado2[0].parcial);

      let resul = ((parcial / total) * 100).toString();

      console.log(resul);

      await pool.query(actualiza, [resul, nombre_planta]);
      res.status(200).json({ message: "Se actualizo con exito" });
      console.log("SE Actualizo el registro");

      console.log(resultado);
      console.log(resultado2);
    } else {
      res.status(400).json({ error: "El registro no existe." });
    }
  } catch (excepcion) {
    console.error(excepcion);
    res
      .status(500)
      .json({ error: "Error al actualizar el registro en la base de datos." });
  }
};

controladorRegistro.documento= async(req,res)=>{
  const nombredoc= req.params.nombredoc;
  console.log('este es el docuemento')
  console.log(nombredoc)

  const ruta = path.join(__dirname,"..",'../recursos',nombredoc)
  console.log("esta es la ruta: "+ruta)

  if (fs.existsSync(ruta)) {
      res.sendFile(ruta, (err) => {
          if (err) {
              console.error(err);
              res.status(500).send('Error al enviar el documento');
          }
      });
  } else {
      res.status(404).send('Documento no encontrado');
      console.log("no se encontro nada")
      console.log(ruta)
  }
};

//controlador para actualizar los estados
controladorRegistro.actualizarEstado = async (req, res) => {
  try {
    const id = req.body.ide;
    const dato = req.body.estado;
    const [aviso] = await pool.query(
      "update registro set estatus = ifNULL(?,estatus) where id_registro=?",
      [dato, id]
    );
    if (aviso.affectedRows >= 1) {
      res.json("Estado del registro actaulizado correctamente");
    } else {
      res.json("No se pudo actualizar el estado");
    }
  } catch (Exception) {
    res
      .status(500)
      .json({
        message:
          "verifica no haber metido un caracter especial o tener conexion a la base de datos",
      });
  }
};

controladorRegistro.graficatotal = async (req, res) => {
  const segmento = req.body.segmento;
  let nacional = `SELECT
  uo.nombre_planta AS UnidadOperativa, porcentaje_cumplimiento,
  COUNT(CASE WHEN req.impacto = 'Multa' and uo.activo=1  and r.estatus!='Vigente' and r.estatus!='No Aplica' THEN 1 END) AS Multas,
  COUNT(CASE WHEN req.impacto = 'Clausura Total' and uo.activo=1 and r.estatus!='Vigente' and r.estatus!='No Aplica' THEN 1 END) AS Clausuras,
  COUNT(CASE WHEN req.impacto = 'Administrativo' and uo.activo=1 and r.estatus!='Vigente' and r.estatus!='No Aplica' THEN 1 END) AS Administrativos
FROM unidad_operativa uo
JOIN registro r ON uo.id_planta = r.id_planta
JOIN requerimiento req ON r.id_requerimiento = req.id_requerimiento
where segmento=? and activo = 1
GROUP BY uo.nombre_planta, uo.porcentaje_cumplimiento ; `;

  let centro = `SELECT
  uo.nombre_planta AS UnidadOperativa, porcentaje_cumplimiento,
  COUNT(CASE WHEN req.impacto = 'Multa' and uo.activo=1  and r.estatus!='Vigente' and r.estatus!='No Aplica' THEN 1 END) AS Multas,
  COUNT(CASE WHEN req.impacto = 'Clausura Total' and uo.activo=1 and r.estatus!='Vigente' and r.estatus!='No Aplica' THEN 1 END) AS Clausuras,
  COUNT(CASE WHEN req.impacto = 'Administrativo' and uo.activo=1 and r.estatus!='Vigente' and r.estatus!='No Aplica' THEN 1 END) AS Administrativos
FROM unidad_operativa uo
JOIN registro r ON uo.id_planta = r.id_planta
JOIN requerimiento req ON r.id_requerimiento = req.id_requerimiento
where zona ='Centro' and activo = 1 and segmento=?
GROUP BY uo.nombre_planta, uo.porcentaje_cumplimiento`;

  let noreste = `SELECT
  uo.nombre_planta AS UnidadOperativa, porcentaje_cumplimiento,
  COUNT(CASE WHEN req.impacto = 'Multa' and uo.activo=1  and r.estatus!='Vigente' and r.estatus!='No Aplica' THEN 1 END) AS Multas,
  COUNT(CASE WHEN req.impacto = 'Clausura Total' and uo.activo=1 and r.estatus!='Vigente' and r.estatus!='No Aplica' THEN 1 END) AS Clausuras,
  COUNT(CASE WHEN req.impacto = 'Administrativo' and uo.activo=1 and r.estatus!='Vigente' and r.estatus!='No Aplica' THEN 1 END) AS Administrativos
FROM unidad_operativa uo
JOIN registro r ON uo.id_planta = r.id_planta
JOIN requerimiento req ON r.id_requerimiento = req.id_requerimiento
where zona ='Noreste' and activo = 1 and segmento=?
GROUP BY uo.nombre_planta, uo.porcentaje_cumplimiento ; `;

  let Pasifico = `SELECT
uo.nombre_planta AS UnidadOperativa, porcentaje_cumplimiento,
COUNT(CASE WHEN req.impacto = 'Multa' and uo.activo=1  and r.estatus!='Vigente' and r.estatus!='No Aplica' THEN 1 END) AS Multas,
COUNT(CASE WHEN req.impacto = 'Clausura Total' and uo.activo=1 and r.estatus!='Vigente' and r.estatus!='No Aplica' THEN 1 END) AS Clausuras,
COUNT(CASE WHEN req.impacto = 'Administrativo' and uo.activo=1 and r.estatus!='Vigente' and r.estatus!='No Aplica' THEN 1 END) AS Administrativos
FROM unidad_operativa uo
JOIN registro r ON uo.id_planta = r.id_planta
JOIN requerimiento req ON r.id_requerimiento = req.id_requerimiento
where zona ='Pacifico' and activo = 1 and segmento=?
GROUP BY uo.nombre_planta, uo.porcentaje_cumplimiento ; `;

  let sureste = `SELECT
uo.nombre_planta AS UnidadOperativa, porcentaje_cumplimiento,
COUNT(CASE WHEN req.impacto = 'Multa' and uo.activo=1  and r.estatus!='Vigente' and r.estatus!='No Aplica' THEN 1 END) AS Multas,
COUNT(CASE WHEN req.impacto = 'Clausura Total ' and uo.activo=1 and r.estatus!='Vigente' and r.estatus!='No Aplica' THEN 1 END) AS Clausuras,
COUNT(CASE WHEN req.impacto = 'Administrativo' and uo.activo=1 and r.estatus!='Vigente' and r.estatus!='No Aplica' THEN 1 END) AS Administrativos
FROM unidad_operativa uo
JOIN registro r ON uo.id_planta = r.id_planta
JOIN requerimiento req ON r.id_requerimiento = req.id_requerimiento
where zona ='Sureste' and activo = 1 and segmento=?
GROUP BY uo.nombre_planta ,uo.porcentaje_cumplimiento ; `;

  console.log("despues de esta linia sigue el segemnto resivido");
  console.log(segmento, "Este es el segmento");

  let clausuradasnas = [];
  let multasnas = [];
  let administrativasnas = [];
  let optimasnas = [];
  let ignoradasnas =[];


  let clausuradascen = [];
  let multascen = [];
  let administrativascen = [];
  let optimascen = [];
  let ignoradascen=[]

  let clausuradasnor = [];
  let multasnor = [];
  let administrativasnor = [];
  let optimasnor = [];
  let ignoradasnor=[];

  let clausuradaspas = [];
  let multaspas = [];
  let administrativaspas = [];
  let optimaspas = [];
  let ignoradasnpas=[];

  let clausuradassur = [];
  let multassur = [];
  let administrativassur = [];
  let optimassur = [];
  let ignoradassur=[];

  let [resultados] = await pool.query(nacional, [segmento]);

  for (let i = 0; i < resultados.length; i++) {
    if (resultados[i].Clausuras >= 1) {
      clausuradasnas.push(resultados[i]);

    } else if (resultados[i].Clausuras === 0 && resultados[i].Multas >= 1) {
     multasnas.push(resultados[i])
    } else if (
      resultados[i].Clausuras === 0 &&
      resultados[i].Multas === 0 &&
      resultados[i].Administrativos >= 1
    ) {
      optimasnas.push(resultados[i]);
    } else if (resultados[i].porcentaje_cumplimiento >= 100) {
      optimasnas.push(resultados[i]);
    }else {
      optimasnas.push(resultados[i]);
      
    }
  }

  let [resultadoscen] = await pool.query(centro, [segmento]);
  for (let i = 0; i < resultadoscen.length; i++) {
    if (resultadoscen[i].Clausuras >= 1) {
      // console.log(resultadoscen[i].UnidadOperativa + " ....... Clausuradas");
      clausuradascen.push(resultadoscen[i]);
    } else if (
      resultadoscen[i].Clausuras === 0 &&
      resultadoscen[i].Multas >= 1
    ) {
      // console.log(resultadoscen[i].UnidadOperativa + " ....... Multado");
      multascen.push(resultadoscen[i]);
    } else if (
      resultadoscen[i].Clausuras === 0 &&
      resultadoscen[i].Multas === 0 &&
      resultadoscen[i].Administrativos >= 1
    ) {
      // console.log(resultadoscen[i].UnidadOperativa + " ......... Administrativos");
      optimascen.push(resultadoscen[i]);
    } else if (resultadoscen[i].porcentaje_cumplimiento >= 100) {
      // console.log(resultadoscen[i].UnidadOperativa + " ......... Libres");
      optimascen.push(resultadoscen[i]);
    }else{
      optimascen.push(resultadoscen[i]);
    }
  }

  let [resultadosnor] = await pool.query(noreste, [segmento]);
  for (let i = 0; i < resultadosnor.length; i++) {
    if (resultadosnor[i].Clausuras >= 1) {
      clausuradasnor.push(resultadosnor[i]);
    } else if (
      resultadosnor[i].Clausuras === 0 &&
      resultadosnor[i].Multas >= 1
    ) {
      multasnor.push(resultadosnor[i]);
    } else if (
      resultadosnor[i].Clausuras === 0 &&
      resultadosnor[i].Multas === 0 &&
      resultadosnor[i].Administrativos >= 1
    ) {
      optimasnor.push(resultadosnor[i]);
    } else if (resultadosnor[i].porcentaje_cumplimiento >= 100) {
      optimasnor.push(resultadosnor[i]);
    }else{
      optimasnor.push(resultadosnor[i]);
    }
  }

  console.log("");

  let [resultadospas] = await pool.query(Pasifico, [segmento]);
  for (let i = 0; i < resultadospas.length; i++) {
    if (resultadospas[i].Clausuras >= 1) {
      clausuradaspas.push(resultadospas[i]);
    } else if (
      resultadospas[i].Clausuras === 0 &&
      resultadospas[i].Multas >= 1
    ) {
      multaspas.push(resultadospas[i]);
    } else if (
      resultadospas[i].Clausuras === 0 &&
      resultadospas[i].Multas === 0 &&
      resultadospas[i].Administrativos >= 1
    ) {
      optimaspas.push(resultadospas[i]);
    } else if (resultadospas[i].porcentaje_cumplimiento >= 100) {
      optimaspas.push(resultadospas[i]);
    }else{
      optimaspas.push(resultadospas[i]);
    }

  }

  let [resultadossur] = await pool.query(sureste, [segmento]);
  for (let i = 0; i < resultadossur.length; i++) {
    if (resultadossur[i].Clausuras >= 1) {
      clausuradassur.push(resultadossur[i]);
    } else if (
      resultadossur[i].Clausuras === 0 &&
      resultadossur[i].Multas >= 1
    ) {
      multassur.push(resultadossur[i]);
    } else if (
      resultadossur[i].Clausuras === 0 &&
      resultadossur[i].Multas === 0 &&
      resultadossur[i].Administrativos >= 1
    ) {
      optimassur.push(resultadossur[i]);
    } else if (resultadossur[i].porcentaje_cumplimiento >= 100) {
      optimassur.push(resultadossur[i]);
    }else{
      optimassur.push(resultadossur[i]);
    }
  }

  console.log(" Estos son los resultados de la consulta sql");

  clausuradasnas = clausuradasnas.length;
  multasnas = multasnas.length;
  administrativasnas = administrativasnas.length;
  optimasnas = optimasnas.length;

  clausuradascen = clausuradascen.length;
  multascen = multascen.length;
  administrativascen = administrativascen.length;
  optimascen = optimascen.length;

  clausuradasnor = clausuradasnor.length;
  multasnor = multasnor.length;
  administrativasnor = administrativasnor.length;
  optimasnor = optimasnor.length;

  administrativaspas = administrativaspas.length;
  clausuradaspas = clausuradaspas.length;
  multaspas = multaspas.length;
  optimaspas = optimaspas.length;

  administrativassur = administrativassur.length;
  clausuradassur = clausuradassur.length;
  multaspassur = multassur.length;
  optimaspassur = optimassur.length;

  const nas = {
    zona: "grafica_total",
    clausuradasnas,
    multasnas,
    administrativasnas,
    optimasnas,
  };

  const cen = {
    zona: "grafica_cen",
    clausuradascen,
    multascen,
    administrativascen,
    optimascen,
  };

  const nor = {
    zona: "Grafica_nor",
    clausuradasnor,
    multasnor,
    administrativasnor,
    optimasnor,
  };

  const pas = {
    zona: "Grafica_pas",
    clausuradaspas,
    multaspas,
    administrativaspas,
    optimaspas,
  };

  const sur = {
    zona: "Grafica_sur",
    administrativassur,
    clausuradassur,
    multaspassur,
    optimaspassur,
  };

  const jeison = [nas, cen, nor, pas, sur];
  console.log(jeison);

  res.json(jeison);
};
controladorRegistro.administrativas = async (req, res) => {
  const segmento = req.body.segmento;

  let nacional1 = `select  distinct nombre_planta,segmento,zona,estatus
  from unidad_operativa join registro on unidad_operativa.id_planta = registro.id_planta join requerimiento on requerimiento.id_requerimiento =registro.id_requerimiento
  where estatus ='No Tramitable' and segmento= ? AND activo =1; `;

  let conzon = `select  distinct nombre_planta,segmento,zona,estatus
  from unidad_operativa join registro on unidad_operativa.id_planta = registro.id_planta join requerimiento on requerimiento.id_requerimiento =registro.id_requerimiento
  where estatus ='No Tramitable' and segmento= ? and zona = ? AND activo =1`;

 

  console.log("despues de esta linia sigue el segemnto resivido");
  console.log(segmento, "Este es el segmento");
 
  let zonas=['Noreste','Centro','Pacifico','Sureste']
  


  let nacional =[];


  let [resultnas] = await pool.query(nacional1,[segmento])

    for(let i =0 ; i<resultnas.length;i++){
      if (resultnas[i].estatus==='No Tramitable'){
        nacional.push(resultnas[i])
      }
    } 
  let [norte]= await pool.query(conzon,[segmento,zonas[0]])
  let [centro]= await pool.query(conzon,[segmento,zonas[1]])
  let [pacifico]= await pool.query(conzon,[segmento,zonas[2]])
  let [sur]= await pool.query(conzon,[segmento,zonas[3]])
  
  norte = norte.length;
  centro = centro.length;
  pacifico = pacifico.length;
  sur = sur.length;
  nacional = nacional.length;

  const nas = {
    zona: "grafica_total",
    nacional,
    norte,
    centro,
    pacifico,
    sur,
   
  };


  const jeison=[nas]
  console.log(jeison)
  res.json(jeison)
};

const obtenerEstadisticas = async (consulta) => {
  const [resultados] = await pool.query(consulta);
  const estadisticas = {
    clausuradas: 0,
    multas: 0,
    administrativas: 0,
    optimas: 0,
  };

  for (const resultado of resultados) {
    if (
      resultado.Clausuras === 1 &&
      (resultado.Multas === 0 || resultado.Multas === 1) &&
      (resultado.Administrativos === 1 || resultado.Administrativos === 0)
    ) {
      estadisticas.clausuradas++;
    } else if (
      resultado.Clausuras === 0 &&
      resultado.Multas === 1 &&
      (resultado.Administrativos === 0 || resultado.Administrativos === 1)
    ) {
      estadisticas.multas++;
    } else if (
      resultado.Clausuras === 0 &&
      resultado.Multas === 0 &&
      resultado.Administrativos === 1
    ) {
      estadisticas.administrativas++;
    } else {
      estadisticas.optimas++;
    }
  }

  return estadisticas;
};

const obtenerYProcesarEstadisticas = async (consulta, zona) => {
  const estadisticas = await obtenerEstadisticas(consulta);
  return {
    zona,
    clausuradas: estadisticas.clausuradas,
    multas: estadisticas.multas,
    administrativas: estadisticas.administrativas,
    optimas: estadisticas.optimas,
  };
};

controladorRegistro.Graficatotal = async (req, res) => {
  const nacional = `SELECT
    uo.nombre_planta AS UnidadOperativa,
    COUNT(CASE WHEN req.impacto = 'Multa' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Multas,
    COUNT(CASE WHEN req.impacto = 'Clausura' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Clausuras,
    COUNT(CASE WHEN req.impacto = 'Administrativo' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Administrativos
  FROM unidad_operativa uo
  JOIN registro r ON uo.id_planta = r.id_planta
  JOIN requerimiento req ON r.id_requerimiento = req.id_requerimiento
  GROUP BY uo.nombre_planta; `;

  const centro = `SELECT
    uo.nombre_planta AS UnidadOperativa,
    COUNT(CASE WHEN req.impacto = 'Multa' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Multas,
    COUNT(CASE WHEN req.impacto = 'Clausura' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Clausuras,
    COUNT(CASE WHEN req.impacto = 'Administrativo' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Administrativos
  FROM unidad_operativa uo
  JOIN registro r ON uo.id_planta = r.id_planta
  JOIN requerimiento req ON r.id_requerimiento = req.id_requerimiento
  WHERE zona = 'Centro'
  GROUP BY uo.nombre_planta; `;

  const noreste = `SELECT
    uo.nombre_planta AS UnidadOperativa,
    COUNT(CASE WHEN req.impacto = 'Multa' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Multas,
    COUNT(CASE WHEN req.impacto = 'Clausura' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Clausuras,
    COUNT(CASE WHEN req.impacto = 'Administrativo' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Administrativos
  FROM unidad_operativa uo
  JOIN registro r ON uo.id_planta = r.id_planta
  JOIN requerimiento req ON r.id_requerimiento = req.id_requerimiento
  WHERE zona = 'Noreste'
  GROUP BY uo.nombre_planta; `;

  const Pasifico = `SELECT
    uo.nombre_planta AS UnidadOperativa,
    COUNT(CASE WHEN req.impacto = 'Multa' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Multas,
    COUNT(CASE WHEN req.impacto = 'Clausura' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Clausuras,
    COUNT(CASE WHEN req.impacto = 'Administrativo' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Administrativos
  FROM unidad_operativa uo
  JOIN registro r ON uo.id_planta = r.id_planta
  JOIN requerimiento req ON r.id_requerimiento = req.id_requerimiento
  WHERE zona = 'Pacífico'
  GROUP BY uo.nombre_planta;`;

  const sureste = `SELECT
    uo.nombre_planta AS UnidadOperativa,
    COUNT(CASE WHEN req.impacto = 'Multa' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Multas,
    COUNT(CASE WHEN req.impacto = 'Clausura' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Clausuras,
    COUNT(CASE WHEN req.impacto = 'Administrativo' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Administrativos
  FROM unidad_operativa uo
  JOIN registro r ON uo.id_planta = r.id_planta
  JOIN requerimiento req ON r.id_requerimiento = req.id_requerimiento
  WHERE zona = 'Sureste'
  GROUP BY uo.nombre_planta; `;

  const estadisticasNas = await obtenerYProcesarEstadisticas(
    nacional,
    "grafica_total"
  );
  const estadisticasCen = await obtenerYProcesarEstadisticas(
    centro,
    "grafica_cen"
  );
  const estadisticasNor = await obtenerYProcesarEstadisticas(
    noreste,
    "Grafica_nor"
  );
  const estadisticasPas = await obtenerYProcesarEstadisticas(
    Pasifico,
    "Grafica_pas"
  );
  const estadisticasSur = await obtenerYProcesarEstadisticas(
    sureste,
    "Grafica_sur"
  );

  const jeison = [
    estadisticasNas,
    estadisticasCen,
    estadisticasNor,
    estadisticasPas,
    estadisticasSur,
  ];
  res.json(jeison);
};

module.exports = controladorRegistro;
