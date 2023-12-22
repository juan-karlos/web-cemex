const { json, text } = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const pool = require("../database");
const fs = require("fs");
const { url } = require("inspector");

const controladorRegistro = {};


// controller para elegir el registro para actualizarlo
 
controladorRegistro.obtenerUnRegi=async(req,res)=>{
  const registro =({id_requerimiento:req.params.cb})
  id=JSON.stringify(registro);
  const recid=/(\d+)/g;
  const idrecu= id.match(recid);
   try{
    const [permiso]=await pool.query(`SELECT id_registro,nombre_requerimiento,nombre_planta,fecha_inicio,fecha_vencimiento,observaciones,estatus,url,validez_unica
    FROM registro,unidad_operativa,requerimiento
    where unidad_operativa.id_planta=registro.id_planta and requerimiento.id_requerimiento = registro.id_requerimiento and registro.id_registro=?`,[idrecu])
    res.json(permiso)
   }catch(error){
    console.log(error)
    res.status(500).json({message:"error en el servidor"})
   }
}




//controlador que trae todos los registros
controladorRegistro.obtenerRegistro = async (req, res) => {
  try {
    const [registros] = await pool.query(`SELECT id_registro,nombre_requerimiento,nombre_planta,fecha_inicio,fecha_vencimiento,observaciones,estatus,url,validez_unica
    FROM registro,unidad_operativa,requerimiento
    where unidad_operativa.id_planta=registro.id_planta and requerimiento.id_requerimiento = registro.id_requerimiento
     `);
    res.json(registros);
  } catch (Excepcion) {
    console.log(Excepcion)
    res.status(500).json({message:"hay un error en el systema intente mas tarde"})
  }
  /*
  nombre_requerimiento,
  nombre_planta,
  fecha_inicio,
  fecha_vencimiento,
  observaciones,
  url,
  validez_unica
  */ 

};

