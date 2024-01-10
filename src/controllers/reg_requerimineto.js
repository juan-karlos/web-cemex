const  pool  = require("../database")

const controladorRequerimiento={}
const recid=/(\d+)/g;

//muestra todos los requerimientos
controladorRequerimiento.obtenerRequerimiento=async(req,res)=>{
    
        const [todreg]= await pool.query('select * from requerimiento');
        res.json(todreg);
  
}

//inserta un nuevo requerimiento 
controladorRequerimiento.insertarRequerimiento=async(req,res)=>{
    const {nom_req,peso,impacto,siglas}=req.body
    try{
        const [regis]= await pool.query('INSERT INTO requerimiento (nombre_requerimiento,peso,impacto,siglas) VALUES (?,?,?,?)',[nom_req,peso,impacto,siglas])
        res.json({"status":"cliente insertado"})
    }catch(Excepcion){
        res.status(500).json({message:"El nombre del requerimineto ya esta insertado"})
    }
}

//obtiene un requerimiento especifico
controladorRequerimiento.obtenerUnRequerimiento=async(req,res)=>{ 
        const id_rec=({id_requerimiento:req.params.cb});
        id=JSON.stringify(id_rec);
        const recid=/(\d+)/g;
        const idrecu= id.match(recid);
        
    try{
        const [id_req]= await pool.query('Select * from requerimiento WHERE id_requerimiento = ?',[idrecu])
            if(id_req!=""){
            res.send(id_req)
            }else{
                  res.status(404).json({message:"No se encontro el requerimiento"})
            }
    }catch(Excepcion){
        res.status(500).json({message:"error interno"})
     }
}

//actualiza los requerimientos
controladorRequerimiento.actualizarRequerimiento=async(req,res)=>{
    const idact=({id_requerimiento:req.params.cb})
    const {nom_req,peso,impacto,siglas}=req.body

    id=JSON.stringify(idact);
    const recid=/(\d+)/g;
    let idrecu= id.match(recid);
    idrecu=idrecu.join();
    let ids=parseInt(idrecu,10);

        try{
            const [id_req] = await pool.query('select * from requerimiento where id_requerimiento= ?',[ids])
            if(id_req!=""){
                await pool.query(`update requerimiento set nombre_requerimiento=ifNULL(?,nombre_requerimiento), peso=ifNULL(?,peso), impacto=ifNULL(?,impacto), siglas=ifNULL(?,siglas) where id_requerimiento= ?`,[nom_req,peso,impacto,siglas,ids])
                res.json("Actualizacion del requerimiento exitosa")
            }else{
                res.status(404).json({message:"No se encuentra en la base de datos"})
                console.log("no se encuentra en la base de datos lo que intentas actualizar")
            }
        } catch{
            res.send(500).json({message:"error interno"})
        }
       

}

//elimina uno de los requerimientos 
controladorRequerimiento.eliminarRequerimiento=async(req,res)=>{
    try{
        const nom=req.body.nombre
        const [nombreR] = await pool.query('select id_requerimiento from requerimiento where nombre_requerimiento = ?',[nom])
        id = JSON.stringify(nombreR)
        const idrequ = id.match(recid)
        const [rows] = await pool.query('Delete from requerimiento where id_requerimiento=?',[idrequ])
        if(rows.affectedRows >= 1){
            res.status(200).json("Eliminacion exito")
        }else{
            res.status(404).json("El requerimiento a eliminar no fue encontrado")
        }
    }catch(Excepcion){
        res.status(500).json("No se pudo conectar a la base de datos")
    }
}


