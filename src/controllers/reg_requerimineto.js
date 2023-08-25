const { json } = require("express")
const  pool  = require("../database")

const controladorRequerimiento={}
controladorRequerimiento.obtenerRequerimiento=async(req,res)=>{
    const [todreg]= await pool.query('select * from requerimiento');
    res.json(todreg);
}

controladorRequerimiento.insertarRequerimiento=async(req,res)=>{
    const {id_requerimiento,nom_req,dato,peso,impacto,pais,validez_unica,siglas}=req.body
    try{
        const [regis]= await pool.query('iNSERT INTO requerimiento VALUES (?,?,?,?,?,?,?,?)',[id_requerimiento,nom_req,dato,peso,impacto,pais,validez_unica,siglas])
    res.json({"status":"cliente insertado"})
    }catch(Excepcion){
        res.json("hay un error", MessageEvent(Excepcion))
    }
}

controladorRequerimiento.obtenerUnRequerimiento=async(req,res)=>{
    const nombre = req.body.nom_req
    const [id_req]= await pool.query('Select *from requerimiento where nom_req = ?',[nombre])
    res.send(id_req)
}

controladorRequerimiento.actualizarRequerimiento=async(req,res)=>{
    const {nom_req,dato,peso,impacto,pais,validez_unica,siglas,id}=req.body
    try{
        const actaulizar = await pool.query('update requerimiento set nom_req=?, dato=?, peso=?, impacto=?, pais=?, validez_unica=?, siglas=? where id_requerimiento = ?',[nom_req,dato,peso,impacto,pais,validez_unica,siglas,id])
        if(actaulizar.affectedRows>1){
            res.send("Actualizacion del requerimiento exitosa")
        }else{
            res.send("La actualizacion no fue realizada")
        }
    }catch(Excepcion){
        res.send("conexion de la base de datos perdida")
    }
}

controladorRequerimiento.eliminarRequerimiento=async(req,res)=>{
    const id=req.body
    const [rows] = await pool.query('Delete from requerimiento where id_requerimiento=?',[id])
    if(rows.affectedRows > 0){
        res.send("Eliminacion exito")
    }else{
        res.send("El requerimiento a eliminar no fue encontrado")
    }
}

module.exports=controladorRequerimiento