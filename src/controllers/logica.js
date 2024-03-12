const pool = require("../database");
const moment = require('moment');
const controllersLogica = {};

controllersLogica.pesoTotal = async (req, res) => {
  try {
    const nomPlanta = req.body.nombre;
    const [peso] = await pool.query(
      `select sum(peso) as pesoTotal
        from unidad_operativa,registro,requerimiento 
        where activo=1 and
        nombre_planta = ? and 
        unidad_operativa.id_planta = registro.id_planta and 
        registro.id_requerimiento = requerimiento.id_requerimiento`,
      [nomPlanta]
    );
    const pesoTotal = peso[0]["pesoTotal"];
    const numero = parseInt(pesoTotal);

    if (peso != null) {
      res.status(200).json({ total: numero });
    } else {
      res.status(400).json({
        message:
          "verifica que esta planta cuente con requerimientos o este activa",
      });
    }
  } catch (Excepcion) {
    console.log(Excepcion);
    res.status(500).json({
      message: "No se pudo conectar a la base de datos",
    });
  }
};




// controllersLogica.InsertHistorial = async (req, res) => {
//   try {
//     // Query to get the total weight for the segment
//     let consulta = `
//       SELECT SUM(peso) AS suma 
//       FROM unidad_operativa 
//       JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
//       JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
//       WHERE estatus != 'No aplica' AND estatus != '' AND segmento = ?;`;

//     // Query to get the total weight for the segment with 'Vigente' status
//     let pesos = `
//       SELECT peso 
//       FROM unidad_operativa 
//       JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
//       JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
//       WHERE estatus != 'No aplica' AND estatus != '' AND estatus = 'Vigente' AND segmento = ?;`;

//     // Query to get the total weight for the segment, 'Vigente' status, and specific zone
//     let zonapes = `
//       SELECT peso 
//       FROM unidad_operativa 
//       JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
//       JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
//       WHERE estatus != 'No aplica' AND estatus != '' AND estatus = 'Vigente' AND segmento = ? AND zona = ?;`;

//     // Query to get the total weight for the segment and specific zone
//     let totalzon = `
//       SELECT peso 
//       FROM unidad_operativa 
//       JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
//       JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
//       WHERE estatus != 'No aplica' AND estatus != '' AND segmento = ? AND zona = ?;`;

//     let segmentosQuery = 'SELECT DISTINCT segmento FROM unidad_operativa;';

//     const [segmentosResponse] = await pool.query(segmentosQuery);

//     const zonas = ['Noreste', 'Sureste', 'Pacífico', 'Centro'];

//     //se consigue la fecha del sistema
//     const fechaActual = moment().format('YYYY-MM-DD');

//     for (const segmento of segmentosResponse) {
//       const currentSegmento = segmento.segmento;

//       const [peso] = await pool.query(pesos, [currentSegmento]);
//       const [pesototal] = await pool.query(consulta, [currentSegmento]);
//       const total = pesototal[0].suma;
//       const sumpes = peso.reduce((acc, curr) => acc + curr.peso / total, 0) * 100;

//       for (const zona of zonas) {
//         const [pesozon] = await pool.query(zonapes, [currentSegmento, zona]);
//         const [pesostot] = await pool.query(totalzon, [currentSegmento, zona]);

//         if (pesototal && pesototal.length > 0 && pesototal[0].suma !== null) {
//           const sumzon = pesozon.reduce((acc, curr) => acc + curr.peso / total, 0) * 100;
//           const zonaPeso = pesostot.reduce((acc, curr) => acc + curr.peso / total, 0) * 100;
//           const pesozona = pesostot.reduce((acc, curr) => acc + curr.peso, 0);

