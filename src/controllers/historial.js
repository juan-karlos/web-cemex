const pool = require("../database");
const fs = require("fs");
const cron = require("node-cron");
const schedule = require("node-schedule");

async function insertar() {
  try {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    const fecha = `${year}-${month < 10 ? "0" : ""}${month}-${
      day < 10 ? "0" : ""
    }${day}`;
    console.log(fecha);
    const datos = `
      SELECT 
        segmento,
        zona,
        SUM(CASE 
          WHEN segmento = 'Cadena de suministro' THEN porcentaje_cumplimiento
          WHEN segmento = 'Industriales' THEN porcentaje_cumplimiento
          WHEN segmento = 'Inmuebles no operativos' THEN porcentaje_cumplimiento
          WHEN segmento = 'Operaciones' THEN porcentaje_cumplimiento
          WHEN segmento = 'Transporte' THEN porcentaje_cumplimiento
          WHEN segmento = 'Promexma' THEN porcentaje_cumplimiento
          WHEN segmento = 'Constructores' THEN porcentaje_cumplimiento
          ELSE 0
        END) / COUNT(id_planta) AS resultados
      FROM unidad_operativa 
      WHERE zona IN ('Centro', 'Noreste', 'Sureste', 'Pacífico')
      GROUP BY zona, segmento;`;

    const insertarQuery = `
      INSERT INTO historial(segmento, zona, cumplimiento, fecha) VALUES (?, ?, ?, ?);`;

    const [respuesta] = await pool.query(datos);

    for (let i = 0; i < respuesta.length; i++) {
      const resultados = {
        segmento: respuesta[i].segmento,
        zona: respuesta[i].zona,
        resultado: respuesta[i].resultados,
        // fecha: fecha
      };

      await pool.query(insertarQuery, [
        respuesta[i].segmento,
        respuesta[i].zona,
        respuesta[i].resultados,
        fecha,
      ]);

      console.log(resultados);
    }

    console.log("Se insertaron los datos correctamente.");
  } catch (excepcion) {
    console.error(excepcion);
    res.status(500).json({ mesage: "no se pudo correr el job" });
  }
}

async function insertNal() {
  try {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    const fecha = `${year}-${month < 10 ? "0" : ""}${month}-${
      day < 10 ? "0" : ""
    }${day}`;
    console.log(fecha);

    const datosQuery = `
       SELECT 
        segmento,
        SUM(CASE 
          WHEN segmento = 'Cadena de suministro' THEN porcentaje_cumplimiento
          WHEN segmento = 'Industriales' THEN porcentaje_cumplimiento
          WHEN segmento = 'Inmuebles no operativos' THEN porcentaje_cumplimiento
          WHEN segmento = 'Operaciones' THEN porcentaje_cumplimiento
          WHEN segmento = 'Transporte' THEN porcentaje_cumplimiento
          WHEN segmento = 'Promexma' THEN porcentaje_cumplimiento
          WHEN segmento = 'Constructores' THEN porcentaje_cumplimiento
          ELSE 0
        END) / COUNT(id_planta) AS resultados
      FROM unidad_operativa 
      GROUP BY segmento;
    `;

    const insertarQuery = `
      INSERT INTO historial(segmento, zona, cumplimiento, fecha) VALUES (?, ?, ?, ?);`;

    const [respuesta] = await pool.query(datosQuery);
    const total = 'Nacional';

    for (let i = 0; i < respuesta.length; i++) {
      const resultados = {
        segmento: respuesta[i].segmento,
        zona: total,
        resultado: respuesta[i].resultados,
        // fecha: fecha
      };

      await pool.query(insertarQuery, [
        respuesta[i].segmento,
        total,
        respuesta[i].resultados,
        fecha,
      ]);

      console.log(resultados);
    }

    console.log("Se insertaron los datos correctamente.");
  } catch (excepcion) {
    console.error(excepcion);
    res.status(500).json({ message: "No se pudo ejecutar el job" });
  }
}



const currentDate = new Date();
const ultimoDiaDelMes = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() + 1,
  0
);
const monthCron = ultimoDiaDelMes.getMonth() + 1;

const fechaFormateada = `50 23 L ${monthCron} *`;
const fechaFormateada2 = `52 23 L ${monthCron} *`;
// schedule.scheduleJob(fechaFormateada, insertar);
// schedule.scheduleJob(fechaFormateada2,insertNal)
const controllerHistorial = {};