// Controlador para cargar el archivo PDF y agregar un nuevo registro
controladorRegistro.insertarPdf = async (req, res) => {


const sqlQuery=
`INSERT INTO registro (id_planta, id_requerimiento, fecha_inicio, fecha_vencimiento, observaciones, estatus, url, validez_unica)
SELECT uo.id_planta, req.id_requerimiento, ?, ?, ?, ?, ?, ?
FROM unidad_operativa AS uo
JOIN requerimiento AS req ON uo.nombre_planta = ? AND req.nombre_requerimiento = ?
WHERE (uo.id_planta, req.id_requerimiento) NOT IN (SELECT id_planta, id_requerimiento FROM registro);`



  // Verifica si se envió un archivo PDF
  console.log("se resivio la peticion")

  let {
    nombre_requerimiento,
    nombre_planta,
    fechaAcomodada,
    fechaAcomodada2,
    estatus,
    observaciones,
    pdfUrls
  } = req.body;

  if(fechaAcomodada && fechaAcomodada2== 'Fecha inválida'){
    fechaAcomodada=null,
    fechaAcomodada2=null
  } 
  
  if (!req.files || !req.files.pdfFile) {
    pdfUrls=null
    // console.log(pdfUrls)
  }else{

      const pdfFile = req.files.pdfFile;
      const nomarchi = pdfFile.name;

       pdfUrls = `http://localhost:3200/recursos/${nomarchi}`;
      console.log(pdfUrls)

  if (!fs.existsSync("./src/recursos")) {
    fs.mkdirSync("./src/recursos");
   }
  
      pdfFile.mv(path.join(__dirname, "../recursos", nomarchi), (err) => {
        if (err) {
          console.log("truena aqui");
          console.log(err);
          return res.status(500).json({ message: "{Error al cargar el archivo}" });
        }
      });
  
  }

  const val=req.body.validez_unica
  const validez_unica=val==="true"? true:false;


   // if(existe ==""){
  // Construye la URL del PDF
  // const pdfUrls = `http://localhost:3200/recursos/${nomarchi}`;

  try{
    
  // await pool.query('INSERT INTO registro (id_requerimiento,id_planta,fecha_inicio,fecha_vencimiento,observaciones,estatus,url,validez_unica) VALUES (?,?,?,?,?,?,?,?)',[id_requerimiento,id_planta,fechaAcomodada,fechaAcomodada2,observaciones,estatus,pdfUrls,validez_unica])
  // console.log(pdfUrls)

  

      const [afectaciones] =await pool.execute(sqlQuery,[fechaAcomodada,fechaAcomodada2,observaciones,estatus,pdfUrls,validez_unica,nombre_planta,nombre_requerimiento])

      if(afectaciones.affectedRows>0){
    

          const quer = `
              SELECT SUM(peso) as total
              FROM unidad_operativa, registro, requerimiento 
              WHERE nombre_planta = ? AND 
              unidad_operativa.id_planta = registro.id_planta AND 
              registro.id_requerimiento = requerimiento.id_requerimiento
          `;
  
          const quer2= ` SELECT SUM(peso) as parcial
          FROM unidad_operativa, registro, requerimiento 
          WHERE estatus = "Vigente" and nombre_planta = ? AND 
          unidad_operativa.id_planta = registro.id_planta AND 
          registro.id_requerimiento = requerimiento.id_requerimiento`;
  
          const actualiza=`update unidad_operativa set porcentaje_cumplimiento=? where nombre_planta=?;`
          
          
              const [resultado] = await pool.query(quer, [nombre_planta]);
              const total= parseFloat(resultado[0].total)
  
              const [resultado2]= await pool.query(quer2,[nombre_planta]);
              const parcial=parseFloat(resultado2[0].parcial)
  
              let resul= (parcial/total*100).toString();
              console.log("se envio la peticon")
  
              await pool.query(actualiza,[resul,nombre_planta])
              console.log(resul)
  
        res.status(200).json({message:'{"Estatus":"Producto insertado"}'})
        console.log(nombre_planta,nombre_requerimiento,fechaAcomodada,fechaAcomodada2,estatus,observaciones,pdfUrls,validez_unica)
      }else{
        res.status(404).json({message:"verifica que la planta este registrada o ya existe la relacion entre permiso-planta "})
      }
  }catch(exepcion){
    console.log(exepcion)
  res.status(500).json({message:"error interno"})
  }


  // }else{
  //   res.status(500).json({message:"ya existe un registro con esos datos"})
  // }

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
    res.status(500).json({message:"No se pudo conectar a la base de datos"});
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
    res.status(200).json({message:"No se pudo conectar a la base de datos"});
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
    res.status(500).json({message:"No se pudo conectar a la base de datos"});
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
    res.status(500).json({message:"No se pudo conectar a la base de datos"});
  }
};




//controlador de registros para actualizar registros
// controladorRegistro.actualizarRegistro = async (req, res) => {
//   const qery=`UPDATE registro
//   SET id_planta = uo.id_planta,
//       id_requerimiento = req.id_requerimiento,
//       fecha_inicio =ifNULL(?,fecha_inicio),
//       fecha_vencimiento =ifNULL(?,fecha_vencimiento) ,
//       observaciones = ifNULL(?,observaciones),
//       estatus = ifNULL(?,estatus),
//       url = ifNULL(?,url),
//       validez_unica = ifNULL(?,validez_unica)
//   FROM unidad_operativa AS uo
//   JOIN requerimiento AS req ON uo.nombre_planta = ? AND req.nombre_requerimiento = ?
//   WHERE (uo.id_planta, req.id_requerimiento) NOT IN (SELECT id_planta, id_requerimiento FROM registro);`;

//   let {
//     id_registro,
//     nombre_requerimiento,
//     nombre_planta,
//     fecha1,
//     fecha2,
//     estatus,
//     observaciones,
//     pdfUrls
//   } = req.body;


  
// //  if(fechaAcomodada && fechaAcomodada2== 'Fecha inválida'){
// //     fechaAcomodada=null,
// //     fechaAcomodada2=null
// //   } 


//   // if (!req.files || !req.files.pdfFile) {
//   //   pdfUrls=null
//   //   console.log(pdfUrls)
//   // }else{

//   //     const pdfFile = req.files.pdfFile;
//   //     const nomarchi = pdfFile.name;
//   //      pdfUrls = `http://localhost:3200/recursos/${nomarchi}`;
//   //     console.log(pdfUrls)