//           if (isValidNumber(sumpes) && isValidNumber(sumzon) && isValidNumber(zonaPeso) && isValidNumber(total) && isValidNumber(pesozona)) {
//             console.log("......................................");
//             console.log("Porcentaje total para todas las unidades operativas:", sumpes);
//             console.log("Porcentaje total para la zona específica:", sumzon);
//             console.log("Porcentaje de cumplimiento de la zona:", zonaPeso);
//             console.log("Peso total del segmento:", total);
//             console.log("Peso de la zona:", pesozona);
//             console.log("Fecha de inserción:", fechaActual);
//             console.log("Segmento:", currentSegmento);
//             console.log("Zona:", zona);

//             // Reemplaza 'historial' con el nombre real de tu tabla
//             await pool.query("INSERT INTO historial(segmento, zona, cumplimiento, fecha) VALUES (?, ?, ?, ?)", [currentSegmento, zona, sumzon, fechaActual]);
//           } else {
//             console.log('Una o más variables no son números válidos. Saltando a la siguiente posición.');
//             // Salta a la siguiente iteración del bucle cuando se encuentra un error
//             continue;
//           }
//         } else {
//           console.log('Error al obtener el peso total. Saltando a la siguiente posición.');
//           // Salta a la siguiente iteración del bucle cuando se encuentra un error
//           continue;
//         }
//       }

//       // Validación para la zona 'Nacional'
//       if (isValidNumber(sumpes) && isValidNumber(total)) {
//         console.log("Inserción de Nacional");
//         console.log("Segmento:", currentSegmento);
//         console.log("Zona: Nacional");
//         console.log("Cumplimiento:", sumpes);
//         console.log("Fecha de inserción:", fechaActual);

//         // Reemplaza 'historial' con el nombre real de tu tabla
//         await pool.query("INSERT INTO historial(segmento, zona, cumplimiento, fecha) VALUES (?, ?, ?, ?)", [currentSegmento, "Nacional", sumpes, fechaActual]);
//       } else {
//         console.log('Una o más variables no son números válidos para la inserción de Nacional. Saltando a la siguiente posición.');
//         // Salta a la siguiente iteración del bucle cuando se encuentra un error
//         continue;
//       }
//     }

//     // Asegúrate de que la respuesta se envíe solo después de que los bucles hayan completado
//     res.status(200).json({ message: 'Ejecutado con éxito' });

//   } catch (error) {
//     console.error('Error en la consulta:', error);
//     res.status(500).json({ message: 'Error en la consulta de estadísticas' });
//   }
// };

// // Función para validar si un valor es un número válido
// function isValidNumber(value) {
//   return typeof value === 'number' && !isNaN(value);
// }


