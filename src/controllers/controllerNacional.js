const pool = require('../database')

const controladornacional ={}

//controlador para poder contar todas las plantas a niverl nacional 
controladornacional.conteoPlantas= async(req,res)=>{
    const query = `SELECT
    SUM(CASE WHEN segmento = 'Cadena de suministro'  and activo!=0 THEN 1 ELSE 0 END) AS 'cadena_suministro',
    SUM(CASE WHEN segmento = 'Industriales' and activo!=0  THEN 1 ELSE 0 END) AS 'industriales',
    SUM(CASE WHEN segmento = 'Inmuebles no operativos' and activo!=0 THEN 1 ELSE 0 END) AS 'inmuebles_no_operativos',
    SUM(CASE WHEN segmento = 'Operaciones' and activo!=0  THEN 1 ELSE 0 END) AS 'operaciones',
    SUM(CASE WHEN segmento = 'Transporte' and activo!=0  THEN 1 ELSE 0 END) AS 'transporte',
    SUM(CASE WHEN segmento = 'Promexma' and activo!=0 THEN 1 ELSE 0 END) AS 'Promexma',
    SUM(CASE WHEN segmento = 'Constructores' and activo!=0 THEN 1 ELSE 0 END) AS 'constructores'
  FROM unidad_operativa;`;

  try {
    const [Nacional] = await pool.execute(query);
    res.json(Nacional);
  } catch (exepcion) {
    console.log(exepcion);
    res.status(500).json({ message: "error interno" });
  }
};

// estadisticas de nivel nacional para las graficas de linias

controladornacional.estadisticaNacional=async(req,res)=>{
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
    let resultadosArray = [];

    for (let i = 0; i < segmentosResponse.length; i++) {
      const currentSegmento = segmentosResponse[i].segmento;
      const [peso] = await pool.query(pesos, [currentSegmento]);
      const [pesototal] = await pool.query(consulta, [currentSegmento]);
      const total = pesototal[0].suma;
      const sumpes = peso.reduce((acc, curr) => acc + curr.peso / total, 0) * 100;

      for (let j = 0; j < zonas.length; j++) {
        zonass=zonas[i]
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
            console.log(currentSegmento);
            console.log(zonas[j]);
            console.log("");
            let igualZon = sumzon * 100 / zona;
            if (isNaN(igualZon)) {
              igualZon = 0;
            }
            console.log("Porcentaje de cumplimiento de la zona", igualZon);

            // Almacenar los resultados en un objeto
            const resultadosObj = {
              nomzona:zonas[j],
              segmento: currentSegmento,
              zona:igualZon,
              nacional: sumpes
            };

            resultadosArray.push(resultadosObj);
          } else {
            console.log('Una o más variables están vacías. Saltando a la siguiente posición.');
            continue;
          }
        } else {
          console.log('Error al obtener el peso total. Saltando a la siguiente posición.');
          continue;
        }
      }

      console.log("Nacional", sumpes);
      console.log("");
    }
    console.log(resultadosArray);

  

    res.status(200).json(resultadosArray);
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).json({ message: 'Error en la consulta de estadísticas' });
  }
};

// controladornacional.estadisticaNacional=async(req,res)=>{
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
//             console.log(currentSegmento);
//             console.log(zonas[j]);
//             console.log("")
//             let igualZon = sumzon * 100 / zona;
//             if(isNaN(igualZon)){
//               igualZon=0
//             }
//             console.log("Porcentaje de cumplimiento de la zona", igualZon);
         
//           } else {
//             console.log('Una o más variables están vacías. Saltando a la siguiente posición.');
//             continue;
//           }
//         } else {
//           console.log('Error al obtener el peso total. Saltando a la siguiente posición.');
//           continue;
//         }
//       }
//       console.log("Nacional",sumpes)
//       console.log("")
//     }
//     res.status(200).json({ message: 'Ejecutado con éxito la insercion hacia a tabla de hostorial' });
//   } catch (error) {
//     console.error('Error en la consulta:', error);
//     res.status(500).json({ message: 'Error en la consulta de estadísticas' });
//   }
// };



controladornacional.insercionHistorial=async(req,res)=>{
  

}

module.exports = controladornacional;