controllerHistorial.insertarHitorial = async (req, res) => {
  try {
    // Query to get the total weight for the segment
    let consulta = `
      SELECT SUM(peso) AS suma 
      FROM unidad_operativa 
      JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
      JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
      WHERE estatus != 'No aplica' AND estatus != '' AND segmento = ?;`;

    // Query to get the total weight for the segment with 'Vigente' status
    let pesos = `
      SELECT peso 
      FROM unidad_operativa 
      JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
      JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
      WHERE estatus != 'No aplica' AND estatus != '' AND estatus = 'Vigente' AND segmento = ?;`;

    // Query to get the total weight for the segment, 'Vigente' status, and specific zone
    let zonapes = `
      SELECT peso 
      FROM unidad_operativa 
      JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
      JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
      WHERE estatus != 'No aplica' AND estatus != '' AND estatus = 'Vigente' AND segmento = ? AND zona = ?;`;

    // Query to get the total weight for the segment and specific zone
    let totalzon = `
      SELECT peso 
      FROM unidad_operativa 
      JOIN registro ON unidad_operativa.id_planta = registro.id_planta 
      JOIN requerimiento ON registro.id_requerimiento = requerimiento.id_requerimiento
      WHERE estatus != 'No aplica' AND estatus != '' AND segmento = ? AND zona = ?;`;

    let segmentosQuery = 'SELECT DISTINCT segmento FROM unidad_operativa;';

    const [segmentosResponse] = await pool.query(segmentosQuery);

    const zonas = ['Noreste', 'Sureste', 'Pacífico', 'Centro'];

    //se consigue la fecha del sistema

    const fechaActual = moment().format('YYYY-MM-DD');

    for (let i = 0; i < segmentosResponse.length; i++) {
      const currentSegmento = segmentosResponse[i].segmento;

      // Mover la declaración de const [peso] aquí para asegurarse de que currentSegmento esté definido
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

          let zona = pesostot.reduce((acc, curr) => acc + curr.peso / total, 0) * 100;
          let pesozona = pesostot.reduce((acc, curr) => acc + curr.peso, 0);

          console.log("......................................");
          console.log("");
          // Verifica si las variables no están vacías antes de imprimir
          if (sumpes || sumzon || total || zona || pesozona) {
            console.log('Porcentaje total para todas las unidades operativas:', sumpes);
            console.log('Porcentaje total para la zona específica:', sumzon);
            console.log('Este es el porcentaje de la zona', zona);
            console.log('Peso total:', total);
            console.log('Peso de la zona', pesozona);
            let igualZon = sumzon * 100 / zona;
            console.log("Porcentaje de cumplimiento de la zona", igualZon);
            console.log("fecha de insercion ",fechaActual )

            console.log(currentSegmento);
            console.log(zonas[j]);
            
            // Reemplaza 'nombre_de_tabla' con el nombre real de tu tabla
            if(!isNaN(igualZon)){
              await pool.query("INSERT INTO historial(segmento, zona, cumplimiento, fecha) VALUES (?, ?, ?, ?)", [currentSegmento, zonas[j], igualZon, fechaActual]);
            }
          } else {
            console.log('Una o más variables están vacías. Saltando a la siguiente posición.');
            // Salta a la siguiente iteración del bucle cuando se encuentra un error
            continue;
          }
          console.log("......................................");
          console.log("");
          
          // Puedes agregar más código adicional aquí según tus requisitos.

        } else {
          console.log('Error al obtener el peso total. Saltando a la siguiente posición.');
          // Salta a la siguiente iteración del bucle cuando se encuentra un error
          continue;
        }
      

      }
      console.log("insercion de nacional")
      console.log("segmento", currentSegmento);
      console.log("nacional")
      console.log("cumplimiento",sumpes)
      console.log("fecha de insercion", fechaActual)
      if(!isNaN(sumpes)){
        await pool.query("INSERT INTO historial(segmento, zona, cumplimiento, fecha) VALUES (?, ?, ?, ?)", [currentSegmento, "Nacional", sumpes, fechaActual]);
      }
    }
    // Asegúrate de que la respuesta se envíe solo después de que los bucles hayan completado
    res.status(200).json({ message: 'Ejecutado con éxito la insercion hacia a tabla de hostorial' });

  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ message: 'Error en la consulta de estadísticas' });
  }
};
// controllerHistorial.insertarHitorial = async (req, res) => {
//   const { segmento, zona, cumplimiento, fecha } = req.body;
//   try {
//     await pool.query(
//       "INSERT INTO historial (segmento, zona, cumplimiento, fecha)VALUES (?,?,?,?)"[
//         (segmento, zona, cumplimiento, fecha)
//       ]
//     );
//     res.json("estatus guardado");
//   } catch (excepcion) {
//     res.status(500).json("hubo un herror en la coneccion");
//   }
// };

controllerHistorial.buseg = async (req, res) => {
  const segmento = req.body;
  try {
    const [segmentos] = await pool.query(
      "SELECT * FROM historia WHERE segmento =?"[segmento]
    );
    if (segmento != "") {
      res.json(segmento);
    } else {
      res.json("no se encontraron datos");
    }
  } catch (excepcion) {
    res.status(500).json("hubo un error");
  }
};

