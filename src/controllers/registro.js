const { json, text } = require("express");
const path = require("path");
const bodyParser = require('body-parser')
const pool = require("../database");
const fs= require('fs');
const { url } = require("inspector");

const controladorRegistro = {};

//controlador que trae todos los registros
controladorRegistro.obtenerRegistro = async (req, res) => {
  try {
    const [registros] = await pool.query("select *from Registro");
    res.send(registros);
  } catch (Excepcion) {
    res.send("No se pudo conectar a la base de datos");
  }
};

// controladorRegistro.fechas = async (req, res) => {
//   try {
//     // Extraer las fechas del cuerpo de la solicitud
//     const { fechaAcomodada, fechaAcomodada2 } = req.body;

//     // Enviar una respuesta JSON con las fechas
//     res.json({ message: "Fechas leídas", fechas: { fechaAcomodada, fechaAcomodada2 } });
//     return { fechaAcomodada, fechaAcomodada2 }; // Devuelve las fechas como un objeto
//   } catch (error) {
//     // Manejo de errores
//     console.error("Error al procesar la solicitud:", error);
//     res.status(500).json({ error: "Error al procesar la solicitud" });
//   }
// };

// controladorRegistro.insertarPdf = async (req, res) => {
//   // Verifica si se envió un archivo PDF
//   if (!req.files || !req.files.pdfFile) {
//     return res.status(400).json({ message: "Ningún archivo PDF seleccionado" });
//   }

//   // Obtén los datos del cuerpo de la solicitud
//   const pdfFile = req.files.pdfFile;
//   const nomarchi = pdfFile.name;

//   if (!fs.existsSync('./src/recursos')) {
//     fs.mkdirSync('./src/recursos');
//   }

//   pdfFile.mv(path.join(__dirname, "../recursos", nomarchi), async (err) => {
//     if (err) {
//       console.log("Error al mover el archivo");
//       console.log(err);
//       return res.status(500).json({ message: "Error al cargar el archivo" });
//     }

//     // Construye la URL del PDF
//     const pdfUrls = `http://localhost:2300/recursos/${nomarchi}`;

//     // Llama a la función fechas y espera su resultado
//     const fechas = await controladorRegistro.fechas(req, res);

//     console.log("Se recibió la petición");
//     console.log(pdfUrls);
//     console.log("Hasta aquí está la petición");

//     const {
//       id_planta,
//       id_requerimiento,
//       observaciones,
//       estatus,
//       validez_unica,
//     } = req.body;

//     console.log("Aquí empieza");

//     console.log('Estas son las fechas que se insertaron en un controller');
//     console.log("Esto es del body.................................");
//     try {
//       console.log(id_planta, id_requerimiento, observaciones, estatus, validez_unica, pdfUrls, fechas);
//     } catch {
//       res.status(500).json({ message: "Está fallando algo" });
//     }
//   });
// };