//   // if (!fs.existsSync("./src/recursos")) {
//   //   fs.mkdirSync("./src/recursos");
//   //  }
  
//   //     pdfFile.mv(path.join(__dirname, "../recursos", nomarchi), (err) => {
//   //       if (err) {
//   //         console.log("truena aqui");
//   //         console.log(err);
//   //         return res.status(500).json({ message: "{Error al cargar el archivo}" });
//   //       }
//   //     });
//   // }




//   const val=req.body.validez_unica
//   const validez_unica=val==="true"? true:false;

// console.log(id_registro,
//   nombre_requerimiento,
//   nombre_planta,
//   fecha1,
//   fecha2,
//   estatus,
//   observaciones,
//   pdfUrls,
//   validez_unica
//   )

//   try {
//     console.log("llega aqui")
//     const [registro]= await pool.query(`SELECT * FROM registro where id_registro=?`,[id_registro])
//     if(registro==""){
//       console.log("llega hasta aqui")
//       await pool.execute(qery, [fecha1, fecha2, observaciones, estatus, pdfUrls,validez_unica,nombre_planta,nombre_requerimiento /* Aquí deberías proporcionar los valores que faltan, como la planta y el requerimiento */]);
//       const [regis]= await pool.query(`SELECT * FROM registro where id_registro=?`,[id_registro])
//      res.json(regis)
   
//  }




//     // const [rows] = await pool.query(
//     //   "UPDATE registro set id_requerimiento=ifNULL(?,id_requerimiento), id_planta=ifNULL(?,id_planta), fecha_inicio=ifNULL(?,fecha_inicio), fecha_vencimiento=ifNULL(?,fecha_vencimiento), observaciones=ifNULL(?,observaciones), Estatus=ifNULL(?,Estatus), url=ifNULL(?,url), validez_unica=ifNULL(?,validez_unica) where id_registro = ?",
//     //   [
//     //     id_requerimiento,
//     //     id_planta,
//     //     fecha_inicio,
//     //     fecha_vencimiento,
//     //     observaciones,
//     //     Estatus,
//     //     url,
//     //     validez_unica,
//     //     id_registro,
//     //   ]
//     // );


//     // if (rows.affectedRows > 0) {
//     //   res.json("actualizacion realizada con exito");
//     // } else {
//     //   res.json("verifique si existe el registro en la base de datos");
//     // }

// // res.json(registro);
    
//     // console.log(nombre_requerimiento,
//     //   nombre_planta,
//     //   fecha1,
//     //   fecha2,
//     //   estatus,
//     //   observaciones,
//     //   pdfUrls)
//     //  res.json(registro)
      
//   } catch (Excepcion) {
//     console.log(Excepcion)
//     res.json("No se pudo conectar a la base de datos");
//   }
// };



