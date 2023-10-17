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
        res.status(500).json({message:"hay un error"})
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

module.exports=controladorRequerimiento