controllersLogica.pesoEnPorcentajeEstatus = async (req, res) => {
  try {
    const { nombre, status } = req.body;
    const [peso] = await pool.query(
      `select sum(peso) from unidad_operativa,registro,requerimiento where activo=1 and nombre_planta = ? and unidad_operativa.id_planta = registro.id_planta and registro.id_requerimiento = requerimiento.id_requerimiento`,
      [nombre]
    );
    const pesoTotal = Number(peso[0]["sum(peso)"]);
    if (peso[0]["sum(peso)"] != null) {
      const [pesoEs] = await pool.query(
        `select sum(peso) from unidad_operativa,registro,requerimiento where activo=1 and estatus = ? and nombre_planta = ? and unidad_operativa.id_planta = registro.id_planta and registro.id_requerimiento = requerimiento.id_requerimiento`,
        [status, nombre]
      );
      const pesoEstatus = Number(pesoEs[0]["sum(peso)"]);
      if (pesoEs[0]["sum(peso)"] != null) {
        const resultado = (pesoEstatus / pesoTotal) * 100;
        res.status(200).json({
          porsentaje: resultado,
        });
      } else {
        res.status(400).json({
          message: `No se encontraron requerimientos con el estatus "${estatus}"`,
        });
      }
    } else {
      res.status(400).json({
        message: `verifica que esta planta cuente con requerimientos de Estatus ${estatus} o que este activa la planta`,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "No hay conexion a la base de datos",
    });
  }
};

controllersLogica.totalPlantas = async (req, res) => {
  try {
    const { zona, segmento } = req.body;
    const [sumPlantas] = await pool.query(
      `select count(distinct id_planta) from unidad_operativa
        where zona = ? and 
        segmento = ? and 
        activo = 1`,
      [zona, segmento]
    );
    const totalPlantas = sumPlantas[0]["count(distinct id_planta)"];
    if (totalPlantas > 0) {
      res.status(200).json({
        message: `El total de plantas en la zona ${zona} del segmento ${segmento} es de: ${totalPlantas}`,
      });
    } else {
      res.status(400).json({
        message: "No se encontraron plantas en esta zona y segmento",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "No hay conexion a la base de datos",
    });
  }
};

controllersLogica.sumTotalZonaSegmento = async (req, res) => {
  try {
    const { zona, segmento } = req.body;
    const [sumPeso] = await pool.query(
      `select sum(porcentaje_cumplimiento) from unidad_operativa
        where zona = ? and 
        segmento = ? and 
        activo=1`,
      [zona, segmento]
    );
    const pesoCumpli = sumPeso[0]["sum(porcentaje_cumplimiento)"];
    if (pesoCumpli != null) {
      res.status(200).json({
        message: `La suma total de cumplimiento es del ${pesoCumpli} %`,
      });
    } else {
      res.status(400).json({
        message: "No se encotraron resultados",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "No se pudo conectar a la base de datos",
    });
  }
};

controllersLogica.fijas = async (req, res) => {
  try {
    const results = []; // Arreglo para almacenar los resultados

    // Query to get the total weight for the segment
    let consulta = `
      SELECT SUM(peso) AS suma 
      FROM unidad_operativa 
      JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
      JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
      WHERE estatus != 'No aplica' AND estatus != '' AND segmento = ? AND activo=1 AND fija=1;`;

    // Query to get the total weight for the segment with 'Vigente' status
    let pesos = `
      SELECT peso 
      FROM unidad_operativa 
      JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
      JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
      WHERE estatus != 'No aplica' AND estatus != '' AND estatus = 'Vigente' AND segmento = ? AND activo=1 AND fija=1;`;

    // Query to get the total weight for the segment, 'Vigente' status, and specific zone
    let zonapes = `
      SELECT peso 
      FROM unidad_operativa 
      JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
      JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
      WHERE estatus != 'No aplica' AND estatus != '' AND estatus = 'Vigente' AND segmento = ? AND zona = ? AND activo=1 AND fija=1;`;

    // Query to get the total weight for the segment and specific zone
    let totalzon = `
      SELECT peso 
      FROM unidad_operativa 
      JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
      JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
      WHERE estatus != 'No aplica' AND estatus != '' AND segmento = ? AND zona = ? AND activo=1 AND fija=1;`;

    const zonas = ['Sureste', 'Centro', 'Pacifico', 'Noreste', 'Nacional']; // Orden específico de zonas

    //se consigue la fecha del sistema
    const fechaActual = moment().format('YYYY-MM-DD');

    const currentSegmento = 'Constructores';

    const [peso] = await pool.query(pesos, [currentSegmento]);
    const [pesototal] = await pool.query(consulta, [currentSegmento]);
    const total = pesototal[0].suma;
    const sumpes = peso.reduce((acc, curr) => acc + curr.peso / total, 0) * 100;

    for (let j = 0; j < zonas.length; j++) {
      const [pesototal] = await pool.query(consulta, [currentSegmento]);
      const [pesozon] = await pool.query(zonapes, [currentSegmento, zonas[j]]);
      const [pesostot] = await pool.query(totalzon, [currentSegmento, zonas[j]]);

      if (pesototal && pesototal.length > 0 && pesototal[0].suma !== null) {
        const sumzon = pesozon.reduce((acc, curr) => acc + curr.peso / total, 0) * 100;
        const zona = pesostot.reduce((acc, curr) => acc + curr.peso / total, 0) * 100;
        const pesozona = pesostot.reduce((acc, curr) => acc + curr.peso, 0);

        // Construir objeto JSON con los resultados para la zona específica
        const zoneResult = {
          "zona": zonas[j],
          "segmento": currentSegmento,
          "porcentaje_nacional": sumpes,
          "porcentaje_zona_parcial": zona,
          "porcentaje_cumplimiento_promedio": sumzon * 100 / zona,
          
        };

        results.push(zoneResult); // Agregar resultado para la zona específica al arreglo
      }
    }

    // Enviar los resultados como respuesta en formato JSON
    res.status(200).json(results);

  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ message: 'Error en la consulta de estadísticas' });
  }
};

controllersLogica.moviles = async (req, res) => {
  try {
    const results = []; // Arreglo para almacenar los resultados

    // Query to get the total weight for the segment
    let consulta = `
      SELECT SUM(peso) AS suma 
      FROM unidad_operativa 
      JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
      JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
      WHERE estatus != 'No aplica' AND estatus != '' AND segmento = ? AND activo=1 AND fija=0;`;

    // Query to get the total weight for the segment with 'Vigente' status
    let pesos = `
      SELECT peso 
      FROM unidad_operativa 
      JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
      JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
      WHERE estatus != 'No aplica' AND estatus != '' AND estatus = 'Vigente' AND segmento = ? AND activo=1 AND fija=0;`;

    // Query to get the total weight for the segment, 'Vigente' status, and specific zone
    let zonapes = `
      SELECT peso 
      FROM unidad_operativa 
      JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
      JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
      WHERE estatus != 'No aplica' AND estatus != '' AND estatus = 'Vigente' AND segmento = ? AND zona = ? AND activo=1 AND fija=0;`;

    // Query to get the total weight for the segment and specific zone
    let totalzon = `
      SELECT peso 
      FROM unidad_operativa 
      JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
      JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
      WHERE estatus != 'No aplica' AND estatus != '' AND segmento = ? AND zona = ? AND activo=1 AND fija=0;`;

    const zonas = ['Sureste', 'Centro', 'Pacífico', 'Noreste', 'Nacional']; // Orden específico de zonas

    //se consigue la fecha del sistema
    const fechaActual = moment().format('YYYY-MM-DD');

    const currentSegmento = 'Constructores';

    const [peso] = await pool.query(pesos, [currentSegmento]);
    const [pesototal] = await pool.query(consulta, [currentSegmento]);
    const total = pesototal[0].suma;
    const sumpes = peso.reduce((acc, curr) => acc + curr.peso / total, 0) * 100;

    for (let j = 0; j < zonas.length; j++) {
      const [pesototal] = await pool.query(consulta, [currentSegmento]);
      const [pesozon] = await pool.query(zonapes, [currentSegmento, zonas[j]]);
      const [pesostot] = await pool.query(totalzon, [currentSegmento, zonas[j]]);

      if (pesototal && pesototal.length > 0 && pesototal[0].suma !== null) {
        const sumzon = pesozon.reduce((acc, curr) => acc + curr.peso / total, 0) * 100;
        const zona = pesostot.reduce((acc, curr) => acc + curr.peso / total, 0) * 100;
        const pesozona = pesostot.reduce((acc, curr) => acc + curr.peso, 0);

        // Construir objeto JSON con los resultados para la zona específica
        const zoneResult = {
          "zona": zonas[j],
          "segmento": currentSegmento,
          "porcentaje_nacional": sumpes,
          "porcentaje_zona_parcial ": zona,
          "porcentaje_cumplimiento_promedio": sumzon * 100 / zona,
          
        };

        results.push(zoneResult); // Agregar resultado para la zona específica al arreglo
      }
    }

    // Enviar los resultados como respuesta en formato JSON
    res.status(200).json(results);

  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ message: 'Error en la consulta de estadísticas' });
  }
};



