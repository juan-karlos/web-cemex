const  pool  = require("../database")

const controladorRegistros={}

controladorRegistros.obtenerRegistro=async(req,res)=>{
    const [todreg]= await pool.query('select * from requerimiento');
    res.json(todreg);
}
controladorRegistros.insertarRegistro=async(req,res)=>{
    const {id_requerimiento,nom_req,dato,peso,impacto,pais,valides_unica,siglas}=req.body
    const [regis]= await pool.query('iNSERT INTO requerimiento VALUES (?,?,?,?,?,?,?,?)',[id_requerimiento,nom_req,dato,peso,impacto,pais,valides_unica,siglas])
    res.json({"status":"cliente insertado"})
}




module.exports=controladorRegistros