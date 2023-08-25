//ValUsuario

const { json } = require('express');
const pool = require('../database')
const bcryptjs= require('bcryptjs');

const controladorUsuario={}

controladorUsuario.uniUsuario = async(req,res )=>{
    const [usuario] = await pool.query("select *  From usuarios ");
    res.send(usuario)
}
controladorUsuario.regisUsu=async(req,res)=>{

    const contra = req.body.password;
    let passwordHash= await bcryptjs.hash(contra,8)
        const {user,correo,}=req.body
        try{
            await pool.query('INSERT INTO usuarios (correo_electronico,Nombre_usuario,contrasena) VALUES (?,?,?)',[correo,user,passwordHash])
            res.send("el usuario se inserto correctamente");
       
        } catch(Excepcion){
            res.send("el correo que insertaste ya esta registrado")
        }
}    
controladorUsuario.comparacion= async(req,res)=>{
    const correo= req.body.correo;
    const [bdpassword] =  await pool.query('select contrasena from usuarios where correo_electronico= ? ',[correo]); 
    const contra = req.body.password;
    contrabd = JSON.stringify(bdpassword);
    let encriptedbd = contrabd.substring(16,76);
    let compare =bcryptjs.compareSync(contra,encriptedbd);
    if(compare){
        res.send("vienvenido")
    }else
        res.send("no se encuentra el usuario")

}

controladorUsuario.eliminar =async(req,res)=>{
    const correo = req.body.correo;
    const [bdpassword] =  await pool.query('select contrasena from usuarios where correo_electronico= ? ',[correo]); 
    contrabd = JSON.stringify(bdpassword);
    let encriptedbd = contrabd.substring(16,76);

    const contrasena = req.body.password;
    let compare =bcryptjs.compareSync(contrasena,encriptedbd);

    if(compare){
        await pool.query('Delete From usuarios Where correo_electronico= ? ',[correo]);
        res.send("Usuario eliminado");
    }else{
        res.send("contraseña o correo electronico no es correcto")
    }
    
}
controladorUsuario.actualizar=async(req,res)=>{
    const {correo,password,user}=req.body
    const [usuario]= await pool.query('SELECT * from usuarios where correo=?' ,[correo]);
    if(correo !=""){
    }
}



module.exports=controladorUsuario