controllersLogica.porcentaje = async (req, res) => {
  const sentencia = `SELECT 
    subquery.segmento,
    SUM(CASE WHEN subquery.segmento = 'Cadena de suministro' THEN porcentaje_cumplimiento ELSE 0 END) / COUNT(uo.id_planta) AS "Cadena_suministro",
    SUM(CASE WHEN subquery.segmento = 'Industriales' THEN porcentaje_cumplimiento ELSE 0 END) / COUNT(uo.id_planta) AS "Industriales",
    SUM(CASE WHEN subquery.segmento = 'Inmuebles no operativos' THEN porcentaje_cumplimiento ELSE 0 END) / COUNT(uo.id_planta) AS "Inmuebles_operativos",
    SUM(CASE WHEN subquery.segmento = 'Operaciones' THEN porcentaje_cumplimiento ELSE 0 END) / COUNT(uo.id_planta) AS "Operaciones",
    SUM(CASE WHEN subquery.segmento = 'Transporte' THEN porcentaje_cumplimiento ELSE 0 END) / COUNT(uo.id_planta) AS "Transporte",
    SUM(CASE WHEN subquery.segmento = 'Promexma' THEN porcentaje_cumplimiento ELSE 0 END) / COUNT(uo.id_planta) AS "Promexma",
    SUM(CASE WHEN subquery.segmento = 'Constructores' THEN porcentaje_cumplimiento ELSE 0 END) / COUNT(uo.id_planta) AS "Constructores"
FROM unidad_operativa uo
JOIN (
    SELECT id_planta, segmento
    FROM unidad_operativa
    WHERE zona = 'Centro'
) subquery ON uo.id_planta = subquery.id_planta
WHERE uo.zona = 'Centro'
GROUP BY subquery.segmento;`;

  const [porcentaje] = await pool.query(sentencia);
  res.json(porcentaje);
  console.log(porcentaje);
};