controladorRequerimiento.nacional=async(req,res)=>{
    let sentencia = [];
    let query = `SELECT COUNT(id_registro) AS plantas_encontradas, nombre_requerimiento
    FROM registro, unidad_operativa, requerimiento
    WHERE unidad_operativa.id_planta = registro.id_planta
    AND requerimiento.id_requerimiento = registro.id_requerimiento
    AND estatus != 'Vigente'
    AND nombre_requerimiento = ?; `

//     let query =
//     `SELECT 
//     COUNT(id_registro) AS plantas_encontradas, 
//     nombre_requerimiento,
//     zona
// FROM 
//     registro
// JOIN 
//     unidad_operativa ON unidad_operativa.id_planta = registro.id_planta
// JOIN 
//     requerimiento ON requerimiento.id_requerimiento = registro.id_requerimiento
// WHERE 
//     estatus != 'Vigente'
//     AND zona IN ('Centro', 'Pacífico', 'Noreste', 'Sureste')
//     AND nombre_requerimiento = ?
// GROUP BY 
//     nombre_requerimiento, zona

// UNION

// SELECT 
//     COUNT(id_registro) AS plantas_encontradas, 
//     nombre_requerimiento,
//     NULL AS zona -- Agregamos NULL para que ambas consultas tengan el mismo número de columnas
// FROM 
//     registro
// JOIN 
//     unidad_operativa ON unidad_operativa.id_planta = registro.id_planta
// JOIN 
//     requerimiento ON requerimiento.id_requerimiento = registro.id_requerimiento
// WHERE 
//     estatus != 'Vigente'
//     AND nombre_requerimiento = ?
// GROUP BY 
//     nombre_requerimiento;`
    
    

    
    const [requerimientos] = await pool.query('SELECT * FROM requerimiento')
    
    for (const requerimiento of requerimientos) {
        const nombre = requerimiento.nombre_requerimiento;
        const [result] = await pool.query(query, [nombre,nombre]);
        const conteo = result[0].plantas_encontradas; // Cambiar esto si necesitas otro campo
    
        const jos={
            permiso:nombre,
            plantas:conteo
        };
        sentencia.push(jos);
        // sentencia [nombre]= {plantas:conteo };
        
        // console.log({ permiso: nombre, conteo });
    }

    // const respuestaJSON = JSON.stringify(sentencia);
    console.log(sentencia);
    res.json(sentencia)
    // console.log(sentencia)
    
    // const respuestaJSON = JSON.stringify(sentencia);
    // (`{${respuestaJSON.slice(1, -1)}}`);
    // console.log(respu)
    // res.json(respu)
    


//     let sentencia = [];
// let query = `SELECT COUNT(id_registro) AS plantas_encontradas, nombre_requerimiento
// FROM registro, unidad_operativa, requerimiento
// WHERE unidad_operativa.id_planta = registro.id_planta
// AND requerimiento.id_requerimiento = registro.id_requerimiento
// AND estatus != 'Vigente'
// AND nombre_requerimiento = ?; `

// const [requerimientos] = await pool.query('SELECT * FROM requerimiento')

// for (const requerimiento of requerimientos) {
//     const nombre = requerimiento.nombre_requerimiento;
//     const [result] = await pool.query(query, [nombre]);
//     const resultado = result[0].plantas_encontradas; // Cambiar esto si necesitas otro campo

//     const item = { [nombre]: resultado };
//     sentencia.push(item);
//     console.log(item);
// }

// const respuestaJSON = JSON.stringify(sentencia);
// console.log(respuestaJSON);


// let sentencia = {};
// let query = `SELECT COUNT(id_registro) AS plantas_encontradas, nombre_requerimiento
// FROM registro, unidad_operativa, requerimiento
// WHERE unidad_operativa.id_planta = registro.id_planta
// AND requerimiento.id_requerimiento = registro.id_requerimiento
// AND estatus != 'Vigente'
// AND nombre_requerimiento = ?; `

// const [requerimineto] = await pool.query('SELECT * FROM requerimiento')

// for (let i = 0; i < requerimineto.length; i++) {
//     const nombre = requerimineto[i].nombre_requerimiento;
//     const [result] = await pool.query(query, [nombre])
//     sentencia[nombre] = result[0];
//     console.log(nombre)
// }

// const respuestaJSON = JSON.stringify(sentencia);
// console.log(respuestaJSON);
// res.json(respuestaJSON)




    
//     let sentencia = [];
// let query = `SELECT COUNT(id_registro) AS plantas_encontradas
// FROM registro, unidad_operativa, requerimiento
// WHERE unidad_operativa.id_planta = registro.id_planta
// AND requerimiento.id_requerimiento = registro.id_requerimiento
// AND estatus != 'Vigente'
// AND nombre_requerimiento = ?; `

// const [requerimineto] = await pool.query('SELECT * FROM requerimiento')

// for (let i = 0; i < requerimineto.length; i++) {
//     const nombre = requerimineto[i].nombre_requerimiento;
//     const [result] = await pool.query(query, [nombre])
    
//     sentencia.push(nombre,result[0] );
//     // console.log(nombre)
// }

// const respuestaJSON = JSON.stringify(sentencia);
// console.log(respuestaJSON);
// res.json(respuestaJSON)





    // let sentencia =[];
    // let query = `SELECT COUNT(id_registro) AS plantas_encontradas, nombre_requerimiento
    // FROM registro, unidad_operativa, requerimiento
    // WHERE unidad_operativa.id_planta = registro.id_planta
    // AND requerimiento.id_requerimiento = registro.id_requerimiento
    // AND estatus != 'Vigente'
    // AND nombre_requerimiento = ?; `

    // const [requerimineto]= await pool.query('SELECT * FROM requerimiento')

    //     for(let i =0; i<requerimineto.length; i++){
    //     const nombre = requerimineto[i].nombre_requerimiento;
    //     const [result] = await pool.query
    //             (`SELECT COUNT(id_registro) AS plantas_encontradas, nombre_requerimiento
    //             FROM registro, unidad_operativa, requerimiento
    //             WHERE unidad_operativa.id_planta = registro.id_planta
    //             AND requerimiento.id_requerimiento = registro.id_requerimiento
    //             AND estatus != 'Vigente'
    //             AND nombre_requerimiento = ?; `,[nombre])
    //     // const [result]= await pool.execute(query,[nombre])
    //     sentencia.push(result)
    //     console.log(nombre)        
    //     }
    //     console.log(sentencia)
    //     res.json(sentencia)
}



