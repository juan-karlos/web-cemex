const pool = require("../database.js");
const axios = require("axios");
const exceljs = require("exceljs");
const transporter = require("../emails/mailer.js");

const controladorVencimiento = {};

const gmail = "devsolidit@gmail.com"

// hace la actualizacion de permisos y realiza el envio de emails a los que estan registrados en la base de datos.
//60 dias 30 dias 
//errores en esta parte de codigo 

// Vencimiento del dia siguiente
// de todas las zonas
controladorVencimiento.updateToVencimiento = async (req, res) => {
  try {
    const response = await axios.get("http://worldtimeapi.org/api/ip"); // Obtener fecha actual desde la red
    const utcRed = response.data.utc_datetime;

    // Trabajar directamente con la hora UTC de la red
    const networkDate = new Date(utcRed);

    // Obtener la diferencia de tiempo (offset) en minutos
    const timezoneOffset = networkDate.getTimezoneOffset();

    // Ajustar la fecha local restando el offset
    const adjustedLocalDate = new Date(
      networkDate.getTime() - timezoneOffset * 60 * 1000
    );

    const fecha = adjustedLocalDate.toISOString().split("T")[0]; //recupero solo la fecha actual

    function formatoFecha(fecha) {
      //formatea la fecha.
      const partesFecha = fecha.split("-");
      const anio = partesFecha[0];
      const mes = partesFecha[1];
      const dia = partesFecha[2];
      return `${anio}/${mes}/${dia}`;
    }
    const fechaFormateada = formatoFecha(fecha);

    const zonas=["Noreste","Pacifico","Centro","Sureste"] 

    for (let i = 0; i < zonas.length; i++) {
      const [registrosVencidos] = await pool.query(
        `SELECT id_registro 
        FROM registro 
        JOIN unidad_operativa ON registro.id_planta = unidad_operativa.id_planta  
        WHERE fecha_vencimiento <= ? AND estatus = "Vigente" AND zona = ?`,
        [fechaFormateada, zonas[i]]
      );
      if (registrosVencidos.length > 0) {
        // Actualizar el estado de los registros a "Vencido"
        await pool.query(
          `UPDATE registro 
          JOIN unidad_operativa ON registro.id_planta = unidad_operativa.id_planta 
          SET registro.estatus = "Vencido"
          WHERE unidad_operativa.zona = ?
          AND registro.estatus = "Vigente" 
          AND registro.id_registro IN (?)`,
          [zonas[i], registrosVencidos.map(registro => registro.id_registro)]
        );

        //Mando a traer todos los requerimientos vencidos
        const [rows] = await pool.query(
          `SELECT
                  requerimiento.nombre_requerimiento as requerimiento,
                  requerimiento.siglas as siglas,
                  requerimiento.impacto as impacto,
                  unidad_operativa.nombre_planta as planta,
                  unidad_operativa.segmento as segmento,
                  registro.estatus as estatus,
                  registro.fecha_vencimiento as data
              FROM
                  registro
                  JOIN requerimiento  ON registro.id_requerimiento = requerimiento.id_requerimiento
                  JOIN unidad_operativa ON registro.id_planta = unidad_operativa.id_planta
              WHERE
                  zona= ? and registro.id_registro IN (?)
                  ORDER BY registro.fecha_vencimiento ASC`,
          [zonas[i], registrosVencidos.map(registro => registro.id_registro)]
        );

        if (rows.length > 0) {     
          //traer todos los correos de los usuarios
          const [correos] = await pool.query(
            `SELECT correo_electronico FROM usuarios WHERE zona_asignada = "todos" or zona_asignada = ?`,
            [zonas[i]]
          );

          if (correos.length >= 1) {
            const correo = correos.map(usuario => usuario.correo_electronico);
            
            // Enviar correo electrónico con el archivo adjunto
            for (let j = 0; j < rows.length; j++) {
              const info = await transporter.sendMail({
                from: `"Admin" <${gmail}>`,
                to: correo,
                subject: "Requerimientos Vencidos",
                text: "Adjunto encontrarás los requerimientos vencidos del día de hoy.",
                html:`
                <!DOCTYPE html>
                    <html lang="es">
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>Tabla de Información</title>
                      <style>
                        table {
                          width: 100%;
                          border-collapse: collapse;
                        }
                        th, td {
                          border: 1px solid #ddd;
                          padding: 8px;
                          text-align: left;
                        }
                        th {
                          background-color: #f2f2f2;
                        }
                      </style>
                    </head>
                    <body>
      
                    <h2>Requerimientos que vencen en la zona ${zonas[i]}</h2>
      
                    <table>
                      <thead>
                        <tr>
                          <th> Nombre requerimiento </th>
                          <th> Planta </th>
                          <th> Segmento </th>
                          <th> Impacto </th>
                          <th> Siglas </th>
                          <th> Estatus </th>
                          <th> Data </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>${rows[j].requerimiento}</td>
                          <td>${rows[j].planta}</td>
                          <td>${rows[j].segmento}</td>
                          <td>${rows[j].impacto}</td>
                          <td>${rows[j].siglas}</td>
                          <td>${rows[j].estatus}</td>
                          <td>${rows[j].data}</td>
                        </tr>
                      </tbody>
                    </table>
                    </body>
                    </html>
                `,
              });
            }
            console.log("Se enviaron los correos correctamente de la zona", zonas[i])
            console.log('Estado de registros actualizado a "Vencido" de la zona ', zonas[i]);


          } else {
            console.log("No se encontraron correos para poder enviar notificaciones para la zona", zonas[i])
          }
          console.log("Envío de emails correctamente de la zona", zonas[i]);
        } else {
          console.log("No hay requerimientos que vencen de la zona", zonas[i])
        }
      } else {
        console.error("No hay requerimientos vencidos");
      }
    }
    res.status(200).json({ message: "Se Actualizo con éxito" });
    console.log("Tarea programada ejecutada correctamente.");
  } catch (excepcion) {
    console.error("Error en la tarea programada:", excepcion);
    res.status(500).json({message:"Hay un problema con el servidor"});
  }
};

