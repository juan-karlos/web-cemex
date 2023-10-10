const pool = require('../database')
const controllerPlanta ={};

controllerPlanta.obtenerPlanta = async(req,res)=>{
    const planta = ({id_planta:req.params.cb})
    id=JSON.stringify(planta);
        const recid=/(\d+)/g;
        const idrecu= id.match(recid);
    const [infoPlanta]= await pool.query('Select * FROM unidad_operativa WHERE id_planta =?',[idrecu])
    if(infoPlanta!="")
    res.send(infoPlanta);
    else{
        res.send("no se encuentra")
    }
}

controllerPlanta.obtenerPlantas=async(req,res)=>{
    const [plantas]= await pool.query('select * From unidad_operativa')
    res.send(plantas)
}



controllerPlanta.insertPlanta = async(req,res)=>{

    const {nombre_planta, segmento,zona,estado,porcentaje_cump,fija,activo }=req.body
    try{ 
    const [reg]= await pool.query(`INSERT INTO unidad_Operativa (nombre_planta, segmento, zona, Estado, porcentaje_cumplimiento,fija,activo) Values (?,?,?,?,?,?,?)`, [nombre_planta,segmento,zona,estado,porcentaje_cump,fija,activo])
    res.send("planta registrada en la base de datos")
    }catch(Exception){
        res.send("El id ingresado es el mismo")
    }
}

controllerPlanta.actualizar = async(req, res)=>{
    const planElej=({id_planta:req.params.cb})
    const planta = req.body.nombre_planta;
    const {plantaN,segmento,zona, estado,porcentaje_cumplimiento,fija,activo}=req.body

    const [infoPlanta]= await pool.query(`Select id_planta FROM unidad_operativa WHERE nombre_planta =?`,[planta]);
    id=JSON.stringify(infoPlanta);
    const recid=/(\d+)/g;
    const idrecu= id.match(recid);
    if(infoPlanta!=""){
        await pool.query(`UPDATE unidad_operativa SET nombre_planta=ifNULL(?,nombre_planta), segmento=ifNULL(?,segmento), zona=ifNULL(?,zona), Estado=ifNULL(?,Estado), porcentaje_cumplimiento=ifNULL(?,porcentaje_cumplimiento), fija=ifNULL(?,fija), activo=ifNULL(?,activo) 
        WHERE id_planta=?`,[plantaN,segmento,zona,estado,porcentaje_cumplimiento,fija,activo,idrecu]);
        res.send("estatus actualizado")
    }else{
        res.send("no esta")
    }
}

controllerPlanta.eliminar = async(req, res)=>{
    const planta = ({id_planta:req.params.cb})
        id=JSON.stringify(planta);
            const recid=/(\d+)/g;
            const idrecu= id.match(recid);
            
            
        const [infoPlanta]= await pool.query('Select * FROM unidad_operativa WHERE id_planta =?',[idrecu])
        try{
            if(infoPlanta!=""){
                await pool.query('DELETE FROM unidad_operativa WHERE id_planta=?',[idrecu]);
                res.send("se elimino Correctamente ")
            }else{
                res.send("no esta")
            }
        }catch(excepcion){
            res.send("algo anda mal")
        }
}    
    module.exports=controllerPlanta

    