const pool = require('../database')

const controllerHistorial = {}
const {segmento,zona,cumplimiento,fecha}=req.body

controllerHistorial.insertarHitorial= async (req,res)=>{
    try{
        await pool.query('INSERT INTO historial (segmento, zona, cumplimiento, fecha)VALUES (?,?,?,?)'[segmento,zona,cumplimiento,fecha]);
    res.send ("estatus guardado");

    }catch(excepcion){
        res.send("hubo un herror en la coneccion")
    }
}
    controllerHistorial.buseg =async (req,res)=>{
        try{
            const [segmentos]= await pool.query('SELECT * FROM historia WHERE segmento =?' [segmento]);
            if(segmento !=""){
                res.send(segmento);
            }else{
                res.send("no se encontraron datos");
            }
        }
        catch(excepcion){
            res.send("hubo un error")
        }
    }

    controllerHistorial.buzon =async(req, res)=>{
        try{
            const [zonas] =await pool.query('SELECT * FROM historial WHERE =?',[zona]);
        if(zona!=""){
            res.send(zonas);
        }else{
            res.send("No se encontro ningun segemnto");
        }
        }
        catch(excepcion){
            res.send("erro")
        }
    
    }

    controllerHistorial.buscumpli = async(req,res)=>{
        try{
            const [cumplimientos]= await pool.query('SELECT * FROM historial WHERE =?',[cumplimiento]);
        if(cumplimientos != ""){
            res.send(cumplimientos)
        }else{
            res.send("no se encontraron datos")
            }      
        }
        catch(excepcion){
            res.send("error")
            }
    }

    controllerHistorial.busfecha=async(req,res)=>{
        try{
            const fe = fecha+"%"
            const [fechas]=await pool.query('SELEC * FROM hitorial WHERE =?  ',[fe])
            if(fechas != ""){
                res.send(fechas)
            }else{
                res.send("no se encontro ningun reguistro")
            }
        }
        catch(excepcion){
            res.send("error")
        }
    }

module.exports = controllerHistorial