const  pool  = require("../database")

const controladorRequerimiento={}
const recid=/(\d+)/g;

//muestra todos los requerimientos
controladorRequerimiento.obtenerRequerimiento=async(req,res)=>{
    try{
        const [todreg]= await pool.query('select *from Requerimiento');
        res.json(todreg);
    }catch(Excepcion){
        res.send("No hay conexion a la base de datos")
    }    
}

//inserta un nuevo requerimiento 
controladorRequerimiento.insertarRequerimiento=async(req,res)=>{
    const {nom_req,peso,impacto,siglas}=req.body
    try{
        const [regis]= await pool.query('INSERT INTO requerimiento (nombre_requerimiento,peso,impacto,siglas) VALUES (?,?,?,?)',[nom_req,peso,impacto,siglas])
        res.json({"status":"cliente insertado"})
    }catch(Excepcion){
        res.json("hay un error", MessageEvent(Excepcion))
    }
}

//obtiene un requerimiento especifico
controladorRequerimiento.obtenerUnRequerimiento=async(req,res)=>{  
    try{
        const nombre = req.body.nom_req
        const [id_req]= await pool.query('Select * from requerimiento WHERE nombre_requerimiento = ?',[nombre])
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
    const {nom_req,peso,impacto,siglas,nom}=req.body
    try{
        const [nombreR] = await pool.query('select id_requerimiento from requerimiento where nombre_requerimiento = ?',[nom])
        id = JSON.stringify(nombreR)
        const idrequ = id.match(recid)
        const [actualizar] = await pool.query(`update requerimiento set nombre_requerimiento=ifNULL(?,nombre_requerimiento), peso=ifNULL(?,peso), impacto=ifNULL(?,impacto), siglas=ifNULL(?,siglas) where id_requerimiento= ?`,[nom_req,peso,impacto,siglas,idrequ])
        console.log(actualizar)
        if(actualizar.affectedRows>0){
            res.send("Actualizacion del requerimiento exitosa")
        }else{
            res.send("No se encontro un requerimiento con este nombre")
        }
    }catch(Excepcion){
        res.send("No se pudo conectar a la base de datos")
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
            res.send("Eliminacion exito")
        }else{
            res.send("El requerimiento a eliminar no fue encontrado")
        }
    }catch(Excepcion){
        res.send("No se pudo conectar a la base de datos")
    }
}

module.exports=controladorRequerimiento