// vencimiento a los 30 dias
controladorVencimiento.unMes = async (req, res) => {
  try {
    const response = await axios.get("http://worldtimeapi.org/api/ip"); // Obtener fecha actual desde la red
    const utcRed = response.data.utc_datetime;

    // Trabajar directamente con la hora UTC de la red
    const networkDate = new Date(utcRed);

    // Obtener la diferencia de tiempo (offset) en minutos
    const timezoneOffset = networkDate.getTimezoneOffset();

    // Ajustar la fecha local sumando el offset
    const adjustedLocalDate = new Date(
      networkDate.getTime() - timezoneOffset * 60 * 1000
    );

    // Agregar 30 días
    adjustedLocalDate.setDate(adjustedLocalDate.getDate() + 30);

    // Formatear la fecha
    const anio = adjustedLocalDate.getFullYear();
    let mes = adjustedLocalDate.getMonth() + 1;
    let dia = adjustedLocalDate.getDate();

    // Ajustar el formato para tener dos dígitos
    mes = (mes < 10) ? '0' + mes : mes;
    dia = (dia < 10) ? '0' + dia : dia;

    // Concatenar la fecha formateada
    const fechaFormateada = `${anio}-${mes}-${dia}`;

    console.log(fechaFormateada);

    // consulta que trae todos los requerimientos que vencerán en 30 días
    const zonas = ["Noreste", "Pacifico", "Centro", "Sureste"];
    for (let i = 0; i < zonas.length; i++) {
      const [IdRegistro] = await pool.query(
        `SELECT id_registro
        FROM registro JOIN unidad_operativa ON registro.id_planta = unidad_operativa.id_planta
        WHERE fecha_vencimiento = ? AND estatus = "Vigente" AND zona = ?`,
        [fechaFormateada, zonas[i]]
      );

      if (IdRegistro.length > 0) {
        // Mando a traer todos los requerimientos vencidos
        const [rows] = await pool.query(
          `SELECT
                  requerimiento.nombre_requerimiento as requerimiento,
                  requerimiento.siglas as siglas,
                  requerimiento.impacto as impacto,
                  unidad_operativa.nombre_planta as planta,
                  unidad_operativa.segmento as segmento,
                  registro.estatus as estatus,
                  registro.fecha_vencimiento as data
              FROM
                  registro
                  JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
                  JOIN unidad_operativa ON registro.id_planta = unidad_operativa.id_planta
              WHERE
                  zona = ? AND registro.id_registro IN (?)
                  ORDER BY registro.fecha_vencimiento ASC`,
          [zonas[i], IdRegistro.map((registro) => registro.id_registro)]
        );

        if (rows.length > 0) {
          // Traer todos los correos de los usuarios
          const [correos] = await pool.query(
            `SELECT correo_electronico FROM usuarios WHERE zona_asignada = "todos" or zona_asignada = ?`,
            [zonas[i]]
          );
          const correo = correos.map((usuario) => usuario.correo_electronico);
            console.log(correo)
            if (correo!= ""){
                        // Enviar correo electrónico con el archivo adjunto
          for (let j = 0; j < rows.length; j++) {
            const info = await transporter.sendMail({
              from: `"Admin" <${gmail}>`,
              to: correo,
              subject: "Requerimientos Vencidos",
              text: "Adjunto encontrarás los requerimientos vencidos del día de hoy.",
              html:`
              <!DOCTYPE html>
                  <html lang="es">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Tabla de Información</title>
                    <style>
                      table {
                        width: 100%;
                        border-collapse: collapse;
                      }
                      th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                      }
                      th {
                        background-color: #f2f2f2;
                      }
                    </style>
                  </head>
                  <body>
    
                  <h2>Requerimientos que vencen en 30 días de la zona ${zonas[i]}</h2>
    
                  <table>
                    <thead>
                      <tr>
                        <th> Nombre requerimiento </th>
                        <th> Planta </th>
                        <th> Segmento </th>
                        <th> Impacto </th>
                        <th> Siglas </th>
                        <th> Estatus </th>
                        <th> Data </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>${rows[j].requerimiento}</td>
                        <td>${rows[j].planta}</td>
                        <td>${rows[j].segmento}</td>
                        <td>${rows[j].impacto}</td>
                        <td>${rows[j].siglas}</td>
                        <td>${rows[j].estatus}</td>
                        <td>${rows[j].data}</td>
                      </tr>
                    </tbody>
                  </table>
                  </body>
                  </html>
              `,
            });
          }
          console.log("Envío de emails correctamente para la zona", zonas[i]);
          // res.status(200).send("Se ejecutó correctamente");
            }else{
              console.log("No hay correos electronicos para mandar")
            }

        } else {
          // res.status(400).json({
          //   message: "Ningún requerimiento vence este mes",
          // });
          console.log("No hay ningun requerimiento que venza en la zona", zonas[i])
        }

      } else {
        console.error("Ningún requerimiento vence en 30 días de la zona",zonas[i]);
        // res.status(400).send("Ningún requerimiento vence");
      }
    }

    console.log("Tarea programada ejecutada correctamente.");
    res.status(200).json({message:"La tarea se ejecto con exito"})
  } catch (excepcion) {
    console.error("Error en la tarea programada:", excepcion);
    res.status(500).json("Hay un error en el servidor");
  }
};
// vencimiento a los 60 dias
controladorVencimiento.tresMeses = async (req, res) => {
  try {
    const response = await axios.get("http://worldtimeapi.org/api/ip"); // Obtener fecha actual desde la red
    const utcRed = response.data.utc_datetime;

    // Trabajar directamente con la hora UTC de la red
    const networkDate = new Date(utcRed);

    // Obtener la diferencia de tiempo (offset) en minutos
    const timezoneOffset = networkDate.getTimezoneOffset();

    // Ajustar la fecha local sumando el offset
    const adjustedLocalDate = new Date(
      networkDate.getTime() - timezoneOffset * 60 * 1000
    );

    // Agregar 60 dias 
    adjustedLocalDate.setDate(adjustedLocalDate.getDate() + 60);

    // Formatear la fecha
    const anio = adjustedLocalDate.getFullYear();
    let mes = adjustedLocalDate.getMonth() + 1;
    let dia = adjustedLocalDate.getDate();

    // Ajustar el formato para tener dos dígitos
    mes = (mes < 10) ? '0' + mes : mes;
    dia = (dia < 10) ? '0' + dia : dia;

    // Concatenar la fecha formateada
    const fechaFormateada = `${anio}-${mes}-${dia}`;

    console.log(fechaFormateada);

    // consulta que trae todos los requerimientos que vencerán en 30 días
    const zonas = ["Noreste", "Pacifico", "Centro", "Sureste"];
    for (let i = 0; i < zonas.length; i++) {
      const [IdRegistro] = await pool.query(
        `SELECT id_registro
        FROM registro JOIN unidad_operativa ON registro.id_planta = unidad_operativa.id_planta
        WHERE fecha_vencimiento = ? AND estatus = "Vigente" AND zona = ?`,
        [fechaFormateada, zonas[i]]
      );

      if (IdRegistro.length > 0) {
        // Mando a traer todos los requerimientos vencidos
        const [rows] = await pool.query(
          `SELECT
                  requerimiento.nombre_requerimiento as requerimiento,
                  requerimiento.siglas as siglas,
                  requerimiento.impacto as impacto,
                  unidad_operativa.nombre_planta as planta,
                  unidad_operativa.segmento as segmento,
                  registro.estatus as estatus,
                  registro.fecha_vencimiento as data
              FROM
                  registro
                  JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
                  JOIN unidad_operativa ON registro.id_planta = unidad_operativa.id_planta
              WHERE
                  zona = ? AND registro.id_registro IN (?)
                  ORDER BY registro.fecha_vencimiento ASC`,
          [zonas[i], IdRegistro.map((registro) => registro.id_registro)]
        );

        if (rows.length > 0) {
          // Traer todos los correos de los usuarios
          const [correos] = await pool.query(
            `SELECT correo_electronico FROM usuarios WHERE zona_asignada = "todos" or zona_asignada = ?`,
            [zonas[i]]
          );
          const correo = correos.map((usuario) => usuario.correo_electronico);
            if (correo!=""){
          // Enviar correo electrónico con el archivo adjunto
          for (let j = 0; j < rows.length; j++) {
            const info = await transporter.sendMail({
              from: `"Admin" <${gmail}>`,
              to: correo,
              subject: "Requerimientos Vencidos",
              text: "Adjunto encontrarás los requerimientos vencidos del día de hoy.",
              html:`
              <!DOCTYPE html>
                  <html lang="es">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Tabla de Información</title>
                    <style>
                      table {
                        width: 100%;
                        border-collapse: collapse;
                      }
                      th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                      }
                      th {
                        background-color: #f2f2f2;
                      }
                    </style>
                  </head>
                  <body>
    
                  <h2>Requerimientos que vencen en 60 días de la zona ${zonas[i]}</h2>
    
                  <table>
                    <thead>
                      <tr>
                        <th> Nombre requerimiento </th>
                        <th> Planta </th>
                        <th> Segmento </th>
                        <th> Impacto </th>
                        <th> Siglas </th>
                        <th> Estatus </th>
                        <th> Data </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>${rows[j].requerimiento}</td>
                        <td>${rows[j].planta}</td>
                        <td>${rows[j].segmento}</td>
                        <td>${rows[j].impacto}</td>
                        <td>${rows[j].siglas}</td>
                        <td>${rows[j].estatus}</td>
                        <td>${rows[j].data}</td>
                      </tr>
                    </tbody>
                  </table>
                  </body>
                  </html>
              `,
            });
          }
          console.log("Envío de emails correctamente para la zona", zonas[i]);
          // res.status(200).send("Se ejecutó correctamente");
            }else{
              console.log("No se encontro correo para la zona"+zonas[i])
            }

        } else {
          // res.status(400).json({
          //   message: "Ningún requerimiento vence este mes",
          // });
          console.log("No hay ningun requerimiento que venza en la zona", zonas[i])
        }

      } else {
        console.error("Ningún requerimiento vence en 30 días de la zona",zonas[i]);
        // res.status(400).send("Ningún requerimiento vence");
      }
    }

    console.log("Tarea programada ejecutada correctamente.");
    res.status(200).json({message:"La tarea se ejecto con exito"})
  } catch (excepcion) {
    console.error("Error en la tarea programada:", excepcion);
    res.status(500).send("Hay un error en el servidor");
  }
};