controllerHistorial.buzon = async (req, res) => {
  const zona = req.body;
  try {
    const [zonas] = await pool.query("SELECT * FROM historial WHERE =?", [
      zona,
    ]);
    if (zona != "") {
      res.json(zonas);
    } else {
      res.json("No se encontro ningun segemnto");
    }
  } catch (excepcion) {
    res.status(500).json("erro");
  }
};

controllerHistorial.buscumpli = async (req, res) => {
  const cumplimiento = req.body;
  try {
    const [cumplimientos] = await pool.query(
      "SELECT * FROM historial WHERE =?",
      [cumplimiento]
    );
    if (cumplimientos != "") {
      res.json(cumplimientos);
    } else {
      res.json("no se encontraron datos");
    }
  } catch (excepcion) {
    res.status(500).json("error");
  }
};

controllerHistorial.busfecha = async (req, res) => {
  const fecha = req.body;
  try {
    const fe = fecha + "%";
    const [fechas] = await pool.query("SELEC * FROM hitorial WHERE =?  ", [fe]);
    if (fechas != "") {
      res.json(fechas);
    } else {
      res.json("no se encontro ningun reguistro");
    }
  } catch (excepcion) {
    res.status(500).json("error");
  }
};

controllerHistorial.zonaSegmento = async (req, res) => {
  const { zona, segmento } = req.body;
  console.log(zona, segmento);
  try {
    console.log("Datos de la solicitud:", zona, segmento);

    const [cumplimiento] = await pool.query(
      "SELECT * FROM historial WHERE zona = ? and segmento = ?",
      [zona, segmento]
    );

    console.log("Resultado de la consulta:", cumplimiento);

    res.json(cumplimiento);
  } catch (excepcion) {
    console.error("Error en el backend:", excepcion);
    res.status(500).json("error");
  }
};

controllerHistorial.actualizar = async (req, res) => {
  const { segmento } = req.body;

  try {
    console.log("Datos de la solicitud:", segmento);

    const [cumplimiento] = await pool.query(
      "SELECT * FROM historial WHERE segmento = ?",
      [segmento]
    );

    console.log("Resultado de la consulta:", cumplimiento);

    res.json(cumplimiento);
  } catch (excepcion) {
    console.error("Error en el backend:", excepcion);
    res.status(500).json("error");
  }
};

controllerHistorial.obtenerMesPasado = async (req, res) => {
  const { segmento } = req.body;

  try {
    const currentDate = new Date();
    const lastMonth = new Date(currentDate);
    lastMonth.setMonth(currentDate.getMonth() - 1);

    const query =
      "SELECT zona, cumplimiento FROM historial WHERE segmento = ? AND MONTH(fecha) = ? AND YEAR(fecha) = ?";
    const [cumplimiento] = await pool.query(query, [
      segmento,
      lastMonth.getMonth() + 1,
      lastMonth.getFullYear(),
    ]);

    res.json(cumplimiento);
  } catch (excepcion) {
    console.error("Error en el backend:", excepcion);
    res.status(500).json("error");
  }
};
controllerHistorial.insertHistorial = async (req, res) => {
  const currentDate = new Date();
  let datos = `SELECT 
           segmento,
           zona,
           CASE 
               WHEN segmento = 'Cadena de suministro' THEN SUM(porcentaje_cumplimiento) / COUNT(id_planta)
               WHEN segmento = 'Industriales' THEN SUM(porcentaje_cumplimiento) / COUNT(id_planta)
               WHEN segmento = 'Inmuebles no operativos' THEN SUM(porcentaje_cumplimiento) / COUNT(id_planta)
               WHEN segmento = 'Operaciones' THEN SUM(porcentaje_cumplimiento) / COUNT(id_planta)
               WHEN segmento = 'Transporte' THEN SUM(porcentaje_cumplimiento) / COUNT(id_planta)
               WHEN segmento = 'Promexma' THEN SUM(porcentaje_cumplimiento) / COUNT(id_planta)
               WHEN segmento = 'Constructores' THEN SUM(porcentaje_cumplimiento) / COUNT(id_planta)
               ELSE 0
           END AS resultados
        FROM unidad_operativa
        WHERE zona IN ('Centro', 'Noreste', 'Sureste', 'Pacífico')
        GROUP BY zona, segmento;`;

  const insertar = `
        INSERT INTO historial(segmento,zona,cumplimiento,fecha)  values (?,?,?,?) 
        `;
  try {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();

    let fecha = `${year}-${month}-${day}`;
    console.log(fecha);

    const [respuesta] = await pool.query(datos);
    for (let i = 0; i < respuesta.length; i++) {
      resultados = {
        segmento: respuesta[i].segmento,
        zona: respuesta[i].zona,
        resultado: respuesta[i].resultados,
        fecha: fecha,
      };

      console.log(resultados);
    }
    res.json("se inserto");
  } catch (exepcion) {
    res.status(500).json({ message: "error del servidor" });
  }
};

module.exports = controllerHistorial;