//esta es la buena
// controladorRequerimiento.pasifico=async(req,res)=>{
//     let sentencia = [];
//     let query = `SELECT COUNT(id_registro) AS plantas_encontradas, nombre_requerimiento
//     FROM registro, unidad_operativa, requerimiento
//     WHERE unidad_operativa.id_planta = registro.id_planta
//     AND requerimiento.id_requerimiento = registro.id_requerimiento
//     AND estatus != 'Vigente'
//     AND nombre_requerimiento = ?; `

//     let query2 = `SELECT COUNT(id_registro) AS plantas_encontradas, nombre_requerimiento
//     FROM registro, unidad_operativa, requerimiento
//     WHERE unidad_operativa.id_planta = registro.id_planta
//     AND requerimiento.id_requerimiento = registro.id_requerimiento
//     AND estatus != 'Vigente'
//     AND zona = 'Pacífico' 
//     AND nombre_requerimiento = ?; `

//     let query3 = `SELECT COUNT(id_registro) AS plantas_encontradas, nombre_requerimiento
//     FROM registro, unidad_operativa, requerimiento
//     WHERE unidad_operativa.id_planta = registro.id_planta
//     AND requerimiento.id_requerimiento = registro.id_requerimiento
//     AND estatus != 'Vigente'
//     AND zona = 'Centro' 
//     AND nombre_requerimiento = ?; `

//     let query4 = `SELECT COUNT(id_registro) AS plantas_encontradas, nombre_requerimiento
//     FROM registro, unidad_operativa, requerimiento
//     WHERE unidad_operativa.id_planta = registro.id_planta
//     AND requerimiento.id_requerimiento = registro.id_requerimiento
//     AND estatus != 'Vigente'
//     AND zona = 'Noreste' 
//     AND nombre_requerimiento = ?;`

