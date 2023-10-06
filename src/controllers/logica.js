const  pool  = require("../database");
const controllerPlanta = require("./unidad_operativa");
const controllersLogica={}
const recid=/(\d+)/g;

//Controlador que trae la suma total de pesos sin importar el estatus de una planata que se le indique 
controllersLogica.pesoTotal=async(req,res)=>{
    try {
        const nomPlanta = req.body.nombre
        const [peso] = await pool.query(`select sum(peso) 
        from unidad_operativa,registro,requerimiento 
        where activo=1 and
        nombre_planta = ? and 
        unidad_operativa.id_planta = registro.id_planta and 
        registro.id_requerimiento = requerimiento.id_requerimiento`,[nomPlanta]) 
        pesoT = JSON.stringify(peso)
        const pesoTotal = pesoT.match(recid)
        if(pesoTotal!=null){
            res.send(`El Peso Total de  "${nomPlanta}" es de: ${pesoTotal}`)
        }else{
            res.send("verifica que esta planta cuente con requerimientos o este activa")
        }
    } catch (Excepcion) {
        res.send("No se pudo conectar a la base de datos")
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
        const {estatu,nombre} = req.body

        const [pesoEs] = await pool.query(`select sum(peso) 
        from unidad_operativa,registro,requerimiento 
        where activo = 1 and
        estatus = ? and  
        nombre_planta = ? and 
        unidad_operativa.id_planta = registro.id_planta and 
        registro.id_requerimiento = requerimiento.id_requerimiento`,[estatu,nombre])
        pesoEst = JSON.stringify(pesoEs)
        const pesoEstatus = pesoEst.match(recid)
        if(pesoEstatus!=null){
            res.send(`El peso total de los Estatus "${estatu}" es de ${pesoEstatus} de la planta ${nombre}`)
        }else{
            res.send('no hay requerimientos con este estatus o no esta activa esta planata')
        }
        
    } catch (Excepcion) {
        res.send("No hay conexion a la base de datos")
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
        const {nomPlanta,estatus} = req.body

        const [peso] = await pool.query(`select sum(peso) 
        from unidad_operativa,registro,requerimiento 
        where activo=1 and
        nombre_planta = ? and 
        unidad_operativa.id_planta = registro.id_planta and 
        registro.id_requerimiento = requerimiento.id_requerimiento`,[nomPlanta]) 
        pesoT = JSON.stringify(peso)
        const pesoTotal = pesoT.match(recid)
        if(pesoTotal!=null){
            const [pesoEs] = await pool.query(`select sum(peso) 
            from unidad_operativa,registro,requerimiento 
            where activo=1 and 
            estatus = ? and  
            nombre_planta = ? and 
            unidad_operativa.id_planta = registro.id_planta and 
            registro.id_requerimiento = requerimiento.id_requerimiento`,[estatus,nomPlanta]) 
            pesoEst = JSON.stringify(pesoEs)
            const pesoEstatus = pesoEst.match(recid)
            if (pesoEstatus!=null) {
                const numPesoEs = Number(pesoEstatus)
                const numPesoTo = Number(pesoTotal)
                const divicion = numPesoEs/numPesoTo
                const mul = divicion*100
                res.send(`El porcentaje de Estatus "${estatus}" es del: ${mul}%`)
            } else {
                res.send(`No se encontraron requerimientos con el estatus "${estatus}"`)
            }
            
        }else{
            res.send(`verifica que esta planta cuente con requerimientos de Estatus "${estatus}" o que este activa la planta`)
        }
    } catch (error) {
        res.send("No hay conexion a la base de datos")
    }
    
    
}

//suma de porcentaje de cumplimiento total

controllersLogica.sumTotalZonaSegmento=async(req,res)=>{
    const {zona,segmento}=req.body
    const filtro = /(\d+\.\d+)/g;
    const [sumPeso]= await pool.query(`select sum(porcentaje_cumplimiento) from unidad_operativa
    where zona = ? and 
    segmento = ?`,[zona,segmento])
    
    pesoCum = JSON.stringify(sumPeso)
    const pesoCumplimiento = pesoCum.match(filtro)
    res.send(`La suma total de cumplimiento es del "${pesoCumplimiento}" %`)
}

//nos sume el total de plantas por zona y por segmento
controllersLogica.totalPlantas=async(req,res)=>{
    const filtro = /(\d+)/g;
    const {zona,segmento}=req.body
    const [sumPlantas]=await pool.query(`select count( distinct id_planta) from unidad_operativa
    where zona = ? and 
    segmento = ?`,[zona,segmento])
    suma = JSON.stringify(sumPlantas)
    const totalPlantas = suma.match(filtro)
    res.send(`El total de plantas en la zona "${zona}" del segmento "${segmento}" es de: ${totalPlantas} `)
}
module.exports=controllersLogica;