// controladorVencimiento.vencSiguienteDia = async (req, res) => {
//   try {
//     const response = await axios.get("http://worldtimeapi.org/api/ip"); // Obtener fecha actual desde la red
//     const utcRed = response.data.utc_datetime;

//     // Trabajar directamente con la hora UTC de la red
//     const networkDate = new Date(utcRed);

//     // Obtener la diferencia de tiempo (offset) en minutos
//     const timezoneOffset = networkDate.getTimezoneOffset();

//     // Ajustar la fecha local sumando el offset
//     const adjustedLocalDate = new Date(
//       networkDate.getTime() - timezoneOffset * 60 * 1000
//     );

//     //solo trae la fecha
//     const fechaR = adjustedLocalDate.toISOString().split("T")[0];

//     function formatoFecha(fecha) {
//       //formatea la fecha.
//       const partesFecha = fecha.split("-");
//       const anio = partesFecha[0];
//       const mes = partesFecha[1];
//       const dia = partesFecha[2];
//       return `${anio}/${mes}/${dia}`;
//     }

//     const fechaFormateada = formatoFecha(fechaR);

//     //recupero la fecha de mañana
//     const [fechaAdelantada] = await pool.query(
//       `SELECT DATE_ADD(?, INTERVAL 1 DAY) as FechaManana`,
//       [fechaFormateada]
//     );