//     let query5 = `SELECT COUNT(id_registro) AS plantas_encontradas, nombre_requerimiento
//     FROM registro, unidad_operativa, requerimiento
//     WHERE unidad_operativa.id_planta = registro.id_planta
//     AND requerimiento.id_requerimiento = registro.id_requerimiento
//     AND estatus != 'Vigente'
//     AND zona = 'Sureste' 
//     AND nombre_requerimiento = ?; `
    
    
//     const [requerimientos] = await pool.query('SELECT * FROM requerimiento')
//     for (const requerimiento of requerimientos) {
//         const nombre = requerimiento.nombre_requerimiento;
//         const [result] = await pool.query(query, [nombre]);
//         const conteo = result[0].plantas_encontradas;
//         const [result2]= await pool.query(query2,[nombre]);
//         const conteo2= result2[0].plantas_encontradas;
//         const [result3]= await pool.query(query3,[nombre]);
//         const conteo3= result3[0].plantas_encontradas;
//         const [result4]= await pool.query(query4,[nombre]);
//         const conteo4= result4[0].plantas_encontradas;
//         const [result5]= await pool.query(query5,[nombre]);
//         const conteo5= result5[0].plantas_encontradas;
//         const jos={
//             nombre:nombre,
//             plantasgen:conteo,
//             plantaspas:conteo2,
//             plantascen:conteo3,
//             plantnor:conteo4,
//             plantsur:conteo5

//         };
//         sentencia.push(jos);
//     }
//     console.log(sentencia);
//     res.json(sentencia)
// }

// esta es la que mas se aserca
// controladorRequerimiento.conteo = async (req, res) => {
//     try {
//         const query = `
//             SELECT 
//                 nombre_requerimiento,
//                 zona,
//                 COUNT(id_registro) AS plantas_encontradas
//             FROM 
//                 registro
//             JOIN 
//                 unidad_operativa ON unidad_operativa.id_planta = registro.id_planta
//             JOIN 
//                 requerimiento ON requerimiento.id_requerimiento = registro.id_requerimiento
//             WHERE 
//                 estatus != 'Vigente'
//             GROUP BY 
//                 nombre_requerimiento, zona;
//         `;

//         const [results] = await pool.query(query);
//         const sentencia = [];

//         // Mapeamos los resultados a un objeto para facilitar la manipulación
//         const requerimientosMap = results.reduce((acc, row) => {
//             const nombre = row.nombre_requerimiento;
//             if (!acc[nombre]) {
//                 acc[nombre] = {
//                     nombre: nombre,
//                     plantaspas: 0,
//                     plantascen: 0,
//                     plantnor: 0,
//                     plantsur: 0,
//                     plantasgen: 0
//                 };
//             }

//             // Sumamos los resultados según la zona
//             switch (row.zona) {
//                 case 'Pacífico':
//                     acc[nombre].plantaspas += row.plantas_encontradas;
//                     break;
//                 case 'Centro':
//                     acc[nombre].plantascen += row.plantas_encontradas;
//                     break;
//                 case 'Noreste':
//                     acc[nombre].plantnor += row.plantas_encontradas;
//                     break;
//                 case 'Sureste':
//                     acc[nombre].plantsur += row.plantas_encontradas;
//                     break;
//             }

//             // Sumamos los resultados para plantas generales
//             acc[nombre].plantasgen += row.plantas_encontradas;

//             return acc;
//         }, {});

//         // Convertimos el mapa de requerimientos de nuevo a un array
//         for (const nombre in requerimientosMap) {
//             sentencia.push(requerimientosMap[nombre]);
//         }

//         console.log(sentencia);
//         res.json(sentencia);
//     } catch (error) {
//         console.error("Error en la consulta:", error);
//         res.status(500).send("Error en el servidor");
//     }
// };

