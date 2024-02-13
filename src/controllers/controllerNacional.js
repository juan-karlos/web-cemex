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
    const [pasifico] = await pool.execute(query);
    res.json(pasifico);
  } catch (exepcion) {
    console.log(exepcion);
    res.status(500).json({ message: "error interno" });
  }
};

