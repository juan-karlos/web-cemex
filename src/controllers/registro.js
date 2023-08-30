const { json, text } = require('express');
const pool = require('../database')

const controladorRegistro={}

//controlador que trae todos los registros 
controladorRegistro.obtenerRegistro = async(req,res)=>{
    try{
        const [registros]=await pool.query("select * from registro");
        res.send(registros)
    }catch(Excepcion){
        res.send("No se pudo conectar a la base de datos")
    }
}

//controlador de registros para agregar nuevo registro
controladorRegistro.insertarRegistro = async(req,res)=>{
    try{
        const {id_requerimiento,id_planta,fecha_inicio,fecha_vencimiento,observaciones,Estatus,url}=req.body
        const [consulta] = await pool.query('insert into registro (id_requerimiento,id_planta,fecha_inicio,fecha_vencimiento,observaciones,Estatus,url) values (?,?,?,?,?,?,?)',[id_requerimiento,id_planta,fecha_inicio,fecha_vencimiento,observaciones,Estatus,url])
        if(consulta.affectedRows>=1){
            res.send("El registro fue insertado de manera correcta")
        }else{
            res.send("El registro no se pudo insertar")
        }
    }catch(Excepcion){
        res.send("No se pudo conectar a la base de datos")
    }
    
}

//controlador para buscar por fecha especifica de inicio
controladorRegistro.buscarFechaDia=async(req,res)=>{
    try{
        const fech = req.body.fechaIni   
        const fe = fech + "%";
        const [fechas] = await pool.query('select *from registro where fecha_inicio like ?',[fe])
        if(fechas != ""){
            res.send(fechas)
        }else{
            res.send("Formato de fecha incorrecto o ingresaste un caracter no valido")
        }
        
    }catch(Exception){
        res.send("No se pudo conectar a la base de datos")
    }

}

//controlador para buscar mediante el año y el mes de inicio
controladorRegistro.buscarFechaAAMM=async(req,res)=>{
    try{
        const ani = req.body.anio
        const me = req.body.mes
        const [fechaIni] = await pool.query('select *from registro where month(fecha_inicio)=? and year(fecha_inicio) = ?',[me,ani])
        if(fechaIni != ""){
            res.send(fechaIni)
        }else{
            res.send("Verifica que el año y mes esten bien escritos")
        }
    }catch(Excepcion){
        res.send("No se pudo conectar a la base de datos")
    }
}

//controlador para buscar por anio de inicio
controladorRegistro.buscarFechaAnio=async(req,res)=>{
    try{
        const anio = req.body.ani
        const [fe] = await pool.query('select *from registro where year(fecha_inicio) = ?',[anio])
        if(fe.length >= 1){
            res.send(fe)
        }else{
            res.send("No se encontro ningun dato que coinsida")
        } 
    }catch(Excepcion){
        res.send("No se pudo cpnectar a la base de datos")
    }
}

//controlador para buscar por fecha especificada de vencimiento
controladorRegistro.buscarFechaAnioT=async(req,res)=>{
    try{
        const fech = req.body.fechaVen
        if(fech != ""){
            const fecha = fech + "%";
            const [fechas] = await pool.query('select *from registro where fecha_vencimiento like ?',[fecha])
            if(fechas.length  >= 1){
                res.send(res.send(fechas))
            }else{
                res.send("No se encontro ningun registro con la fecha especificada")
            }
        }else{
            res.send("formato de fechas invalido")
        }
        
    }catch(Excepcion){
        res.send("No se pudo conectar a la base de datos")
    }
}

//controlador para buscar por año y mes de vencimiento
controladorRegistro.buscarFechaAAMMT=async(req,res)=>{
    try{
        const ani = req.body.anio
        const me = req.body.mes
        const [fechaVen] = await pool.query('select *from registro where month(fecha_vencimiento)=? and year(fecha_vencimiento) = ?;',[me,ani])
        if(fechaVen.length >= 1){
            res.send(fechaVen)
        }else{
            res.send("No se encontro un registro con este año y mes especificado")
        }
        
    }catch(Excepcion){
        res.send("No se pudo conectar a la base de datos")
    } 
}

//controlador para registroos por año de vencimiento
controladorRegistro.buscarFechaAT=async(req,res)=>{
    try{
        const ani = req.body.anio
        const [fechaVen] = await pool.query('select *from registro where year(fecha_vencimiento) = ?',[ani])
        if(fechaVen.length>=1){
            res.json(fechaVen)
        }else{
            res.send("no se encontraron registros de este año")
        }
    }catch(Excepcion){
        res.send("No se pudo conectar a la base de datos")
    }
}

//controlador para buscar fechas por rangos vencimiento
controladorRegistro.buscarFechRango=async(req,res)=>{
    try{
        const {fechIni,fechFin} = req.body
        if(fechIni != "" && fechFin != ""){
            const feI = fechIni+"%";
            const feF = fechFin+"%";
            const [rang] = await pool.query('select *from registro where fecha_vencimiento >= ? and fecha_vencimiento<=?',[feI,feF])
            if(rang.length>=1){
                res.send(res.send(rang))
            }else{
                res.send("No se encontraron registros en este rango insertado")
            }
        }else{
            res.send("formato de fecha invalida")
        }
    }catch(Excepcion){
        res.send("No se pudo conectar a la base de datos")
    }
}

//controlador de registros para actualizar registros
controladorRegistro.actualizarRegistro=async(req,res)=>{
    try{
        const {id_requerimiento,id_planta,fecha_inicio,fecha_vencimiento,observaciones,Estatus,url,id_registro}=req.body
        const [rows]= await pool.query('UPDATE registro set id_requerimiento=?, id_planta=?, fecha_inicio=?, fecha_vencimiento=?, observaciones=?, Estatus=?, url=? where id_registro = ?',[id_requerimiento,id_planta,fecha_inicio,fecha_vencimiento,observaciones,Estatus,url,id_registro])
        if(rows.affectedRows > 0){
            res.send("actualizacion realizada con exito")
        }else{
            res.send("verifique si existe el registro en la base de datos")
        }
    }catch(Excepcion){
        res.send("No se pudo conectar a la base de datos")
    }
 }
 
 //controlador para actualizar los estados
controladorRegistro.actualizarEstado=async(req,res)=>{
    try{
        const id = req.body.ide
        const dato = req.body.estado
        const [aviso] = await pool.query('update registro set Estatus = ? where id_registro=?',[dato,id])
        if(aviso.affectedRows >= 1){
            res.send('Estado del registro actaulizado correctamente')
        }else{
            res.send("No se pudo actualizar el estado")
        }   
    }catch(Exception){
       res.send("verifica no haber metido un caracter especial o tener conexion a la base de datos")
    }
 }
 
module.exports=controladorRegistro