// controllersLogica.estadistica = async (req, res) => {
//   const { nombrezona, segmento } = req.body;
//   try {
//     // Consulta para obtener el peso total para el segmento
//     let consulta = `
//       SELECT SUM(peso) AS suma 
//       FROM unidad_operativa 
//       JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
//       JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
//       WHERE estatus != 'No aplica' AND estatus != '' AND segmento = ?;`;

//     // Consulta para obtener el peso total para el segmento y estatus 'Vigente'
//     let pesos = `
//       SELECT peso 
//       FROM unidad_operativa 
//       JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
//       JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
//       WHERE estatus != 'No aplica' AND estatus != '' AND estatus = 'Vigente' AND segmento = ?;`;

//     // Consulta para obtener el peso total para el segmento, estatus 'Vigente' y zona específica
//     let zonapes = `
//       SELECT peso 
//       FROM unidad_operativa 
//       JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
//       JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
//       WHERE estatus != 'No aplica' AND estatus != '' AND estatus = 'Vigente' AND segmento = ? AND zona = ?;`;

//     let totalzon =`SELECT peso 
//     FROM unidad_operativa 
//     JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
//     JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
//     WHERE estatus != 'No aplica' AND estatus != '' AND segmento = ? AND zona = ?;`;

//     let segmentosQuery = 'SELECT DISTINCT segmento FROM unidad_operativa;';

//     const [segmentosResponse] = await pool.query(segmentosQuery);

//     const zonas = ['Noreste', 'Sureste', 'Pacífico', 'Centro'];

//     //se consigue la fecha del sistema

//     const fechaActual = moment().format('YYYY-MM-DD');

//     for (let i = 0; i < segmentosResponse.length; i++) {
//       const currentSegmento = segmentosResponse[i].segmento;

//       // Mover la declaración de const [peso] aquí para asegurarse de que currentSegmento esté definido
//       const [peso] = await pool.query(pesos, [currentSegmento]);

//       const [pesototal] = await pool.query(consulta, [currentSegmento]);
//       const total = pesototal[0].suma;
//       const sumpes = peso.reduce((acc, curr) => acc + curr.peso / total, 0) * 100;



