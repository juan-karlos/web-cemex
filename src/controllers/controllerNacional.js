const pool = require('../database')

const controladornacional ={}

//controlador para poder contar todas las plantas a niverl nacional 
controladornacional.conteoPlantas= async(req,res)=>{
    const query = `SELECT
    SUM(CASE WHEN segmento = 'Cadena de suministro' THEN 1 ELSE 0 END) AS 'cadena_suministro',
    SUM(CASE WHEN segmento = 'Industriales' THEN 1 ELSE 0 END) AS 'industriales',
    SUM(CASE WHEN segmento = 'Inmuebles no operativos' THEN 1 ELSE 0 END) AS 'inmuebles_no_operativos',
    SUM(CASE WHEN segmento = 'Operaciones' THEN 1 ELSE 0 END) AS 'operaciones',
    SUM(CASE WHEN segmento = 'Transporte' THEN 1 ELSE 0 END) AS 'transporte',
    SUM(CASE WHEN segmento = 'Promexma' THEN 1 ELSE 0 END) AS 'Promexma',
    SUM(CASE WHEN segmento = 'Constructores' THEN 1 ELSE 0 END) AS 'constructores'
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
  const Nacional=`SELECT 
  segmento,
  SUM(Nacional) AS Nacional
FROM (
  SELECT 
      segmento,
      SUM(CASE WHEN activo=1 THEN porcentaje_cumplimiento ELSE 0 END) / 
          NULLIF((SELECT COUNT(id_planta) FROM unidad_operativa WHERE segmento = uo.segmento), 0) AS "Nacional"
  FROM unidad_operativa uo
  WHERE 
      zona IN ('Centro', 'Pacífico', 'Noreste', 'Sureste') AND 
      segmento IN ('Cadena de suministro', 'Industriales', 'Inmuebles no operativos', 'Operaciones', 'Transporte', 'Promexma', 'Constructores')
  GROUP BY segmento
) AS Subconsulta
GROUP BY segmento
ORDER BY segmento;`;

try{
  const [nacional]= await pool.query(Nacional)
  res.status(200).json(nacional)
  console.log("Se envio con exito los calculos")

  }catch(error){
    console.log(error)
    res.status(500).json({message:"Hay un error interno en el servidor"})
  };

};





