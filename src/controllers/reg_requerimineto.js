const  pool  = require("../database")

const controladorRequerimiento={}

//muestra todos los requerimientos
controladorRequerimiento.obtenerRequerimiento=async(req,res)=>{
    try{
        const [todreg]= await pool.query('call seleccionarRequerimiento');
        res.json(todreg);
    }catch(Excepcion){
        res.send("No hay conexion a la base de datos")
    }    
}

//inserta un nuevo requerimiento 
controladorRequerimiento.insertarRequerimiento=async(req,res)=>{
    const {nom_req,dato,peso,impacto,pais,validez_unica,siglas}=req.body
    try{
        const [regis]= await pool.query('INSERT INTO requerimiento (nom_req,dato,peso,impacto,pais,validez_unica,siglas) VALUES (?,?,?,?,?,?,?)',[nom_req,dato,peso,impacto,pais,validez_unica,siglas])
        res.json({"status":"cliente insertado"})
    }catch(Excepcion){
        res.json("hay un error", MessageEvent(Excepcion))
    }
}

//obtiene un requerimiento especifico
controladorRequerimiento.obtenerUnRequerimiento=async(req,res)=>{  
    try{
        const nombre = req.body.nom_req
        const [id_req]= await pool.query('Select *from requerimiento where nom_req = ?',[nombre])
        if(id_req.length >= 1){
            res.send(id_req)
        }else{
            res.send("No se encontro un requerimiento con este nombre")
        }
    }catch(Excepcion){
        res.send("No se pudo conectar a la base de datos")
    }
}

//actualiza los requerimientos
controladorRequerimiento.actualizarRequerimiento=async(req,res)=>{
    const {nom_req,dato,peso,impacto,pais,validez_unica,siglas,id}=req.body
    try{
        const actaulizar = await pool.query('update requerimiento set nom_req=?, dato=?, peso=?, impacto=?, pais=?, validez_unica=?, siglas=? where id_requerimiento = ?',[nom_req,dato,peso,impacto,pais,validez_unica,siglas,id])
        if(actaulizar.affectedRows>=1){
            res.send("Actualizacion del requerimiento exitosa")
        }else{
            res.send("La actualizacion no fue realizada")
        }
    }catch(Excepcion){
        res.send("No se pudo conectar a la base de datos")
    }
}

//elimina uno de los requerimientos 
controladorRequerimiento.eliminarRequerimiento=async(req,res)=>{
    try{
        const id=req.body
        const [rows] = await pool.query('Delete from requerimiento where id_requerimiento=?',[id])
        if(rows.affectedRows >= 1){
            res.send("Eliminacion exito")
        }else{
            res.send("El requerimiento a eliminar no fue encontrado")
        }
    }catch(Excepcion){
        res.send("No se pudo conectar a la base de datos")
    }
}

module.exports=controladorRequerimiento