//       for (let j = 0; j < zonas.length; j++) {
//         const [pesototal] = await pool.query(consulta, [currentSegmento]);
//         const [pesozon] = await pool.query(zonapes, [currentSegmento, zonas[j]]);
//         const [pesostot] = await pool.query(totalzon, [currentSegmento, zonas[j]]);

//         if (pesototal && pesototal.length > 0 && pesototal[0].suma !== null) {
//           const sumzon = pesozon.reduce((acc, curr) => acc + curr.peso / total, 0) * 100;

//           let zona = pesostot.reduce((acc, curr) => acc + curr.peso / total, 0) * 100;
//           let pesozona = pesostot.reduce((acc, curr) => acc + curr.peso, 0);

//           console.log("......................................");
//           console.log("");
//           // Verifica si las variables no están vacías antes de imprimir
//           if (sumpes || sumzon || total || zona || pesozona) {
//             console.log('Porcentaje total para todas las unidades operativas:', sumpes);
//             console.log('Porcentaje total para la zona específica:', sumzon);
//             console.log('Este es el porcentaje de la zona', zona);
//             console.log('Peso total:', total);
//             console.log('Peso de la zona', pesozona);
//             let igualZon = sumzon * 100 / zona;
//             console.log("Porcentaje de cumplimiento de la zona", igualZon);
//             console.log("fecha de insercion ",fechaActual )

//             console.log(currentSegmento);
//             console.log(zonas[j]);
            
//             // Reemplaza 'nombre_de_tabla' con el nombre real de tu tabla
           
//           } else {
//             console.log('Una o más variables están vacías. Saltando a la siguiente posición.');
//             // Salta a la siguiente iteración del bucle cuando se encuentra un error
//             continue;
//           }
//           console.log("......................................");
//           console.log("");
          
//           // Puedes agregar más código adicional aquí según tus requisitos.

//         } else {
//           console.log('Error al obtener el peso total. Saltando a la siguiente posición.');
//           // Salta a la siguiente iteración del bucle cuando se encuentra un error
//           continue;
//         }
      

//       }
//       // console.log("insercion de nacional")
//       // console.log("segmento", currentSegmento);
//       // console.log("nacional")
//       // console.log("cumplimiento",sumpes)
//       // console.log("fecha de insercion", fechaActual)

//     }
//     // Asegúrate de que la respuesta se envíe solo después de que los bucles hayan completado
//     res.status(200).json({ message: 'Ejecutado con éxito la insercion hacia a tabla de hostorial' });

//   } catch (error) {
//     console.error('Error en la consulta:', error);
//     res.status(500).json({ message: 'Error en la consulta de estadísticas' });
//   }
// };


