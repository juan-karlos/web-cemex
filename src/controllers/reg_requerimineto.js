const  pool  = require("../database")

const controladorRegistros={}

controladorRegistros.obtenerRequerimiento=async(req,res)=>{
    const [todreg]= await pool.query('select * from requerimiento');
    res.json(todreg);
}
controladorRegistros.insertarRequerimiento=async(req,res)=>{

    const {id_requerimiento,nom_req,dato,peso,impacto,pais,validez_unica,siglas}=req.body
    try{
        const [regis]= await pool.query('iNSERT INTO requerimiento VALUES (?,?,?,?,?,?,?,?)',[id_requerimiento,nom_req,dato,peso,impacto,pais,validez_unica,siglas])
    res.json({"status":"cliente insertado"})
    }catch(Excepcion){
        res.json("hay un error", MessageEvent(Excepcion))
    }

}

module.exports=controladorRegistros