//     const fechaFormateada2 = formatoFecha(fechaAdelantada[0].FechaManana);

//     //consulta que trae todos los requeriminetos que venceran mañana
//     const [IdRegistro] = await pool.query(
//       `SELECT id_registro FROM registro WHERE fecha_vencimiento = ? AND estatus = "Vigente"`,
//       [fechaFormateada2]
//     );

//     if (IdRegistro.length > 0) {
//       //Mando a traer todos los requerimientos vencidos
//       const [rows] = await pool.query(
//         `SELECT
//                 requerimiento.nombre_requerimiento as requerimiento,
//                 requerimiento.siglas as siglas,
//                 requerimiento.impacto as impacto,
//                 unidad_operativa.nombre_planta as planta,
//                 registro.estatus as estatus,
//                 registro.fecha_vencimiento as data
//             FROM
//                 registro
//                 JOIN requerimiento  ON registro.id_requerimiento = requerimiento.id_requerimiento
//                 JOIN unidad_operativa ON registro.id_planta = unidad_operativa.id_planta
//             WHERE
//                 registro.id_registro IN (?)
//                 ORDER BY registro.fecha_vencimiento ASC`,
//         [IdRegistro.map((registro) => registro.id_registro)]
//       );

//       if (rows.length > 0) {
//         // Crear un nuevo libro de Excel
//         const workbook = new exceljs.Workbook();
//         const worksheet = workbook.addWorksheet(
//           "Requerimientos apunto de vencer"
//         );