controladorRequerimiento.conteo = async (req, res) => {
        const reqi=req.body.segmento
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
                estatus != 'Vigente' and segmento =?
            GROUP BY 
                nombre_requerimiento, zona; `;
        
        const [results] = await pool.query(query,[reqi]);
        const sentencia = [];

        // Obtener todos los nombres de requerimientos únicos
        const nombresRequerimientos = [...new Set(results.map(row => row.nombre_requerimiento))];

        // Iterar sobre cada nombre de requerimiento
        for (const nombre of nombresRequerimientos) {
            // Filtrar resultados por nombre de requerimiento
            const resultadosRequerimiento = results.filter(row => row.nombre_requerimiento === nombre);

            const jos = {
                nombre: nombre,
                plantaspas: 0,
                plantascen: 0,
                plantnor: 0,
                plantsur: 0,
                plantasgen: 0
            };

            // Iterar sobre los resultados del requerimiento actual
            for (const resultado of resultadosRequerimiento) {
                // Sumar los resultados según la zona
                switch (resultado.zona) {
                    case 'Pacifico':
                        jos.plantaspas += resultado.plantas_encontradas;
                        break;
                    case 'Centro':
                        jos.plantascen += resultado.plantas_encontradas;
                        break;
                    case 'Noreste':
                        jos.plantnor += resultado.plantas_encontradas;
                        break;
                    case 'Sureste':
                        jos.plantsur += resultado.plantas_encontradas;
                        break;
                }

                // Sumar los resultados para plantas generales
                jos.plantasgen += resultado.plantas_encontradas;
            }

            sentencia.push(jos);
        }

        // Agregar nombres de requerimientos sin datos asociados
        const nombresSinDatos = nombresRequerimientos.filter(nombre => !sentencia.some(item => item.nombre === nombre));
        for (const nombreSinDatos of nombresSinDatos) {
            sentencia.push({
                nombre: nombreSinDatos,
                plantaspas: 0,
                plantascen: 0,
                plantnor: 0,
                plantsur: 0,
                plantasgen: 0
            });
        }

        console.log("Suma de segmentos Enviado conexito");
        res.json(sentencia);
    } catch (error) {
        console.error("Error en la consulta:", error);
        res.status(500).send("Error en el servidor");
    }
};

controladorRequerimiento.Conteozonas=async(req,res)=>{
    // const zonas =
    // `SELECT count(zona)as 'total_zona', zona
    // FROM registro,unidad_operativa,requerimiento
    // where unidad_operativa.id_planta=registro.id_planta and requerimiento.id_requerimiento = registro.id_requerimiento
    // GROUP BY zona`

    const segmento= req.body.segmento
    const zonas =
    `SELECT 
    SUM(CASE WHEN zona='Centro' AND estatus != 'Vigente' THEN 1 ELSE 0 END) AS 'Centro',
    SUM(CASE WHEN zona='Noreste' AND estatus != 'Vigente' THEN 1 ELSE 0 END) AS 'Noreste',
    SUM(CASE WHEN zona='Pacífico' and estatus != 'Vigente' THEN 1 ELSE 0 END) as 'Pasifico',
    SUM(CASE WHEN zona='Sureste' AND estatus != 'Vigente' THEN 1 ELSE 0 END) AS 'Sureste',
    SUM(CASE WHEN (zona ='Centro' OR zona='Pacífico' OR zona='Sureste' OR zona ='Noreste') AND estatus != 'Vigente' THEN 1 ELSE 0 END) AS 'total'
  FROM registro
  JOIN unidad_operativa ON registro.id_planta = unidad_operativa.id_planta
  WHERE segmento=?;
    `
    try{
        const [zonasconteo]= await pool.query(zonas,[segmento])
        res.json(zonasconteo)
        console.log(zonasconteo)
        console.log("Zonas enviadas")
    }catch(esepcion){
        console.log(esepcion)
        res.status(500).json({message:"hay un error en el servido"})
       
    }
}

// controladorRequerimiento.cumplimiento=async(req,res)=>{
 
//     let sentencia= [];
//     let plantass=[]
//     let respuestas=[]
//     const [requerimientos] = await pool.query('SELECT * FROM requerimiento')
//     const [plantas]=await pool.query('select distinct(nombre_planta) from unidad_operativa')
//     for (const requerimiento of requerimientos) {
//         const nombre = requerimiento.nombre_requerimiento;
        
//         jos={
//             nombre
//         }

//         sentencia.push(nombre);
//     }
//     for(const nombre of plantas ){
//         const planta = nombre.nombre_planta;
//         plantass.push(planta)
        
//     }
//     const respuesta=({
//         plantass,
//         sentencia
//     })

