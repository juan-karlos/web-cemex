const pool = require("../database");

const controladorRequerimiento = {};
const recid = /(\d+)/g;

controladorRequerimiento.obtenerRequerimiento = async (req, res) => {
  const [todreg] = await pool.query("select * from requerimiento");
  res.json(todreg);
};

controladorRequerimiento.insertarRequerimiento = async (req, res) => {
  const { nom_req, peso, impacto, siglas } = req.body;
  try {
    const [regis] = await pool.query(
      "INSERT INTO requerimiento (nombre_requerimiento,peso,impacto,siglas) VALUES (?,?,?,?)",
      [nom_req, peso, impacto, siglas]
    );
    res.json({ status: "cliente insertado" });
  } catch (Excepcion) {
    res
      .status(500)
      .json({ message: "El nombre del requerimineto ya esta insertado" });
  }
};

controladorRequerimiento.obtenerUnRequerimiento = async (req, res) => {
  const id_rec = { id_requerimiento: req.params.cb };
  id = JSON.stringify(id_rec);
  const recid = /(\d+)/g;
  const idrecu = id.match(recid);

  try {
    const [id_req] = await pool.query(
      "Select * from requerimiento WHERE id_requerimiento = ?",
      [idrecu]
    );
    if (id_req != "") {
      res.send(id_req);
    } else {
      res.status(404).json({ message: "No se encontro el requerimiento" });
    }
  } catch (Excepcion) {
    res.status(500).json({ message: "error interno" });
  }
};

controladorRequerimiento.actualizarRequerimiento = async (req, res) => {
  const idact = { id_requerimiento: req.params.cb };
  const { nom_req, peso, impacto, siglas } = req.body;

  id = JSON.stringify(idact);
  const recid = /(\d+)/g;
  let idrecu = id.match(recid);
  idrecu = idrecu.join();
  let ids = parseInt(idrecu, 10);

  try {
    const [id_req] = await pool.query(
      "select * from requerimiento where id_requerimiento= ?",
      [ids]
    );
    if (id_req != "") {
      await pool.query(
        `update requerimiento set nombre_requerimiento=ifNULL(?,nombre_requerimiento), peso=ifNULL(?,peso), impacto=ifNULL(?,impacto), siglas=ifNULL(?,siglas) where id_requerimiento= ?`,
        [nom_req, peso, impacto, siglas, ids]
      );
      res.json("Actualizacion del requerimiento exitosa");
    } else {
      res.status(404).json({ message: "No se encuentra en la base de datos" });
      console.log(
        "no se encuentra en la base de datos lo que intentas actualizar"
      );
    }
  } catch {
    res.send(500).json({ message: "error interno" });
  }
};

controladorRequerimiento.eliminarRequerimiento = async (req, res) => {
  try {
    const nom = req.body.nombre;
    const [nombreR] = await pool.query(
      "select id_requerimiento from requerimiento where nombre_requerimiento = ?",
      [nom]
    );
    id = JSON.stringify(nombreR);
    const idrequ = id.match(recid);
    const [rows] = await pool.query(
      "Delete from requerimiento where id_requerimiento=?",
      [idrequ]
    );
    if (rows.affectedRows >= 1) {
      res.status(200).json("Eliminacion exito");
    } else {
      res.status(404).json("El requerimiento a eliminar no fue encontrado");
    }
  } catch (Excepcion) {
    res.status(500).json("No se pudo conectar a la base de datos");
  }
};

controladorRequerimiento.nacional = async (req, res) => {
  let sentencia = [];
  let query = `SELECT COUNT(id_registro) AS plantas_encontradas, nombre_requerimiento
    FROM registro, unidad_operativa, requerimiento
    WHERE unidad_operativa.id_planta = registro.id_planta
    AND requerimiento.id_requerimiento = registro.id_requerimiento
    AND estatus != 'Vigente'
    AND nombre_requerimiento = ?; `;

  const [requerimientos] = await pool.query("SELECT * FROM requerimiento");

  for (const requerimiento of requerimientos) {
    const nombre = requerimiento.nombre_requerimiento;
    const [result] = await pool.query(query, [nombre, nombre]);
    const conteo = result[0].plantas_encontradas; // Cambiar esto si necesitas otro campo

    const jos = {
      permiso: nombre,
      plantas: conteo,
    };
    sentencia.push(jos);
  }

  console.log(sentencia);
  res.json(sentencia);
};

