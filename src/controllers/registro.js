const { json, text } = require('express');
const pool = require('../database')

const controladorRegistro={}
//controlador que trae todos los registros 
controladorRegistro.obtenerRegistro = async(req,res)=>{
    const [registros]=await pool.query("select * from registro");
    res.send(registros)
}

//controlador de registros para agregar nuevo registro
controladorRegistro.insertarRegistro = async(req,res)=>{
    const {id_registro,id_requerimiento,id_planta,fecha_inicio,fecha_vencimiento,observaciones,Estatus,url}=req.body
    await pool.query('insert into registro values (?,?,?,?,?,?,?,?,?)',[id_registro,id_requerimiento,id_planta,fecha_inicio,fecha_vencimiento,observaciones,Estatus,url])
}

//controlador para buscar por fecha especifica de inicio
controladorRegistro.buscarFechaDia=async(req,res)=>{
    const fech = req.body.fechaIni
    const fe = fech + "%";
    const [fechas] = await pool.query('select *from registro where fecha_inicio like ?',[fe])
    res.send(fechas)
    console.log(fechas)
}

//controlador para buscar mediante el año y el mes de inicio
controladorRegistro.buscarFechaAAMM=async(req,res)=>{
    const ani = req.body.anio
    const me = req.body.mes
    const [fechaIni] = await pool.query('select *from registro where month(fecha_inicio)=? and year(fecha_inicio) = ?',[me,ani])
    res.send(fechaIni)
}

//controlador para buscar por anio de inicio
controladorRegistro.buscarFechaAnio=async(req,res)=>{
    const anio = req.body.ani
    const [fe] = await pool.query('select *from registro where year(fecha_inicio) = ?',[anio])
    res.send(fe)
}

//controlador para buscar por fecha especificada de vencimiento
controladorRegistro.buscarFechaAnioT=async(req,res)=>{
    const fech = req.body.fechaVen
    const fecha = fech + "%";
    const [fechas] = await pool.query('select *from registro where fecha_vencimiento like ?',[fecha])
    res.send(fechas)
}

//controlador para buscar por año y mes de vencimiento
controladorRegistro.buscarFechaAAMMT=async(req,res)=>{
    const ani = req.body.anio
    const me = req.body.mes
    const [fechaVen] = await pool.query('select *from registro where month(fecha_vencimiento)=? and year(fecha_vencimiento) = ?;',[me,ani])
    res.send(fechaVen)
}

//controlador para registroos por año de vencimiento
controladorRegistro.buscarFechaAT=async(req,res)=>{
    const ani = req.body.anio
    const [fechaVen] = await pool.query('select *from registro where year(fecha_vencimiento) = ?',[ani])
    res.json(fechaVen)
}

//controlador para buscar fechas por rangos vencimiento
controladorRegistro.buscarFechRango=async(req,res)=>{
    const {fechIni,fechFin} = req.body
    const feI = fechIni+"%";
    const feF = fechFin+"%";
    const [rang] = await pool.query('select *from registro where fecha_vencimiento >= ? and fecha_vencimiento<=?',[feI,feF])
    res.json(rang)
}

//controlador de registros para actualizar registros
controladorRegistro.actualizarRegistro=async(req,res)=>{
    const {id_requerimiento,id_planta,fecha_inicio,fecha_vencimiento,observaciones,Estatus,url,id_registro}=req.body
    const [rows]= await pool.query('UPDATE registro set id_requerimiento=?, id_planta=?, fecha_inicio=?, fecha_vencimiento=?, observaciones=?, Estatus=?, url=? where id_registro = ?',[id_requerimiento,id_planta,fecha_inicio,fecha_vencimiento,observaciones,Estatus,url,id_registro])
    if(rows.affectedRows > 0){
        res.send("actualizacion realizada con exito")
    }else{
        res.send("verifique si existe el registro en la base de datos")
    }
 }
 
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