const pool = require('../database')
const controllerPlanta ={};

controllerPlanta.obtenerPlanta = async(req,res)=>{
    const planta = req.body.nombre_planta;
    const [infoPlanta]= await pool.query('Select * FROM unidad_operativa WHERE nombre_planta =?',[planta])
    res.send(infoPlanta);
}

controllerPlanta.insertPlanta = async(req,res)=>{
    try{
        const {id_planta, nombre_planta, segmento,zona,estatus,peso,porcentaje_cump,fija }=req.body
        const [reg]= await pool.query('INSERT INTO unidad_Operativa Values (?,?,?,?,?,?,?,?)', [id_planta,nombre_planta,segmento,zona,estatus,peso,porcentaje_cump,fija])
        if(reg.affectedRows > 0){
            res.send("Unidad operativa insertada")
        }else{
            res.send("No se pudo registrar la nueva unidad operativa")
        }
    }catch(Exception){
        res.send("duplicidad de id")
    }
}

module.exports=controllerPlanta