controllersLogica.estadistica = async (req, res) => {
  const { nombrezona, segmento } = req.body;
  try {
    // Consulta para obtener el peso total para el segmento
    let consulta = `
      SELECT SUM(peso) AS suma 
      FROM unidad_operativa 
      JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
      JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
      WHERE estatus != 'No aplica' AND estatus != '' AND segmento = ? AND activo =1;`;

    // Consulta para obtener el peso total para el segmento y estatus 'Vigente'
    let pesos = `
      SELECT peso 
      FROM unidad_operativa 
      JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
      JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
      WHERE estatus != 'No aplica' AND estatus != '' AND estatus = 'Vigente' AND segmento = ? AND activo =1;`;

    // Consulta para obtener el peso total para el segmento, estatus 'Vigente' y zona específica
    let zonapes = `
      SELECT peso 
      FROM unidad_operativa 
      JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
      JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
      WHERE estatus != 'No aplica' AND estatus != '' AND estatus = 'Vigente' AND segmento = ? AND zona = ? AND activo =1;`;

    let totalzon =`SELECT peso 
    FROM unidad_operativa 
    JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
    JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
    WHERE estatus != 'No aplica' AND estatus != '' AND segmento = ? AND zona = ? AND activo =1;`;


    const [pesototal] = await pool.query(consulta, [segmento]);
    const [peso] = await pool.query(pesos, [segmento]);
    const [pesozon] = await pool.query(zonapes, [segmento, nombrezona]);

    const [pesostot]= await pool.query(totalzon,[segmento,nombrezona])

    if (pesototal && pesototal.length > 0 && pesototal[0].suma !== null) {
      const total = pesototal[0].suma;

      // Calcular porcentaje del peso total para todas las unidades operativas
      let sumpes = peso.reduce((acc, curr) => acc + curr.peso / total, 0) * 100;

      // Calcular porcentaje del peso total para la zona específica
      let sumzon = pesozon.reduce((acc, curr) => acc + curr.peso / total, 0) * 100;

      // calcula el porcentaje de la zona
      let zona =0;
      let pesozona=0;
      for ( let i =0; i<pesostot.length; i++){
        zona += pesostot[i].peso / total ;
      }
      for ( let i =0; i<pesostot.length; i++){
        pesozona += pesostot[i].peso ;
      }
     zona =zona*100

      console.log('Porcentaje total para todas las unidades operativas:', sumpes);
      console.log('Porcentaje total para la zona específica:', sumzon);
      console.log('Este es el pórcentaje de la zona',zona)
      console.log('Peso total:', total);
      console.log("peso de la zona",pesozona)
      const igualZon= sumzon*100/zona


      
       console.log(igualZon)

       const porcentajes={
        nomzon:nombrezona,
        nomsesegmento:segmento,
        zonaporcentaje:igualZon,
        nacional:sumpes
       };
       res.status(200).json(porcentajes)
      // res.status(200).json({ message: 'Se ejecutó con éxito', total });

    } else {
      console.log('No se pudo obtener el peso total.');
      res.status(500).json({ message: 'Error al obtener el peso total' });
    }
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ message: 'Error en la consulta de estadísticas' });
  }
};



controllersLogica.zonas = async (req, res) => {
  const zonas = `SELECT 
    segmento,
    SUM(Centro) AS Centro,
    SUM(Pacífico) AS Pacífico,
    SUM(Noreste) AS Noreste,
    SUM(Sureste) AS Sureste,
    SUM(Centro + Pacífico + Noreste + Sureste) AS Total
FROM (
    SELECT 
        segmento,
        SUM(CASE WHEN zona = 'Centro' and activo=1 THEN porcentaje_cumplimiento ELSE 0 END) / 
            NULLIF((SELECT COUNT(id_planta) FROM unidad_operativa WHERE segmento = uo.segmento AND zona = 'Centro'), 0) AS "Centro",
        SUM(CASE WHEN zona = 'Pacifico' and activo=1 THEN porcentaje_cumplimiento ELSE 0 END) / 
            NULLIF((SELECT COUNT(id_planta) FROM unidad_operativa WHERE segmento = uo.segmento AND zona = 'Pacífico'), 0) AS "Pacífico",
        SUM(CASE WHEN zona = 'Noreste' and activo=1 THEN porcentaje_cumplimiento ELSE 0 END) / 
            NULLIF((SELECT COUNT(id_planta) FROM unidad_operativa WHERE segmento = uo.segmento AND zona = 'Noreste'), 0) AS "Noreste",
        SUM(CASE WHEN zona = 'Sureste' and activo=1 THEN porcentaje_cumplimiento ELSE 0 END) / 
            NULLIF((SELECT COUNT(id_planta) FROM unidad_operativa WHERE segmento = uo.segmento AND zona = 'Sureste'), 0) AS "Sureste"
    FROM unidad_operativa uo
    WHERE 
        zona IN ('Centro', 'Pacífico', 'Noreste', 'Sureste') AND 
        segmento IN ('Cadena de suministro', 'Industriales', 'Inmuebles no operativos', 'Operaciones', 'Transporte', 'Promexma', 'Constructores')
    GROUP BY segmento
) AS Subconsulta
GROUP BY segmento
ORDER BY segmento;`;

  const [zon] = await pool.query(zonas);

  res.json(zon);
  console.log("");
  console.log(zon);
  console.log("")
};

