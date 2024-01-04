const pool = require('../database')
const fs = require('fs');
const cron = require('node-cron')
const schedule = require('node-schedule')

async function insertar() {
  try {

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;  // Nota: Los meses son indexados desde 0
    const day = currentDate.getDate();
    const fecha = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
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
        fecha
      ]);

      console.log(resultados);
    }

    console.log("Se insertaron los datos correctamente.");
  } catch (excepcion) {
    console.error(excepcion);
    res.status(500).json({mesage:"no se pudo correr el job"})
    // Puedes manejar el error adecuadamente aquí
  }
}

const currentDate = new Date();
const ultimoDiaDelMes = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
// const year = currentDate.getFullYear();
// Formatear la fecha para ejecutar el cron en el último día del mes a las 00:00
// const yearCron = ultimoDiaDelMes.getFullYear();
const monthCron = ultimoDiaDelMes.getMonth() + 1;  // Nota: Los meses son indexados desde 0
// const dayCron = ultimoDiaDelMes.getDate();
const fechaFormateada = `50 23 L ${monthCron} *`;

schedule.scheduleJob(fechaFormateada,insertar)

// function prueba(){
// // console.log(monthCron +"  " +"  "+ fechaFormateada)
// console.log(ultimoDiaDelMes)
// }
// schedule.scheduleJob('* * * * *',prueba)

const controllerHistorial = {}

controllerHistorial.insertarHitorial= async (req,res)=>{
    const {segmento,zona,cumplimiento,fecha}=req.body
    try{
        await pool.query('INSERT INTO historial (segmento, zona, cumplimiento, fecha)VALUES (?,?,?,?)'[segmento,zona,cumplimiento,fecha]);
    res.json("estatus guardado");

    }catch(excepcion){
        res.status(500).json("hubo un herror en la coneccion")
    }
}

    controllerHistorial.buseg =async (req,res)=>{
        const segmento= req.body
        try{
            const [segmentos]= await pool.query('SELECT * FROM historia WHERE segmento =?' [segmento]);
            if(segmento !=""){
                res.json(segmento);
            }else{
                res.json("no se encontraron datos");
            }
        }
        catch(excepcion){
            res.status(500).json("hubo un error")
        }
    }

    controllerHistorial.buzon =async(req, res)=>{
        const zona= req.body
        try{
            const [zonas] =await pool.query('SELECT * FROM historial WHERE =?',[zona]);
        if(zona!=""){
            res.json(zonas);
        }else{
            res.json("No se encontro ningun segemnto");
        }
        }
        catch(excepcion){
            res.status(500).json("erro")
        }
    
    }

    controllerHistorial.buscumpli = async(req,res)=>{
        const cumplimiento= req.body
        try{
            const [cumplimientos]= await pool.query('SELECT * FROM historial WHERE =?',[cumplimiento]);
        if(cumplimientos != ""){
            res.json(cumplimientos)
        }else{
            res.json("no se encontraron datos")
            }      
        }
        catch(excepcion){
            res.status(500).json("error")
            }
    }



    controllerHistorial.busfecha=async(req,res)=>{
        const fecha= req.body
        try{
            const fe = fecha+"%"
            const [fechas]=await pool.query('SELEC * FROM hitorial WHERE =?  ',[fe])
            if(fechas != ""){
                res.json(fechas)
            }else{
                res.json("no se encontro ningun reguistro")
            }
        }
        catch(excepcion){
            res.status(500).json("error")
        }
    }


    
  controllerHistorial.zonaSegmento = async (req, res) => {
        const { zona, segmento } = req.body; // Obtener datos del cuerpo de la solicitud
      
        try {
          console.log('Datos de la solicitud:', zona, segmento); // Agrega un log para los datos de la solicitud
      
          const [cumplimiento] = await pool.query('SELECT * FROM Historial WHERE zona = ? and segmento = ?', [zona, segmento]);
      
          console.log('Resultado de la consulta:', cumplimiento); // Agrega un log para los resultados de la consulta
      
          res.json(cumplimiento);
        } catch (excepcion) {
          console.error('Error en el backend:', excepcion); // Agrega un log para cualquier error
          res.status(500).json("error");
        }
    }
    
  controllerHistorial.actualizar=async(req,res)=>{
    const { segmento } = req.body; // Obtener datos del cuerpo de la solicitud
      
    try {
      console.log('Datos de la solicitud:',segmento); // Agrega un log para los datos de la solicitud
  
      const [cumplimiento] = await pool.query('SELECT * FROM Historial WHERE segmento = ?', [segmento]);
  
      console.log('Resultado de la consulta:', cumplimiento); // Agrega un log para los resultados de la consulta
  
      res.json(cumplimiento);
    } catch (excepcion) {
      console.error('Error en el backend:', excepcion); // Agrega un log para cualquier error
      res.status(500).json("error");
    }
  }

  controllerHistorial.obtenerMesPasado = async (req, res) => {
    const { segmento } = req.body; // Obtener datos del cuerpo de la solicitud
  
    try {
      const currentDate = new Date();
      const lastMonth = new Date(currentDate);
      lastMonth.setMonth(currentDate.getMonth() - 1);
  
      const query = 'SELECT zona, cumplimiento FROM historial WHERE segmento = ? AND MONTH(fecha) = ? AND YEAR(fecha) = ?';
      const [cumplimiento] = await pool.query(query, [segmento, lastMonth.getMonth() + 1, lastMonth.getFullYear()]);
  
      console.log('Resultado de la consulta:', cumplimiento); // Agrega un log para los resultados de la consulta
  
      res.json(cumplimiento);
    } catch (excepcion) {
      console.error('Error en el backend:', excepcion); // Agrega un log para cualquier error
      res.status(500).json("error");
    }
  };


   controllerHistorial.insertHistorial=async(req,res)=>{
            const currentDate = new Date();
            let datos=`SELECT 
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
        GROUP BY zona, segmento;`
        
        const  insertar=`
        INSERT INTO historial(segmento,zona,cumplimiento,fecha)  values (?,?,?,?) 
        `
        try{
            const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;  // Nota: Los meses son indexados desde 0
        const day = currentDate.getDate();
        
        
        let fecha =(`${year}-${month}-${day}`);
        console.log(fecha)
        
        const [respuesta]= await pool.query(datos);
        for(let i =0; i< respuesta.length;i++){
        
        
         resultados={
            segmento:respuesta[i].segmento,
            zona:respuesta[i].zona,
            resultado:respuesta[i].resultados,
            fecha:fecha
          
        }
            // await pool.query(insertar,[respuesta[i].segmento,respuesta[i].zona,respuesta[i].resultados,fecha])
            console.log(resultados);
        
        }
        res.json("se inserto");
        
        }
        catch(exepcion){
            res.status(500).json({message:"error del servidor"})
        }
        // const currentDate = new Date();
        // const ultimoDiaDelMes = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        // const year = currentDate.getFullYear();
        
        
        // // Formatear la fecha para ejecutar el cron en el último día del mes a las 00:00
        // const yearCron = ultimoDiaDelMes.getFullYear();
        // const monthCron = ultimoDiaDelMes.getMonth() + 1;  // Nota: Los meses son indexados desde 0
        // const dayCron = ultimoDiaDelMes.getDate();
        
        // const fechaFormateada = `50 23 ${dayCron} ${monthCron} *`;

        // console.log(fechaFormateada)
        // res.send(fechaFormateada)

   }






module.exports = controllerHistorial