//         // Agregar encabezados
//         worksheet.columns = [
//           { header: "Planta", key: "planta", width: 40 },
//           { header: "Requerimiento", key: "requerimiento", width: 40 },
//           { header: "Siglas", key: "siglas", width: 10 },
//           { header: "Impacto", key: "impacto", width: 15 },
//           { header: "Estatus", key: "estatus", width: 10 },
//           { header: "Fecha Vencimiento", key: "data", width: 10 },
//         ];

//         // Agregar datos al libro de Excel
//         worksheet.addRows(rows);

//         // Guardar el libro de Excel en un buffer
//         const buffer = await workbook.xlsx.writeBuffer();

//         // Generar un nombre único para el archivo Excel
//         const excelFileName = `Requerimientos que vencen Mañana, fecha: ${fechaAdelantada[0].FechaManana}.xlsx`;

//         //traer todos los correos de los usuarios
//         const [correos] = await pool.query(
//           "Select correo_electronico from usuarios"
//         );
//         const correo = correos.map((usuario) => usuario.correo_electronico);

//         // Enviar correo electrónico con el archivo adjunto
//         const info = await transporter.sendMail({
//           from: `"Admin" <${gmail}>`,
//           to: correo, //a quien se le envia el correo
//           subject: "Requerimientos que venceran mañana",
//           text: "Adjunto encontrarás los requerimientos que venceran mañana",
//           attachments: [
//             {
//               filename: excelFileName,
//               content: buffer,
//               encoding: "base64",
//             },
//           ],
//         });

//         console.log("envio de emails correctamente");
//         res.status(200).json({ message: "Se enviaron los imails correctamente" });
//       } else {
//         res.status(200).json({message: "Ningun requerimiento vence mañana"});
//       }
//       console.log('Estos son los requerimientos que venceran mañana".');
//     } else {
//       res.status(400).json({ message: "no hay requerimientos que vencen mañana" });
//       console.error("Ningun requerimiento vence mañana");
//     }
//     console.log("Tarea programada ejecutada correctamente.");
//   } catch (excepcion) {
//     res.status(500).send("hay un error en el servidor");
//     console.error("Error en la tarea programada:", excepcion);
//   }
// };

// controladorVencimiento.VencenEstaSemana = async (req, res) => {
//   try {
//     const response = await axios.get("http://worldtimeapi.org/api/ip"); // Obtener fecha actual desde la red
//     const utcRed = response.data.utc_datetime;

//     // Trabajar directamente con la hora UTC de la red
//     const networkDate = new Date(utcRed);

//     // Obtener la diferencia de tiempo (offset) en minutos
//     const timezoneOffset = networkDate.getTimezoneOffset();

