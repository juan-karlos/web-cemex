//unidad Operativa 

const pool = require('../database')
const controllerPlanta ={};

controllerPlanta.obtenerPlanta = async(req,res)=>{
    const planta = req.body.nombre_planta;
    const [infoPlanta]= await pool.query('Select * FROM unidad_operativa WHERE nombre_planta =?',[planta])
    if(infoPlanta!="")
    res.send(infoPlanta);
    else{
        res.send("no se encuentra")
    }
}

controllerPlanta.insertPlanta = async(req,res)=>{

    const {id_planta, nombre_planta, segmento,zona,estatus,peso,porcentaje_cump,fija }=req.body
    try{ 
    const [reg]= await pool.query('INSERT INTO unidad_Operativa Values (?,?,?,?,?,?,?,?)', [id_planta,nombre_planta,segmento,zona,estatus,peso,porcentaje_cump,fija])
    res.send("planta registrada en la base de datos")
    }catch(Exception){
        res.send("El id ingresado es el mismo")
    }
}

    controllerPlanta.actualizar = async(req, res)=>{
        const planta = req.body.nombre_planta;
        const {segmento,Zona, Estatus,Peso,porcentaje_cumplimiento,fija}=req.body
        const [infoPlanta]= await pool.query('Select id_planta FROM unidad_operativa WHERE nombre_planta =?',[planta]);
        id=JSON.stringify(infoPlanta);
        const recid=/(\d+)/g;
        const idrecu= id.match(recid);
        if(infoPlanta!=""){
            await pool.query('UPDATE unidad_operativa SET nombre_planta=?, segmento=?, Zona=?, Estatus=?, Peso=?, porcentaje_cumplimiento=?, fija=? WHERE id_planta=?',[planta,segmento,Zona, Estatus,Peso,porcentaje_cumplimiento,fija,idrecu]);
            res.send("estatus actualizado")
        }else{
            res.send("no esta")
        }
    }

    controllerPlanta.eliminar = async(req, res)=>{
        const planta = req.body.nombre_planta;
        const [infoPlanta]= await pool.query('Select id_planta FROM unidad_operativa WHERE nombre_planta =?',[planta]);
        id=JSON.stringify(infoPlanta);
        const recid=/(\d+)/g
        const idrecu= id.match(recid);
        try{
            if(infoPlanta!=""){
                await pool.query('DELETE FROM unidad_operativa WHERE id_planta=?',[idrecu])
                res.send("estatus Eliminado")
            }else{
                res.send("no esta")
            }
        }catch(excepcion){
            res.send("hay un problema en la eliminacion de la planta")
        }
        
    }    
module.exports=controllerPlanta