controladorRegistro.actualizarRegistro = async (req, res) => {
  const query = `
    UPDATE registro
    SET
      id_planta = IFNULL((SELECT id_planta FROM Unidad_Operativa WHERE nombre_planta = ?), id_planta),
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

const quer2= ` SELECT SUM(peso) as parcial
FROM unidad_operativa, registro, requerimiento 
WHERE estatus = "Vigente" and nombre_planta = ? AND 
unidad_operativa.id_planta = registro.id_planta AND 
registro.id_requerimiento = requerimiento.id_requerimiento`;

  let {
    id_registro,
    nombre_requerimiento,
    nombre_planta,
    fechaAcomodada,
    fechaAcomodada2,
    estatus,
    observaciones,
    pdfUrls
  } = req.body;
  try {
  if(fechaAcomodada && fechaAcomodada2== 'Fecha inválida'){
    fechaAcomodada=null,
    fechaAcomodada2=null
  } 

  if (!req.files || !req.files.pdfFile) {
    pdfUrls=null
    console.log(pdfUrls)
  }else{

      const pdfFile = req.files.pdfFile;
      const nomarchi = pdfFile.name;
       pdfUrls = `http://localhost:3200/recursos/${nomarchi}`;
      console.log(pdfUrls)

  if (!fs.existsSync("./src/recursos")) {
    fs.mkdirSync("./src/recursos");
   }
      pdfFile.mv(path.join(__dirname, "../recursos", nomarchi), (err) => {
        if (err) {
          console.log("truena aqui");
          console.log(err);
          return res.status(500).json({ message: "{Error al cargar el archivo}" });
        }
      });
  
  }
  const val = req.body.validez_unica;
  const validez_unica = val === "true" ? true : false;

 
    const [registro] = await pool.query(`SELECT * FROM registro WHERE id_registro=?`, [id_registro]);
    // console.log(registro);

    if (registro.length > 0) {
      await pool.query(query, [nombre_planta, nombre_requerimiento,  fechaAcomodada,fechaAcomodada2, observaciones, estatus, pdfUrls, validez_unica, id_registro]);
       

        const actualiza=`update unidad_operativa set porcentaje_cumplimiento=? where nombre_planta=?;`
        
            const [resultado] = await pool.query(quer, [nombre_planta]);
            const total= parseFloat(resultado[0].total)

            const [resultado2]= await pool.query(quer2,[nombre_planta]);
            const parcial=parseFloat(resultado2[0].parcial)

            let resul= (parcial/total*100).toString();

            console.log(resul)

            await pool.query(actualiza,[resul,nombre_planta])

      const [regis] = await pool.query(`SELECT * FROM registro WHERE id_registro=?`, [id_registro]);
      res.json(regis);
      console.log("SE Actualizo el registro")

      console.log(resultado)
      console.log(resultado2)
    } else {
      res.status(400).json({ error: "El registro no existe." });
    }
  } catch (excepcion) {
    console.error(excepcion);
    res.status(500).json({ error: "Error al actualizar el registro en la base de datos." });
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
    res.status(500).json({message:
      "verifica no haber metido un caracter especial o tener conexion a la base de datos"
  });
  }
};


// controladorRegistro.grafica = async (req, res) => {

//   // Clausura: rojo 
//   // Multa: amarillo
//   // Administrativo: gris 
//   // Si no tiene nada: verde 

//   const consulta = `SELECT
//     uo.nombre_planta AS UnidadOperativa,
//     COUNT(CASE WHEN req.impacto = 'Multa' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Multas,
//     COUNT(CASE WHEN req.impacto = 'Clausura' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Clausuras,
//     COUNT(CASE WHEN req.impacto = 'Administrativo' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Administrativos
//   FROM unidad_operativa uo
//   JOIN registro r ON uo.id_planta = r.id_planta
//   JOIN requerimiento req ON r.id_requerimiento = req.id_requerimiento
//   GROUP BY uo.nombre_planta; `;

//   let clausuradas = [];
//   let multas = [];
//   let administrativas = [];
//   let optimas = [];

//   const [resultados] = await pool.query(consulta);

//   for (let i = 0; i < resultados.length; i++) {
//     if (
//       (resultados[i].Clausuras === 1) &&
//       (resultados[i].Multas === 0 || resultados[i].Multas === 1)&&
//       (resultados[i].Administrativos === 1 || resultados[i].Administrativos===0)
//     ) {
//       console.log(resultados[i].UnidadOperativa + " ....... Clausuradas");
//       clausuradas.push(resultados)


//     } else 
//     if (
//       (resultados[i].Clausuras === 0 )&&
//       (resultados[i].Multas === 1 )&&
//       (resultados[i].Administrativos === 0 || resultados[i].Administrativos === 1)
//     ) {
//       console.log(resultados[i].UnidadOperativa + " ....... Multado");
//       multas.push(resultados)