//     // Ajustar la fecha local sumando el offset
//     const adjustedLocalDate = new Date(
//       networkDate.getTime() - timezoneOffset * 60 * 1000
//     );

//     //solo trae la fecha
//     const fechaR = adjustedLocalDate.toISOString().split("T")[0];

//     function formatoFecha(fecha) {
//       const partesFecha = fecha.split("-");
//       const anio = partesFecha[0];
//       const mes = partesFecha[1];
//       const dia = partesFecha[2];
//       return `${anio}/${mes}/${dia}`;
//     }

//     const fechaFormateada1 = formatoFecha(fechaR);

//     //recupero la fecha de una semana
//     const [fechaAdelantada] = await pool.query(
//       `SELECT DATE_ADD(?, INTERVAL 7 DAY) as semana`,
//       [fechaFormateada1]
//     );

//     const fechaFormateada2 = formatoFecha(fechaAdelantada[0].semana);

//     //consulta que trae todos los requeriminetos que venceran esta semana
//     const [IdRegistro] = await pool.query(
//       `SELECT id_registro FROM registro WHERE fecha_vencimiento >= ? and fecha_vencimiento <= ? AND estatus = "Vigente"`,
//       [fechaFormateada1, fechaFormateada2]
//     );

//     if (IdRegistro.length > 0) {
//       //Mando a traer todos los requerimientos vencidos
//       const [rows] = await pool.query(
//         `SELECT
//                 requerimiento.nombre_requerimiento as requerimiento,
//                 requerimiento.siglas as siglas,
//                 requerimiento.impacto as impacto,
//                 unidad_operativa.nombre_planta as planta,
//                 registro.estatus as estatus,
//                 registro.fecha_vencimiento as data
//             FROM
//                 registro
//                 JOIN requerimiento  ON registro.id_requerimiento = requerimiento.id_requerimiento
//                 JOIN unidad_operativa ON registro.id_planta = unidad_operativa.id_planta
//             WHERE
//                 registro.id_registro IN (?)
//                 ORDER BY registro.fecha_vencimiento ASC`,
//         [IdRegistro.map((registro) => registro.id_registro)]
//       );

//       if (rows.length > 0) {
//         // Crear un nuevo libro de Excel
//         const workbook = new exceljs.Workbook();
//         const worksheet = workbook.addWorksheet("Requerimientos por vencer");

//         // Agregar encabezados
//         worksheet.columns = [
//           { header: "Planta", key: "planta", width: 40 },
//           { header: "Requerimiento", key: "requerimiento", width: 40 },
//           { header: "Siglas", key: "siglas", width: 10 },
//           { header: "Impacto", key: "impacto", width: 15 },
//           { header: "Estatus", key: "estatus", width: 10 },
//           { header: "Fecha Vencimiento", key: "data", width: 10 },
//         ];

//         // Agregar datos al libro de Excel
//         worksheet.addRows(rows);

//         // Guardar el libro de Excel en un buffer
//         const buffer = await workbook.xlsx.writeBuffer();

//         // Generar un nombre único para el archivo Excel
//         const excelFileName = `Requerimientos que vencen esta semana, fechaI: ${fechaFormateada1} fechaF: ${fechaFormateada2}.xlsx`;

//         //traer todos los correos de los usuarios
//         const [correos] = await pool.query(
//           "Select correo_electronico from usuarios"
//         );
//         const correo = correos.map((usuario) => usuario.correo_electronico);

//         // Enviar correo electrónico con el archivo adjunto
//         const info = await transporter.sendMail({
//           from: `"Admin" <${gmail}>`,
//           to: correo, //a quien se le envia el correo
//           subject: "Requerimientos que venceran esta semana",
//           text: "Adjunto encontrarás los requerimientos que vencen esta semana.",
//           attachments: [
//             {
//               filename: excelFileName,
//               content: buffer,
//               encoding: "base64",
//             },
//           ],
//         });

//         console.log("envio de emails correctamente");
//       } else {
//         res.status(200).json({
//           message: "Ningun requerimiento vence esta semana",
//         });
//       }

//       console.log('Estos son los requerimientos que venceran esta semana".');
//     } else {
//       console.error("Ningun requerimiento vence esta semana");
//     }

//     console.log("Tarea programada ejecutada correctamente.");
//   } catch (excepcion) {
//     console.error("Error en la tarea programada:", excepcion);
//   }
// };


//Norte

module.exports = controladorVencimiento;
