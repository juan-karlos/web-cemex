const pool = require('../database')

const controllerHistorial = {}


controllerHistorial.insertarHitorial= async (req,res)=>{
    const {segmento,zona,cumplimiento,fecha}=req.body
    try{
        await pool.query('INSERT INTO historial (segmento, zona, cumplimiento, fecha)VALUES (?,?,?,?)'[segmento,zona,cumplimiento,fecha]);
    res.json("estatus guardado");

    }catch(excepcion){
        res.status(500).json("hubo un herror en la coneccion")
    }
}
    controllerHistorial.buseg =async (req,res)=>{
        const segmento= req.body
        try{
            const [segmentos]= await pool.query('SELECT * FROM historia WHERE segmento =?' [segmento]);
            if(segmento !=""){
                res.json(segmento);
            }else{
                res.json("no se encontraron datos");
            }
        }
        catch(excepcion){
            res.status(500).json("hubo un error")
        }
    }

    controllerHistorial.buzon =async(req, res)=>{
        const zona= req.body
        try{
            const [zonas] =await pool.query('SELECT * FROM historial WHERE =?',[zona]);
        if(zona!=""){
            res.json(zonas);
        }else{
            res.json("No se encontro ningun segemnto");
        }
        }
        catch(excepcion){
            res.status(500).json("erro")
        }
    
    }

    controllerHistorial.buscumpli = async(req,res)=>{
        const cumplimiento= req.body
        try{
            const [cumplimientos]= await pool.query('SELECT * FROM historial WHERE =?',[cumplimiento]);
        if(cumplimientos != ""){
            res.json(cumplimientos)
        }else{
            res.json("no se encontraron datos")
            }      
        }
        catch(excepcion){
            res.status(500).json("error")
            }
    }

    controllerHistorial.busfecha=async(req,res)=>{
        const fecha= req.body
        try{
            const fe = fecha+"%"
            const [fechas]=await pool.query('SELEC * FROM hitorial WHERE =?  ',[fe])
            if(fechas != ""){
                res.json(fechas)
            }else{
                res.json("no se encontro ningun reguistro")
            }
        }
        catch(excepcion){
            res.status(500).json("error")
        }
    }

module.exports = controllerHistorial