controladorRequerimiento.conteo = async (req, res) => {
  const reqi = req.body.segmento;
  try {
    const query = `
            SELECT 
                nombre_requerimiento,
                zona,
                COUNT(id_registro) AS plantas_encontradas
            FROM 
                registro
            RIGHT JOIN 
            
                unidad_operativa ON unidad_operativa.id_planta = registro.id_planta
            RIGHT JOIN 
                requerimiento ON requerimiento.id_requerimiento = registro.id_requerimiento
            WHERE 
                estatus != 'Vigente' and segmento =? and estatus!='No Aplica'
            GROUP BY 
                nombre_requerimiento, zona; `;

    const [results] = await pool.query(query, [reqi]);
    const sentencia = [];

    // Obtener todos los nombres de requerimientos únicos
    const nombresRequerimientos = [
      ...new Set(results.map((row) => row.nombre_requerimiento)),
    ];

    // Iterar sobre cada nombre de requerimiento
    for (const nombre of nombresRequerimientos) {
      // Filtrar resultados por nombre de requerimiento
      const resultadosRequerimiento = results.filter(
        (row) => row.nombre_requerimiento === nombre
      );

      const jos = {
        nombre: nombre,
        plantaspas: 0,
        plantascen: 0,
        plantnor: 0,
        plantsur: 0,
        plantasgen: 0,
      };

      // Iterar sobre los resultados del requerimiento actual
      for (const resultado of resultadosRequerimiento) {
        // Sumar los resultados según la zona
        switch (resultado.zona) {
          case "Pacifico":
            jos.plantaspas += resultado.plantas_encontradas;
            break;
          case "Centro":
            jos.plantascen += resultado.plantas_encontradas;
            break;
          case "Noreste":
            jos.plantnor += resultado.plantas_encontradas;
            break;
          case "Sureste":
            jos.plantsur += resultado.plantas_encontradas;
            break;
        }

        // Sumar los resultados para plantas generales
        jos.plantasgen += resultado.plantas_encontradas;
      }

      sentencia.push(jos);
    }

    // Agregar nombres de requerimientos sin datos asociados
    const nombresSinDatos = nombresRequerimientos.filter(
      (nombre) => !sentencia.some((item) => item.nombre === nombre)
    );
    for (const nombreSinDatos of nombresSinDatos) {
      sentencia.push({
        nombre: nombreSinDatos,
        plantaspas: 0,
        plantascen: 0,
        plantnor: 0,
        plantsur: 0,
        plantasgen: 0,
      });
    }

    console.log("Suma de segmentos Enviado conexito");
    res.json(sentencia);
  } catch (error) {
    console.error("Error en la consulta:", error);
    res.status(500).send("Error en el servidor");
  }
};

controladorRequerimiento.Conteozonas = async (req, res) => {
  const segmento = req.body.segmento;
  const zonas = `SELECT  
    SUM(CASE WHEN zona='Centro' AND estatus != 'Vigente' and estatus!='No Aplica' THEN 1 ELSE 0 END) AS 'Centro',
    SUM(CASE WHEN zona='Noreste' AND estatus != 'Vigente' and estatus!='No Aplica' THEN 1 ELSE 0 END) AS 'Noreste',
    SUM(CASE WHEN zona='Pacífico' and estatus != 'Vigente' and estatus!='No Aplica' THEN 1 ELSE 0 END) as 'Pasifico',
    SUM(CASE WHEN zona='Sureste' AND estatus != 'Vigente' and estatus!='No Aplica' THEN 1 ELSE 0 END) AS 'Sureste',
    SUM(CASE WHEN (zona ='Centro' OR zona='Pacífico' OR zona='Sureste' OR zona ='Noreste') AND estatus != 'Vigente' and estatus!='No Aplica' THEN 1 ELSE 0 END) AS 'total'
  FROM registro
  JOIN unidad_operativa ON registro.id_planta = unidad_operativa.id_planta
  WHERE segmento=?;
    `;
  try {
    const [zonasconteo] = await pool.query(zonas, [segmento]);
    res.json(zonasconteo);
    console.log(zonasconteo);
    console.log("Zonas enviadas");
  } catch (esepcion) {
    console.log(esepcion);
    res.status(500).json({ message: "hay un error en el servido" });
  }
};