//     } else if (
//       (resultados[i].Clausuras === 0) &&
//       (resultados[i].Multas === 0) &&
//       (resultados[i].Administrativos === 1)
//     ) {
//       console.log(resultados[i].UnidadOperativa + " ......... Administrativos");
//       administrativas.push(resultados)
//     } else {
//       console.log(resultados[i].UnidadOperativa + " ......... Libres");
//       optimas.push(resultados)
//     }
//   }
//   const res = {
//     clausuradas,
//     multas,
//     administrativas,
//     optimas
//   }
//   res.json(res)
// };
controladorRegistro.graficatotal = async (req, res) => {

  // Clausura: rojo 
  // Multa: amarillo
  // Administrativo: gris 
  // Si no tiene nada: verde 

  let nacional = `SELECT
    uo.nombre_planta AS UnidadOperativa,
    COUNT(CASE WHEN req.impacto = 'Multa' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Multas,
    COUNT(CASE WHEN req.impacto = 'Clausura' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Clausuras,
    COUNT(CASE WHEN req.impacto = 'Administrativo' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Administrativos
  FROM unidad_operativa uo
  JOIN registro r ON uo.id_planta = r.id_planta
  JOIN requerimiento req ON r.id_requerimiento = req.id_requerimiento
  GROUP BY uo.nombre_planta; `;

  
  let centro = `SELECT
    uo.nombre_planta AS UnidadOperativa,
    COUNT(CASE WHEN req.impacto = 'Multa' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Multas,
    COUNT(CASE WHEN req.impacto = 'Clausura' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Clausuras,
    COUNT(CASE WHEN req.impacto = 'Administrativo' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Administrativos
  FROM unidad_operativa uo
  JOIN registro r ON uo.id_planta = r.id_planta
  JOIN requerimiento req ON r.id_requerimiento = req.id_requerimiento
  WHERE zona = 'Centro'
  GROUP BY uo.nombre_planta; `;

  let noreste = `SELECT
  uo.nombre_planta AS UnidadOperativa,
  COUNT(CASE WHEN req.impacto = 'Multa' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Multas,
  COUNT(CASE WHEN req.impacto = 'Clausura' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Clausuras,
  COUNT(CASE WHEN req.impacto = 'Administrativo' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Administrativos
FROM unidad_operativa uo
JOIN registro r ON uo.id_planta = r.id_planta
JOIN requerimiento req ON r.id_requerimiento = req.id_requerimiento
WHERE zona = 'Noreste'
GROUP BY uo.nombre_planta; `;

let Pasifico = `SELECT
uo.nombre_planta AS UnidadOperativa,
COUNT(CASE WHEN req.impacto = 'Multa' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Multas,
COUNT(CASE WHEN req.impacto = 'Clausura' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Clausuras,
COUNT(CASE WHEN req.impacto = 'Administrativo' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Administrativos
FROM unidad_operativa uo
JOIN registro r ON uo.id_planta = r.id_planta
JOIN requerimiento req ON r.id_requerimiento = req.id_requerimiento
where zona ='Pacífico'
GROUP BY uo.nombre_planta;`;

let sureste= `SELECT
uo.nombre_planta AS UnidadOperativa,
COUNT(CASE WHEN req.impacto = 'Multa' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Multas,
COUNT(CASE WHEN req.impacto = 'Clausura' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Clausuras,
COUNT(CASE WHEN req.impacto = 'Administrativo' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Administrativos
FROM unidad_operativa uo
JOIN registro r ON uo.id_planta = r.id_planta
JOIN requerimiento req ON r.id_requerimiento = req.id_requerimiento
WHERE zona = 'Sureste'
GROUP BY uo.nombre_planta; `;

  let clausuradasnas = [];
  let multasnas = [];
  let administrativasnas = [];
  let optimasnas = [];

  let clausuradascen=[];
  let multascen=[];
  let administrativascen=[];
  let optimascen=[];

  let clausuradasnor=[];
  let multasnor=[];
  let administrativasnor=[];
  let optimasnor=[];

  let clausuradaspas=[];
  let multaspas=[];
  let administrativaspas=[];
  let optimaspas=[];

  let clausuradassur=[];
  let multassur=[];
  let administrativassur=[];
  let optimassur=[];
  


  let [resultados] = await pool.query(nacional);
  for (let i = 0; i < resultados.length; i++) {
    if (
      (resultados[i].Clausuras === 1) &&
      (resultados[i].Multas === 0 || resultados[i].Multas === 1) &&
      (resultados[i].Administrativos === 1 || resultados[i].Administrativos === 0)
    ) {
      console.log(resultados[i].UnidadOperativa + " ....... Clausuradas");
      clausuradasnas.push(resultados[i]);
    } else if (
      (resultados[i].Clausuras === 0) &&
      (resultados[i].Multas === 1) &&
      (resultados[i].Administrativos === 0 || resultados[i].Administrativos === 1)
    ) {
      console.log(resultados[i].UnidadOperativa + " ....... Multado");
      multasnas.push(resultados[i]);

    } else if (
      (resultados[i].Clausuras === 0) &&
      (resultados[i].Multas === 0) &&
      (resultados[i].Administrativos === 1)
    ) {
      console.log(resultados[i].UnidadOperativa + " ......... Administrativos");
      administrativasnas.push(resultados[i]);
    } else {
      console.log(resultados[i].UnidadOperativa + " ......... Libres");
      optimasnas.push(resultados[i]);
    }
  }

console.log("")
console.log("estadisticas de centro........................................................")
console.log("")

  let [resultadoscen] = await pool.query(centro);
  for (let i = 0; i < resultadoscen.length; i++) {
    if (
      (resultadoscen[i].Clausuras === 1) &&
      (resultadoscen[i].Multas === 0 || resultadoscen[i].Multas === 1) &&
      (resultadoscen[i].Administrativos === 1 || resultadoscen[i].Administrativos === 0)
    ) {
      console.log(resultadoscen[i].UnidadOperativa + " ....... Clausuradas");
      clausuradascen.push(resultadoscen[i]);
    } else if (
      (resultadoscen[i].Clausuras === 0) &&
      (resultadoscen[i].Multas === 1) &&
      (resultadoscen[i].Administrativos === 0 || resultadoscen[i].Administrativos === 1)
    ) {
      console.log(resultadoscen[i].UnidadOperativa + " ....... Multado");
      multascen.push(resultadoscen[i]);

    } else if (
      (resultadoscen[i].Clausuras === 0) &&
      (resultadoscen[i].Multas === 0) &&
      (resultadoscen[i].Administrativos === 1)
    ) {
      console.log(resultadoscen[i].UnidadOperativa + " ......... Administrativos");
      administrativascen.push(resultadoscen[i]);
    } else {
      console.log(resultadoscen[i].UnidadOperativa + " ......... Libres");
      optimascen.push(resultadoscen[i]);
    }
  }
console.log("")
  console.log("estadisticas de noreste.....................................................")
console.log("")

  let [resultadosnor] = await pool.query(noreste);
  for (let i = 0; i < resultadosnor.length; i++) {
    if (
      (resultadosnor[i].Clausuras === 1) &&
      (resultadosnor[i].Multas === 0 || resultadosnor[i].Multas === 1) &&
      (resultadosnor[i].Administrativos === 1 || resultadosnor[i].Administrativos === 0)
    ) {
      console.log(resultadosnor[i].UnidadOperativa + " ....... Clausuradas");
      clausuradasnor.push(resultadosnor[i]);
    } else if (
      (resultadosnor[i].Clausuras === 0) &&
      (resultadosnor[i].Multas === 1) &&
      (resultadosnor[i].Administrativos === 0 || resultadosnor[i].Administrativos === 1)
    ) {
      console.log(   resultadosnor[i].UnidadOperativa + " ....... Multado");
      multasnor.push(resultadosnor[i]);

    } else if (
      (resultadosnor[i].Clausuras === 0) &&
      (resultadosnor[i].Multas === 0) &&
      (resultadosnor[i].Administrativos === 1)
    ) {
      console.log(resultadosnor[i].UnidadOperativa + " ......... Administrativos");
      administrativascen.push(resultadosnor[i]);
    } else {
      console.log(resultadosnor[i].UnidadOperativa + " ......... Libres");
      optimascen.push(resultadosnor[i]);
    }
  }

  console.log("")
  console.log("estadisticas de pasifico.....................................................")
console.log("")


  let [resultadospas] = await pool.query(Pasifico);
  for (let i = 0; i < resultadospas.length; i++) {
    if (
      (resultadospas[i].Clausuras === 1) &&
      (resultadospas[i].Multas === 0 || resultadospas[i].Multas === 1) &&
      (resultadospas[i].Administrativos === 1 || resultadospas[i].Administrativos === 0)
    ) {
      console.log(resultadospas[i].UnidadOperativa + " ....... Clausuradas");
      clausuradaspas.push(resultadospas[i]);
    } else if (
      (resultadospas[i].Clausuras === 0) &&
      (resultadospas[i].Multas === 1) &&
      (resultadospas[i].Administrativos === 0 || resultadospas[i].Administrativos === 1)
    ) {
      console.log(   resultadospas[i].UnidadOperativa + " ....... Multado");
      multaspas.push(resultadospas[i]);

    } else if (
      (resultadospas[i].Clausuras === 0) &&
      (resultadospas[i].Multas === 0) &&
      (resultadospas[i].Administrativos === 1)
    ) {
      console.log(resultadospas[i].UnidadOperativa + " ......... Administrativos");
      administrativaspas.push(resultadospas[i]);
    } else {
      console.log(resultadospas[i].UnidadOperativa + " ......... Libres");
      optimaspas.push(resultadospas[i]);
    }
  }

  let [resultadossur] = await pool.query(sureste);
  for (let i = 0; i < resultadossur.length; i++) {
    if (
      (resultadossur[i].Clausuras === 1) &&
      (resultadossur[i].Multas === 0 || resultadossur[i].Multas === 1) &&
      (resultadossur[i].Administrativos === 1 || resultadossur[i].Administrativos === 0)
    ) {
      console.log(resultadossur[i].UnidadOperativa + " ....... Clausuradas");
      clausuradaspas.push(resultadossur[i]);
    } else if (
      (resultadossur[i].Clausuras === 0) &&
      (resultadossur[i].Multas === 1) &&
      (resultadossur[i].Administrativos === 0 || resultadossur[i].Administrativos === 1)
    ) {
      console.log(   resultadossur[i].UnidadOperativa + " ....... Multado");
      multaspas.push(resultadossur[i]);

    } else if (
      (resultadossur[i].Clausuras === 0) &&
      (resultadossur[i].Multas === 0) &&
      (resultadossur[i].Administrativos === 1)
    ) {
      console.log(resultadossur[i].UnidadOperativa + " ......... Administrativos");
      administrativaspas.push(resultadossur[i]);
    } else {
      console.log(resultadossur[i].UnidadOperativa + " ......... Libres");
      optimaspas.push(resultadossur[i]);
    }
  }

  clausuradasnas    = clausuradasnas.length
  multasnas         = multasnas.length
  administrativasnas= administrativasnas.length
  optimasnas        =optimasnas.length

  clausuradascen      = clausuradascen.length
  multascen           = multascen.length
  administrativascen  = administrativascen.length
  optimascen          = optimascen.length
 
  clausuradasnor    = clausuradasnor.length    
  multasnor         = multasnor.length
  administrativasnor= administrativasnor.length
  optimasnor         = optimasnor.length

  administrativaspas  = administrativaspas.length
  clausuradaspas       = clausuradaspas.length
  multaspas           = multaspas.length
  optimaspas          = optimaspas.length

  administrativassur = administrativassur.length
  clausuradassur = clausuradassur.length
  multaspassur = multassur.length
  optimaspassur = optimassur.length
 
  const nas = {
    zona:"grafica_total",
    clausuradasnas,
    multasnas,
    administrativasnas,
    optimasnas        
  };
  
  const cen = {
    zona:"grafica_cen",
    clausuradascen,   
    multascen,         
    administrativascen,
    optimascen        
  };

  const nor={
    zona:"Grafica_nor",
    clausuradasnor,
    multasnor,
    administrativasnor,
    optimasnor,
  }

  const pas={
    zona:"Grafica_pas",
    clausuradaspas,
    multaspas,
    administrativaspas,
    optimaspas          ,
  }

  const sur={
    zona:"Grafica_sur",
    administrativassur,
    clausuradassur,
    multaspassur,
    optimaspassur
}

  const jeison = [nas,cen,nor,pas,sur]
  
  res.json(jeison);

}