//     for(let i = plantass; i<=plantass.length;i++){
//         const nombre = requerimineto[i].nombre_requerimiento+"pruebaaaa";
//         respuestas.push(nombre)
//     }
//     // console.log(sentencia,plantass);
//     console.log(respuestas)
//     res.json(respuesta)
// }




// controladorRequerimiento.cumplimiento = async (req, res) => {
//     try {
//         let plantass = [];
//         let respuestas = [];

//         const [plantas] = await pool.query('SELECT DISTINCT(nombre_planta) FROM unidad_operativa');

//         for (const planta of plantas) {
//             const nombrePlanta = planta.nombre_planta;
//             const [conteo] = await pool.query(`
//                 SELECT SUM(peso) as total                FROM unidad_operativa, registro, requerimiento 
//                 WHERE nombre_planta = ? AND 
//                 unidad_operativa.id_planta = registro.id_planta AND 
//                 registro.id_requerimiento = requerimiento.id_requerimiento
//             `, [nombrePlanta]);

//             plantass.push(nombrePlanta);
//             respuestas.push(conteo[0].total);
//         }

//         const respuesta = {
//             plantass
//             // respuestas
//         };

//         console.log(respuesta);
//         res.json(respuesta);
//     } catch (error) {
//         console.error("Error en el método cumplimiento:", error);
//         res.status(500).json({ error: "Error interno del servidor" });
//     }
// };

// controladorRequerimiento.cumplimiento = async (req, res) => {
//     try {
//         let plantasConteo = {};

//         const [plantas] = await pool.query('SELECT DISTINCT(nombre_planta) FROM unidad_operativa');

//         for (const planta of plantas) {
//             const nombrePlanta = planta.nombre_planta;
//             const [conteo] = await pool.query(`
//                 SELECT SUM(peso) as totalAQcapulco
//                 FROM unidad_operativa, registro, requerimiento 
//                 WHERE nombre_planta = ? AND 
//                 unidad_operativa.id_planta = registro.id_planta AND 
//                 registro.id_requerimiento = requerimiento.id_requerimiento
//             `, [nombrePlanta]);

//             plantasConteo[nombrePlanta] = conteo[0].totalAQcapulco;
//         }

//         const respuesta = {
//             plantasConteo
//         };

//         console.log(respuesta);
//         res.json(respuesta);
//     } catch (error) {
//         console.error("Error en el método cumplimiento:", error);
//         res.status(500).json({ error: "Error interno del servidor" });
//     }
// };


// controladorRequerimiento.cumplimiento = async (req, res) => {
//     try {
//         let plantasConteo = {};

//         const [plantas] = await pool.query('SELECT DISTINCT(nombre_planta) FROM unidad_operativa');

//         for (const planta of plantas) {
//             const nombrePlanta = planta.nombre_planta;
//             const [conteo] = await pool.query(`
//                 SELECT SUM(peso) as totalAQcapulco
//                 FROM unidad_operativa, registro, requerimiento 
//                 WHERE estatus="Vigente" AND nombre_planta = ? AND 
//                 unidad_operativa.id_planta = registro.id_planta AND 
//                 registro.id_requerimiento = requerimiento.id_requerimiento
//             `, [nombrePlanta]);




//             // Realizar operaciones con el conteo (por ejemplo, multiplicar por 2)

//             const [conteototal]= await pool.query(`  SELECT SUM(peso) as total
//             FROM unidad_operativa, registro, requerimiento 
//             WHERE estatus= nombre_planta = ? AND 
//             unidad_operativa.id_planta = registro.id_planta AND 
//             registro.id_requerimiento = requerimiento.id_requerimiento`)
//             const resultadoOperacion = conteo[0].totalAQcapulco / conteototal[0].total *100

//             // Asignar el resultado a la propiedad correspondiente en el objeto plantasConteo
//             plantasConteo[nombrePlanta] = resultadoOperacion;
//         }

//         const respuesta = {
//             plantasConteo
//         };