controladorRegistro.fechas = async (req, res) => {
  try {
    // Extraer las fechas del cuerpo de la solicitud
    const { fechaAcomodada, fechaAcomodada2 } = req.body;

    res.json({ message: "Fechas leídas", fechas: { fechaAcomodada, fechaAcomodada2 } });
    return { fechaAcomodada, fechaAcomodada2 };
  } catch (error) {
    // Manejo de errores
    console.error("Error al procesar la solicitud:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};

controladorRegistro.insertarPdf = async (req, res) => {
  // Verifica si se envió un archivo PDF
  if (!req.files || !req.files.pdfFile) {
    return res.status(400).json({ message: "Ningún archivo PDF seleccionado" });
  }

  // Obtén los datos del cuerpo de la solicitud
  const pdfFile = req.files.pdfFile;
  const nomarchi = pdfFile.name;

  if (!fs.existsSync('./src/recursos')) {
    fs.mkdirSync('./src/recursos');
  }

  pdfFile.mv(path.join(__dirname, "../recursos", nomarchi), async (err) => {
    if (err) {
      console.log("Error al mover el archivo");
      console.log(err);
      return res.status(500).json({ message: "Error al cargar el archivo" });
    }

    // Construye la URL del PDF
    const pdfUrls = `http://localhost:2300/recursos/${nomarchi}`;

    // Llama a insertarRegistro y pasa pdfUrls como argumento
    // controladorRegistro.insertarRegistro(req, res, pdfUrls);
  });
};

controladorRegistro.insertarRegistro = async (req, res, pdfUrls) => {
  console.log("Se recibió la petición");
  console.log(JSON.stringify(pdfUrls));
  console.log("HASTA aquí está la petición");
  const {
    id_planta,
    id_requerimiento,
    observaciones,
    estatus,
    validez_unica,
  } = req.body;

  console.log("Aquí empieza");

  console.log('Estas son las fechas que se insertaron en un controller');
  console.log("Esto es del body.................................");
  try {
    console.log(id_planta, id_requerimiento, observaciones, estatus, validez_unica);
  } catch {
    res.status(500).json({ message: "Está fallando algo" });
  }
};








//Meto que si funciona por separado para pdf y el cuerpo


// Controlador para cargar el archivo PDF y agregar un nuevo registro
// controladorRegistro.insertarPdf= async (req, res) => {
//   // Verifica si se envió un archivo PDF
//   if (!req.files || !req.files.pdfFile) {
//     return res.status(400).json({ message: "Ningún archivo PDF seleccionado" });
//   }
//  // Obtén los datos del cuerpo de la solicitud
//   const pdfFile = req.files.pdfFile;
//   const nomarchi = pdfFile.name;
//   if (!fs.existsSync('./src/recursos')) {
//     fs.mkdirSync('./src/recursos');
//   }

//   pdfFile.mv(path.join(__dirname, "../recursos", nomarchi),(err)=>{
//     if(err){
//       console.log("truena aqui")
//       console.log(err)
//       return res.status(500).json({message:"{Error al cargar el archivo}"})
//     }
//   });
//     // Construye la URL del PDF
//     const pdfUrls = `http://localhost:2300/recursos/${nomarchi}`;
    
//     res.json(pdfUrls)
//    return(pdfUrls)

// };

// controladorRegistro.insertarRegistro=async(req,res)=>{
//   console.log("se recibio la peticion ")

//   // const fechas= await controladorRegistro.fechas(req,res);
//   // const  { fechaAcomodada, fechaAcomodada2 } = req.body;
//   // console.log(fechas)
//   const {
//     id_planta,
//     id_requerimiento,
//     observaciones,
//     estatus,
//     validez_unica,
//   } = req.body;

//   console.log("Aqui empieza")

//   console.log('Estas son las fechas que se insertaron en un controller')
//   // console.log(fechas)
//   console.log ("esto es del body.................................")
//   try{
//   console.log(id_planta,id_requerimiento,observaciones,estatus,validez_unica,fechaAcomodada,fechaAcomodada2)
//   }catch{
//     res.status(500).json({message:"esta fallando algo"})
//   }


// }



//aqui termina








//controller pára recibir el pdf
// controladorRegistro.pdf = async (req, res, callback) => {

//   // res.send({data:'ok'})

//   if (!req.files) {
//     return res
//       .status(400)
//       .json('{"message": "Ningún archivo PDF seleccionado"}');
//   }
//   const pdfFile = req.files.pdfFile;
//   const nomarchi = pdfFile.name;

//   if (!fs.existsSync('./recusros')) {
//     fs.mkdirSync('./recursos');
//   }

//   // Guarda el archivo en una carpeta en el proyecto de backend
//   pdfFile.mv(path.join(__dirname, "../recursos", nomarchi), (err) => {
    
//     if (err) {
//       console.log("truena aqui")
//       console.log(err)
//       return res.status(500).json({ message: "{Error al cargar el archivo.}" });
//     }
//     const pdfUrl = `http://localhost:2300/recursos/${nomarchi}`;
//     console.log(pdfUrl)
//     // Devuelve la URL del PDF como respuesta
//     callback(pdfUrl);
//   });
// };


//controlador de registros para agregar nuevo registro


// controladorRegistro.insertarRegistro = async (req, res) => {
//     console.log("peticion resivida");

//     controladorRegistro.pdf(req,res,async (pdfUrl)=>{

//       try {
//         const {
//           id_requerimiento, //agregado
//           id_planta, //agregado
//           fecha_inicio, //agregado
//           fecha_vencimiento,//agregado
//           observaciones,//agregado
//           estatus, //estatus
//           validez_unica,
//         } = req.body;
    
    
//         const [consulta] = await pool.query(
//           "insert into registro (id_requerimiento,id_planta,fecha_inicio,fecha_vencimiento,observaciones,Estatus,url,validez_unica) values (?,?,?,?,?,?,?,?)",
//           [
//             id_requerimiento,
//             id_planta,
//             fecha_inicio,
//             fecha_vencimiento,
//             observaciones,
//             estatus,
//             pdfUrl,
//             validez_unica,
//           ]
//         );
//         if (consulta.affectedRows >= 1) {
//           res.send("El registro fue insertado de manera correcta");
//         } else {
//           res.send("El registro no se pudo insertar");
//         }
//       } catch (Excepcion) {
//         res.send("No se pudo conectar a la base de datos");
//       }
//     });
//   // console.log(resPdf)

// };

//controlador para buscar por fecha especifica de inicio
controladorRegistro.buscarFechaDia = async (req, res) => {
  try {
    const fech = req.body.fechaIni;
    const fe = fech + "%";
    const [fechas] = await pool.query(
      "select *from registro where fecha_inicio like ?",
      [fe]
    );
    if (fechas != "") {
      res.send(fechas);
    } else {
      res.send(
        "Formato de fecha incorrecto o ingresaste un caracter no valido"
      );
    }
  } catch (Exception) {
    res.send("No se pudo conectar a la base de datos");
  }
};

//controlador para buscar mediante el año y el mes de inicio
controladorRegistro.buscarFechaAAMM = async (req, res) => {
  try {
    const ani = req.body.anio;
    const me = req.body.mes;
    const [fechaIni] = await pool.query(
      "select *from registro where month(fecha_inicio)=? and year(fecha_inicio) = ?",
      [me, ani]
    );
    if (fechaIni != "") {
      res.send(fechaIni);
    } else {
      res.send("Verifica que el año y mes esten bien escritos");
    }
  } catch (Excepcion) {
    res.send("No se pudo conectar a la base de datos");
  }
};

//controlador para buscar por anio de inicio
controladorRegistro.buscarFechaAnio = async (req, res) => {
  try {
    const anio = req.body.ani;
    const [fe] = await pool.query(
      "select *from registro where year(fecha_inicio) = ?",
      [anio]
    );
    if (fe.length >= 1) {
      res.send(fe);
    } else {
      res.send("No se encontro ningun dato que coinsida");
    }
  } catch (Excepcion) {
    res.send("No se pudo cpnectar a la base de datos");
  }
};

//controlador para buscar por fecha especificada de vencimiento
controladorRegistro.buscarFechaAnioT = async (req, res) => {
  try {
    const fech = req.body.fechaVen;
    if (fech != "") {
      const fecha = fech + "%";
      const [fechas] = await pool.query(
        "select *from registro where fecha_vencimiento like ?",
        [fecha]
      );
      if (fechas.length >= 1) {
        res.send(res.send(fechas));
      } else {
        res.send("No se encontro ningun registro con la fecha especificada");
      }
    } else {
      res.send("formato de fechas invalido");
    }
  } catch (Excepcion) {
    res.send("No se pudo conectar a la base de datos");
  }
};

//controlador para buscar por año y mes de vencimiento
controladorRegistro.buscarFechaAAMMT = async (req, res) => {
  try {
    const ani = req.body.anio;
    const me = req.body.mes;
    const [fechaVen] = await pool.query(
      "select *from registro where month(fecha_vencimiento)=? and year(fecha_vencimiento) = ?;",
      [me, ani]
    );
    if (fechaVen.length >= 1) {
      res.send(fechaVen);
    } else {
      res.send("No se encontro un registro con este año y mes especificado");
    }
  } catch (Excepcion) {
    res.send("No se pudo conectar a la base de datos");
  }
};

//controlador para registroos por año de vencimiento
controladorRegistro.buscarFechaAT = async (req, res) => {
  try {
    const ani = req.body.anio;
    const [fechaVen] = await pool.query(
      "select *from registro where year(fecha_vencimiento) = ?",
      [ani]
    );
    if (fechaVen.length >= 1) {
      res.json(fechaVen);
    } else {
      res.send("no se encontraron registros de este año");
    }
  } catch (Excepcion) {
    res.send("No se pudo conectar a la base de datos");
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
        "select *from registro where fecha_vencimiento >= ? and fecha_vencimiento<=?",
        [feI, feF]
      );
      if (rang.length >= 1) {
        res.send(res.send(rang));
      } else {
        res.send("No se encontraron registros en este rango insertado");
      }
    } else {
      res.send("formato de fecha invalida");
    }
  } catch (Excepcion) {
    res.send("No se pudo conectar a la base de datos");
  }
};

//controlador de registros para actualizar registros
controladorRegistro.actualizarRegistro = async (req, res) => {
  try {
    const {
      id_requerimiento,
      id_planta,
      fecha_inicio,
      fecha_vencimiento,
      observaciones,
      Estatus,
      url,
      validez_unica,
      id_registro,
    } = req.body;
    const [rows] = await pool.query(
      "UPDATE registro set id_requerimiento=?, id_planta=?, fecha_inicio=?, fecha_vencimiento=?, observaciones=?, Estatus=?, url=?, validez_unica=? where id_registro = ?",
      [
        id_requerimiento,
        id_planta,
        fecha_inicio,
        fecha_vencimiento,
        observaciones,
        Estatus,
        url,
        validez_unica,
        id_registro,
      ]
    );
    if (rows.affectedRows > 0) {
      res.send("actualizacion realizada con exito");
    } else {
      res.send("verifique si existe el registro en la base de datos");
    }
  } catch (Excepcion) {
    res.send("No se pudo conectar a la base de datos");
  }
};

//controlador para actualizar los estados
controladorRegistro.actualizarEstado = async (req, res) => {
  try {
    const id = req.body.ide;
    const dato = req.body.estado;
    const [aviso] = await pool.query(
      "update registro set Estatus = ? where id_registro=?",
      [dato, id]
    );
    if (aviso.affectedRows >= 1) {
      res.send("Estado del registro actaulizado correctamente");
    } else {
      res.send("No se pudo actualizar el estado");
    }
  } catch (Exception) {
    res.send(
      "verifica no haber metido un caracter especial o tener conexion a la base de datos"
    );
  }
};

module.exports = controladorRegistro;
