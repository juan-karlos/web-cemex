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

controllerPlanta.obtenerplantas=async(req,res)=>{
    const [plantas]= await pool.query('select * From unidad_operativa')
    res.send(plantas)
}



controllerPlanta.insertPlanta = async(req,res)=>{

    const {nombre_planta, segmento,zona,Estado,porcentaje_cumplimiento,fija }=req.body
    try{ 
    await pool.query('INSERT INTO unidad_Operativa (nombre_planta, segmento, zona, Estado, porcentaje_cumplimiento,fija) Values (?,?,?,?,?,?)', [nombre_planta,segmento,zona,Estado,porcentaje_cumplimiento,fija])

    res.send("planta registrada en la base de datos")

    }catch(Exception){
        res.send("la planta ya esta reguistrada")
    }
}

    controllerPlanta.actualizar = async(req, res)=>{
        try{
        const {nombre_planta,segmento,zona, Estado,porcentaje_cumplimiento,fija}=req.body
        const planta = ({id_planta:req.params.cb})
        id=JSON.stringify(planta);
            const recid=/(\d+)/g;
            const idrecu= id.match(recid);
            
            
        const [infoPlanta]= await pool.query('Select * FROM unidad_operativa WHERE id_planta =?',[idrecu])
       
            if(infoPlanta!=""){
                await pool.query('UPDATE unidad_operativa SET nombre_planta=?, segmento=?, zona=?, Estado=?, porcentaje_cumplimiento=?, fija=? WHERE id_planta=?',[nombre_planta,segmento,zona,Estado,porcentaje_cumplimiento,fija,idrecu]);
                res.send("Sactualizo Correctamente")
            }else{
                res.send("no esta")
            }
        }catch(excepcion){
            res.send("algo anda mal")
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

    