//         console.log(respuesta);
//         res.json(respuesta);
//     } catch (error) {
//         console.error("Error en el método cumplimiento:", error);
//         res.status(500).json({ error: "Error interno del servidor" });
//     }
// };

// controladorRequerimiento.cumplimiento = async (req, res) => {
//     try {
//         let plantasConteo = {};
        
//         const almacenamiento=[]

//         const [plantas] = await pool.query('SELECT DISTINCT(nombre_planta) FROM unidad_operativa');

//         for (const planta of plantas) {
//             const nombrePlanta = planta.nombre_planta;
            
//             const [conteo] = await pool.query(`
//                 SELECT SUM(peso) as totalAQcapulco
//                 FROM unidad_operativa, registro, requerimiento 
//                 WHERE estatus="Vigente" AND nombre_planta = ? AND 
//                 unidad_operativa.id_planta = registro.id_planta AND 
//                 registro.id_requerimiento = requerimiento.id_requerimiento
//             `, [nombrePlanta]);


//             const [conteototal] = await pool.query(`
//                 SELECT SUM(peso) as total
//                 FROM unidad_operativa, registro, requerimiento 
//                 WHERE estatus="Vigente" AND nombre_planta = ? AND 
//                 unidad_operativa.id_planta = registro.id_planta AND 
//                 registro.id_requerimiento = requerimiento.id_requerimiento
//             `, [nombrePlanta]);

//             // console.log(conteo)


//             const resultadoOperacion = ((conteototal[0].total / conteo[0].totalAQcapulco) * 100);


//             // Asignar el resultado a la propiedad correspondiente en el objeto plantasConteo
//             almacenamiento.push (resultadoOperacion);
//         }

//         const respuesta = {
//             plantasConteo
//         };
//         console.log(almacenamiento);
        
//         res.json(almacenamiento);
//     } catch (error) {
//         console.error("Error en el método cumplimiento:", error);
//         res.status(500).json({ error: "Error interno del servidor" });
//     }
// };