controladorRequerimiento.cumplimiento = async (req, res) => {
  try {
    const resultados = {};

    const [plantas] = await pool.query(
      "SELECT DISTINCT(nombre_planta) FROM unidad_operativa"
    );

    for (const planta of plantas) {
      const nombrePlanta = planta.nombre_planta;

      const [conteo] = await pool.query(
        `
                SELECT SUM(peso) as totalAQcapulco
                FROM unidad_operativa, registro, requerimiento 
                WHERE estatus="Vigente" AND nombre_planta = ? AND 
                unidad_operativa.id_planta = registro.id_planta AND 
                registro.id_requerimiento = requerimiento.id_requerimiento
            `,
        [nombrePlanta]
      );

      const [conteototal] = await pool.query(
        `
                SELECT SUM(peso) as total
                FROM unidad_operativa, registro, requerimiento 
                WHERE estatus="Vigente" AND nombre_planta = ? AND 
                unidad_operativa.id_planta = registro.id_planta AND 
                registro.id_requerimiento = requerimiento.id_requerimiento
            `,
        [nombrePlanta]
      );

      const resultadoOperacion =
        (conteototal[0].total / conteo[0].totalAQcapulco) * 100;

      // Asignar el resultado a la propiedad correspondiente en el objeto resultados
      resultados[nombrePlanta] = resultadoOperacion;
    }

    console.log(resultados);
    res.json(resultados);
  } catch (error) {
    console.error("Error en el método cumplimiento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// HACEMOS LA SUMA DEL PESO DE TODOS LOS REQUERIMIENTOS TOTALES QUE HAY EN LA BASE DE DATOS DE UNA SOLA PLANTA
// DESPUES HACEMOS LA SUMA DE TODOS LOS REQUERIMINETOS TOTALES QUE ESTAN EN VIGENTE DE UNA SOLA PLANTA
controladorRequerimiento.cumplimiento1 = async (req, res) => {
  try {
    let totalPlantas = [];

    const quer = `
            SELECT SUM(peso) as total
            FROM unidad_operativa, registro, requerimiento 
            WHERE nombre_planta = ? and estatus!= "No Aplica" AND 
            unidad_operativa.id_planta = registro.id_planta AND 
            registro.id_requerimiento = requerimiento.id_requerimiento
        `;

    const quer2 = ` SELECT SUM(peso) as parcial
        FROM unidad_operativa, registro, requerimiento 
        WHERE estatus = "Vigente" and estatus!= "No Aplica" and nombre_planta = ? AND 
        unidad_operativa.id_planta = registro.id_planta AND 
        registro.id_requerimiento = requerimiento.id_requerimiento`;

    const actualiza = `update unidad_operativa set porcentaje_cumplimiento=? where nombre_planta=?;`;

    const [plantas] = await pool.query(
      "SELECT DISTINCT(nombre_planta) FROM unidad_operativa"
    );

    for (let i = 0; i < plantas.length; i++) {
      let nombrePlanta = plantas[i].nombre_planta;

      if (typeof nombrePlanta === "number") {
        nombrePlanta = nombre_planta.toString;
      }

      const [resultado] = await pool.query(quer, [nombrePlanta]);
      const total = parseFloat(resultado[0].total);

      const [resultado2] = await pool.query(quer2, [nombrePlanta]);
      const parcial = parseFloat(resultado2[0].parcial);

      let resul = ((parcial / total) * 100).toString();

      await pool.query(actualiza, [resul, nombrePlanta]);

      totalPlantas.push({
        nombrePlanta,
        resul,
      });

      console.log(`Planta: ${nombrePlanta}, Total: ${resultado[0].total}`);
    }

    res.json(totalPlantas);
  } catch (error) {
    console.error("Error en el método cumplimiento1:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

controladorRequerimiento.porsentajeActual = async (req, res) => {
  let nombrePlanta = req.body.nombre_planta;
  try {
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

    const actualiza = `update unidad_operativa set porcentaje_cumplimiento=? where nombre_planta=?;`;

    const [resultado] = await pool.query(quer, [nombrePlanta]);
    const total = parseFloat(resultado[0].total);

    const [resultado2] = await pool.query(quer2, [nombrePlanta]);
    const parcial = parseFloat(resultado2[0].parcial);

    let resul = ((parcial / total) * 100).toString();
    console.log("se envio la peticon");

    await pool.query(actualiza, [resul, nombrePlanta]);

    const [planta] = await pool.query(
      "Select nombre_planta, porcentaje_cumplimiento From unidad_operativa where nombre_planta=?",
      [nombrePlanta]
    );
    console.log(resul);
    res.json(planta);
  } catch (error) {
    console.error("Error en el método cumplimiento1:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = controladorRequerimiento;