const obtenerEstadisticas = async (consulta) => {
  const [resultados] = await pool.query(consulta);
  const estadisticas = {
    clausuradas: 0,
    multas: 0,
    administrativas: 0,
    optimas: 0,
  };

  for (const resultado of resultados) {
    if (resultado.Clausuras === 1 &&
        (resultado.Multas === 0 || resultado.Multas === 1) &&
        (resultado.Administrativos === 1 || resultado.Administrativos === 0)) {
      estadisticas.clausuradas++;
    } else if (resultado.Clausuras === 0 &&
               resultado.Multas === 1 &&
               (resultado.Administrativos === 0 || resultado.Administrativos === 1)) {
      estadisticas.multas++;
    } else if (resultado.Clausuras === 0 &&
               resultado.Multas === 0 &&
               resultado.Administrativos === 1) {
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

controladorRegistro. Graficatotal = async (req, res) => {
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

  const estadisticasNas = await obtenerYProcesarEstadisticas(nacional, "grafica_total");
  const estadisticasCen = await obtenerYProcesarEstadisticas(centro, "grafica_cen");
  const estadisticasNor = await obtenerYProcesarEstadisticas(noreste, "Grafica_nor");
  const estadisticasPas = await obtenerYProcesarEstadisticas(Pasifico, "Grafica_pas");
  const estadisticasSur = await obtenerYProcesarEstadisticas(sureste, "Grafica_sur");

  const jeison = [estadisticasNas, estadisticasCen, estadisticasNor, estadisticasPas, estadisticasSur];
  res.json(jeison);
};






// controladorRegistro.graficaCentro= async (req, res) => {

//   // Clausura: rojo 
//   // Multa: amarillo
//   // Administrativo: gris 
//   // Si no tiene nada: verde 

//   const consulta = `SELECT
//     uo.nombre_planta AS UnidadOperativa,
//     COUNT(CASE WHEN req.impacto = 'Multa' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Multas,
//     COUNT(CASE WHEN req.impacto = 'Clausura' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Clausuras,
//     COUNT(CASE WHEN req.impacto = 'Administrativo' AND uo.activo = 1 AND r.estatus != 'Vigente' THEN 1 END) AS Administrativos
//   FROM unidad_operativa uo
//   JOIN registro r ON uo.id_planta = r.id_planta
//   JOIN requerimiento req ON r.id_requerimiento = req.id_requerimiento
//   WHERE zona = 'Centro'
//   GROUP BY uo.nombre_planta; `;

//   let clausuradas = [];
//   let multas = [];
//   let administrativas = [];
//   let optimas = [];

//   const [resultados] = await pool.query(consulta);
//   for (let i = 0; i < resultados.length; i++) {
//     if (
//       (resultados[i].Clausuras === 1) &&
//       (resultados[i].Multas === 0 || resultados[i].Multas === 1) &&
//       (resultados[i].Administrativos === 1 || resultados[i].Administrativos === 0)
//     ) {
//       console.log(resultados[i].UnidadOperativa + " ....... Clausuradas");
//       clausuradas.push(resultados[i]);
//     } else if (
//       (resultados[i].Clausuras === 0) &&
//       (resultados[i].Multas === 1) &&
//       (resultados[i].Administrativos === 0 || resultados[i].Administrativos === 1)
//     ) {
//       console.log(resultados[i].UnidadOperativa + " ....... Multado");
//       multas.push(resultados[i]);

//     } else if (
//       (resultados[i].Clausuras === 0) &&
//       (resultados[i].Multas === 0) &&
//       (resultados[i].Administrativos === 1)
//     ) {
//       console.log(resultados[i].UnidadOperativa + " ......... Administrativos");
//       administrativas.push(resultados[i]);
//     } else {
//       console.log(resultados[i].UnidadOperativa + " ......... Libres");
//       optimas.push(resultados[i]);
//     }
//   }
//   const clau= clausuradas.length
//   const mul= multas.length
//   const admin = administrativas.length
//   const opt=optimas.length

//   const respuesta = {
//     clau,
//     mul,
//     admin,
//     opt
//   };

//   res.json(respuesta);
// };


module.exports = controladorRegistro;