controladorRequerimiento.cumplimiento = async (req, res) => {
    try {
        const resultados = {};

        const [plantas] = await pool.query('SELECT DISTINCT(nombre_planta) FROM unidad_operativa');

        for (const planta of plantas) {
            const nombrePlanta = planta.nombre_planta;

            const [conteo] = await pool.query(`
                SELECT SUM(peso) as totalAQcapulco
                FROM unidad_operativa, registro, requerimiento 
                WHERE estatus="Vigente" AND nombre_planta = ? AND 
                unidad_operativa.id_planta = registro.id_planta AND 
                registro.id_requerimiento = requerimiento.id_requerimiento
            `, [nombrePlanta]);

            const [conteototal] = await pool.query(`
                SELECT SUM(peso) as total
                FROM unidad_operativa, registro, requerimiento 
                WHERE estatus="Vigente" AND nombre_planta = ? AND 
                unidad_operativa.id_planta = registro.id_planta AND 
                registro.id_requerimiento = requerimiento.id_requerimiento
            `, [nombrePlanta]);

            const resultadoOperacion = (((conteototal[0].total) / (conteo[0].totalAQcapulco)) * 100);

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
        
        
        const [plantas] = await pool.query('SELECT DISTINCT(nombre_planta) FROM unidad_operativa');

        for (let i = 0; i < plantas.length; i++) {
            const nombrePlanta = plantas[i].nombre_planta;

            const [resultado] = await pool.query(quer, [nombrePlanta]);
            const total= parseFloat(resultado[0].total)

            const [resultado2]= await pool.query(quer2,[nombrePlanta]);
            const parcial=parseFloat(resultado2[0].parcial)

            let resul= (parcial/total*100).toString();

            await pool.query(actualiza,[resul,nombrePlanta])

            totalPlantas.push({
                nombrePlanta,
                resul
            });

            console.log(`Planta: ${nombrePlanta}, Total: ${resultado[0].total}`);
        }

        res.json(totalPlantas);
    } catch (error) {
        console.error("Error en el método cumplimiento1:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
    
};

//NO ES UTILIZADO METODO

controladorRequerimiento.porsentajeActual=async(req,res)=>{
    let nombrePlanta= req.body.nombre_planta
    try {

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
        
        
            const [resultado] = await pool.query(quer, [nombrePlanta]);
            const total= parseFloat(resultado[0].total)

            const [resultado2]= await pool.query(quer2,[nombrePlanta]);
            const parcial=parseFloat(resultado2[0].parcial)

            let resul= (parcial/total*100).toString();
            console.log("se envio la peticon")

            await pool.query(actualiza,[resul,nombrePlanta])

            const [planta] = await pool.query('Select nombre_planta, porcentaje_cumplimiento From unidad_operativa where nombre_planta=?',[nombrePlanta])
            console.log(resul)
            res.json(planta);
    } catch (error) {
        console.error("Error en el método cumplimiento1:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }

}






   //aqui vamos a hacer un arrays en donde obtengamos un todos los nombres de todos los permiosos 
    //despues recorer el arris donde vamos a meter los resultados en un siclio for para ejecutar de manera conjtinua un query que nos va a 
    // traer el procentaje de cump0limineto sumando los permisos parciales y los permisos totales de cada una de las plantas que tenemos en le arrays
    // todo eso lo metemos en otro arrays que vamos a acomodarlo en un json para hacer el response







// controladorRequerimiento.centro =async(req,res)=>{
//     let sentencia = [];
//     let query = `SELECT 
//     COUNT(id_registro) AS plantas_encontradas, 
//     nombre_requerimiento,
//     zona
// FROM 
//     registro
// JOIN 
//     unidad_operativa ON unidad_operativa.id_planta = registro.id_planta
// JOIN 
//     requerimiento ON requerimiento.id_requerimiento = registro.id_requerimiento
// WHERE 
//     estatus != 'Vigente'
//     AND zona IN ('Centro', 'Pacífico','Noreste','Sureste')
//     AND nombre_requerimiento  =?
// GROUP BY 
//     nombre_requerimiento, zona; `
//     const [requerimientos] = await pool.query('SELECT * FROM requerimiento')
//     for (const requerimiento of requerimientos) {
//         const nombre = requerimiento.nombre_requerimiento;
//         const [result] = await pool.query(query, [nombre]);
//         const conteo = result[0].plantas_encontradas; 
//         const jos={
//             nombre:planta,
//             plantascen:conteo
//         };
//         sentencia.push(jos);
//     }
//     console.log(sentencia);
//     res.json(sentencia)

// }

// controladorRequerimiento.centro = async (req, res) => {
//     try {
//         let sentencia = [];
//         let query = 
//         `SELECT 
//                 COUNT(id_registro) AS plantas_encontradas, 
//                 nombre_requerimiento,
//                 zona
//             FROM 
//                 registro
//             JOIN 
//                 unidad_operativa ON unidad_operativa.id_planta = registro.id_planta
//             JOIN 
//                 requerimiento ON requerimiento.id_requerimiento = registro.id_requerimiento
//             WHERE 
//                 estatus != 'Vigente'
//                 AND zona IN ('Centro', 'Pacífico', 'Noreste', 'Sureste')
//                 AND nombre_requerimiento = ?
//             GROUP BY 
//                 nombre_requerimiento, zona;`;

//         const [requerimientos] = await pool.query('SELECT * FROM requerimiento');

//         for (const requerimiento of requerimientos) {
//             const nombre = requerimiento.nombre_requerimiento;
//             const [result] = await pool.query(query, [nombre]);

//             const jos = {
//                 nombre: nombre,
//                 plantas_por_zona: []  // Inicializamos un arreglo para almacenar conteo por zona
//             };

//             // Acumulamos el conteo por zona en el arreglo
//             for (const row of result) {
//                 jos.plantas_por_zona.push({
//                     zona: row.zona,
//                     conteo: row.plantas_encontradas
//                 });
//             }

//             sentencia.push(jos);
//         }

//         console.log(sentencia);
//         res.json(sentencia);
//     } catch (error) {
//         console.error("Error en la consulta:", error);
//         res.status(500).send("Error en el servidor");
//     }
// };




module.exports=controladorRequerimiento