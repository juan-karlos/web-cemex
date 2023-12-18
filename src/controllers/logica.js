const  pool  = require("../database");
const controllersLogica={}

//Controlador que trae la suma total de pesos sin importar el estatus de una planata que se le indique 
controllersLogica.pesoTotal=async(req,res)=>{
    try {
        const nomPlanta = req.body.nombre
        const [peso] = await pool.query(`select sum(peso) as pesoTotal
        from unidad_operativa,registro,requerimiento 
        where activo=1 and
        nombre_planta = ? and 
        unidad_operativa.id_planta = registro.id_planta and 
        registro.id_requerimiento = requerimiento.id_requerimiento`,[nomPlanta]) 
        const pesoTotal = peso[0]['pesoTotal']
        const numero = parseInt(pesoTotal)

        if(peso!=null){
            res.status(200).json({total:numero})
            // res.status(200).json({
            //     // message:`El Peso Total de  ${nomPlanta} es de:` + pesoTotal
            //     peso:peso
            // })
        }else{
            res.status(400).json({
                message: "verifica que esta planta cuente con requerimientos o este activa"
            })
        }
    } catch (Excepcion) {
        console.log(Excepcion)
        res.status(500).json({
            message: "No se pudo conectar a la base de datos"
        })
    }
}
//Controlador que trae todos los pesos del estatus indicado
//trae toda la suma de pesos en el estatus que se le indica en funcion al nombre de la planta
//vigente
//En tramite
//no tramitable 
//vencido
//no aplica
controllersLogica.pesoParcial=async(req,res)=>{
    try {
        const {status,nombre} = req.body

        const [pesoEs] = await pool.query(`select sum(peso) as pesoTotal
        from unidad_operativa,registro,requerimiento 
        where activo = 1 and
        estatus = ? and  
        nombre_planta = ? and 
        unidad_operativa.id_planta = registro.id_planta and 
        registro.id_requerimiento = requerimiento.id_requerimiento`,[status,nombre])
        const pesoEstatus = pesoEs[0]['pesoTotal'];  
        const total= parseInt(pesoEstatus)  
        console.log(pesoEstatus)
        if(pesoEstatus!=null){
            res.status(200).json({
            total:total
            })
        }else{
            res.status(400).json({
                message: 'no hay requerimientos con este estatus o no esta activa esta planata'
            })
        }
    } catch (Excepcion) {
        res.status(500).json({
            message: "No hay conexion a la base de datos"
        })
    }
}

//controlador para traer el porcentaje de cumplimiento segun el estatus
//vigente
//En tramite
//no tramitable 
//vencido
//no aplica
controllersLogica.pesoEnPorcentajeEstatus=async(req,res)=>{
    try {
        const {nombre,status} = req.body
        const [peso] = await pool.query(`select sum(peso) from unidad_operativa,registro,requerimiento where activo=1 and nombre_planta = ? and unidad_operativa.id_planta = registro.id_planta and registro.id_requerimiento = requerimiento.id_requerimiento`,[nombre]) 
        const pesoTotal = Number(peso[0]['sum(peso)'])
        if(peso[0]['sum(peso)'] != null){
            const [pesoEs] = await pool.query(`select sum(peso) from unidad_operativa,registro,requerimiento where activo=1 and estatus = ? and nombre_planta = ? and unidad_operativa.id_planta = registro.id_planta and registro.id_requerimiento = requerimiento.id_requerimiento`,[status,nombre])
            const pesoEstatus = Number(pesoEs[0]['sum(peso)'])
            if (pesoEs[0]['sum(peso)'] != null) {
                const resultado =  (pesoEstatus/pesoTotal)*100
                res.status(200).json({
                    porsentaje:resultado
                })
            } else {
                res.status(400).json({
                    message: `No se encontraron requerimientos con el estatus "${estatus}"`
                })
            }
            
        }else{
            res.status(400).json({
                message: `verifica que esta planta cuente con requerimientos de Estatus ${estatus} o que este activa la planta`
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "No hay conexion a la base de datos"
        })
    }
    
    
}

//suma el total de plantas por zona y segmento
controllersLogica.totalPlantas=async(req,res)=>{
    try {
        const {zona,segmento}=req.body
        const [sumPlantas]=await pool.query(`select count(distinct id_planta) from unidad_operativa
        where zona = ? and 
        segmento = ? and 
        activo = 1`,[zona,segmento])
        const totalPlantas = sumPlantas[0]['count(distinct id_planta)']
        if(totalPlantas>0){
            res.status(200).json({
                message: `El total de plantas en la zona ${zona} del segmento ${segmento} es de: ${totalPlantas}`
            })
        }else{
            res.status(400).json({
                message: "No se encontraron plantas en esta zona y segmento"
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "No hay conexion a la base de datos"
        })
    }    
}

//suma de porcentaje de cumplimiento total

controllersLogica.sumTotalZonaSegmento=async(req,res)=>{
    try {
        const {zona,segmento}=req.body
        const [sumPeso]= await pool.query(`select sum(porcentaje_cumplimiento) from unidad_operativa
        where zona = ? and 
        segmento = ? and 
        activo=1`,[zona,segmento])
        const pesoCumpli = sumPeso[0]['sum(porcentaje_cumplimiento)'];
        if (pesoCumpli != null) {
            res.status(200).json({
                message: `La suma total de cumplimiento es del ${pesoCumpli} %`
            })
        } else {
            res.status(400).json({
                message:"No se encotraron resultados"
            }) 
        }
    } catch (error) {
        res.status(500).json({
            message:"No se pudo conectar a la base de datos"
        })
    }    
}

/*SUMA DE TODOS LOS PORSENTAJES DE CUMPLIMIENTO DE UNA ZONA ENTRE 
EL TOTAL DE PLANTAS DE CADA UNA DE LOS SEGMENTOS */





controllersLogica.porcentaje=async(req,res)=>{
    const sentencia= `SELECT 
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
GROUP BY subquery.segmento;`

    const [porcentaje]= await pool.query(sentencia)
    res.json(porcentaje)
    console.log(porcentaje)
}

controllersLogica.zonas=async(req,res)=>{
    const zonas=`SELECT 
    segmento,
    SUM(Centro) AS Centro,
    SUM(Pacífico) AS Pacífico,
    SUM(Noreste) AS Noreste,
    SUM(Sureste) AS Sureste,
    SUM(Centro + Pacífico + Noreste + Sureste) AS Total
FROM (
    -- Tu consulta original aquí
    SELECT 
        segmento,
        SUM(CASE WHEN zona = 'Centro' and activo=1 THEN porcentaje_cumplimiento ELSE 0 END) / 
            NULLIF((SELECT COUNT(id_planta) FROM unidad_operativa WHERE segmento = uo.segmento AND zona = 'Centro'), 0) AS "Centro",
        SUM(CASE WHEN zona = 'Pacífico' and activo=1 THEN porcentaje_cumplimiento ELSE 0 END) / 
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
ORDER BY segmento;`

const [zon]=await pool.query(zonas)

res.json(zon)
}



// sacar los porcentajes de cumplimiento para todos los segmentos divididos por zonas cadena_suministro{centro=? }

module.exports=controllersLogica;