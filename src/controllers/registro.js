const pool = require('../database')

const controllerderegistros={}

controllerderegistros.obtenerRegistro = async(req,res)=>{
    const [registros]=await pool.query("select * from registro");
    res.send(registros)
}

module.exports=controllerderegistros