controllersLogica.vencida = async (req, res) => {
  try {
    const { zona, segmento, impacto } = req.body;
    const [rows] = await pool.query(
      `
            SELECT
                unidad_operativa.nombre_planta,
                requerimiento.siglas,
                requerimiento.impacto,
                registro.estatus,
                unidad_operativa.porcentaje_cumplimiento
            FROM
                unidad_operativa
            JOIN
                registro ON unidad_operativa.id_planta = registro.id_planta
            JOIN
                requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
            WHERE
                zona = ?
                AND segmento = ?
                AND estatus != 'Vigente' and estatus != 'No Aplica'
                AND impacto = ?`,
      [zona, segmento, impacto]
    );

    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res.status(404).json({
        message: "No se encontraron datos",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "No se pudo acceder a la base de datos",
    });
  }
};

controllersLogica.vigente = async (req, res) => {
  try {
    const { zona, segmento } = req.body;
    const [rows] = await pool.query(
      `SELECT unidad_operativa.nombre_planta, 
      requerimiento.siglas, 
      unidad_operativa.porcentaje_cumplimiento 
FROM unidad_operativa
JOIN registro ON unidad_operativa.id_planta = registro.id_planta
JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
WHERE unidad_operativa.id_planta NOT IN (
   SELECT DISTINCT unidad_operativa.id_planta
   FROM unidad_operativa
   JOIN registro ON unidad_operativa.id_planta = registro.id_planta
   JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
   WHERE requerimiento.impacto IN ('Clausura Total', 'Multa')
     AND registro.estatus != 'Vigente' and registro.estatus != 'No Aplica'
   
)
AND unidad_operativa.zona = ?
AND unidad_operativa.segmento = ?;`,
      [zona, segmento]
    );

    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res.status(404).json({
        message: "No se encontraron datos",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "No se pudo conectar al servidor",
    });
  }
};











controllersLogica.NoTramitables = async (req, res) => {
  try {
    console.log('Cuerpo de la solicitud:', req.body); // Imprime el cuerpo de la solicitud recibida desde el frontend

    const { zona, segmento } = req.body;

    const sentencia = `
      SELECT COUNT(DISTINCT uo.id_planta) AS cantidad_plantas
      FROM unidad_operativa uo
      INNER JOIN registro reg ON uo.id_planta = reg.id_planta
      WHERE uo.activo = true
      AND uo.zona = ?
      AND uo.segmento = ?
      AND reg.estatus = 'No tramitable';
    `;

    const [NoT] = await pool.query(sentencia, [zona, segmento]);

    res.json(NoT);
    console.log('ESTO RESPONDE MI ENDPOINT',NoT);
  } catch (error) {
    console.error('Error al realizar la consulta:', error);
    res.status(500).json({ error: 'Error al realizar la consulta' });
  }
};
controllersLogica.NoTramitablesTabla = async (req, res) => {
  try {
    const { zona, segmento } = req.body;
    const [rows] = await pool.query(
      `select nombre_planta, siglas, nombre_requerimiento, estatus,porcentaje_cumplimiento
      FROM unidad_operativa uo
      INNER JOIN registro reg ON uo.id_planta = reg.id_planta
      INNER JOIN requerimiento req ON req.id_requerimiento = reg.id_requerimiento
      WHERE uo.activo = true
      AND uo.zona = ?
      AND uo.segmento = ?
      AND reg.estatus = 'No tramitable';`,
      [zona, segmento]
    );

    if (rows.length > 0) {
      res.status(200).json(rows);
    } else {
      res.status(404).json({
        message: "No se encontraron datos",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "No se pudo conectar al servidor",
    });
  }
};
module.exports = controllersLogica;
