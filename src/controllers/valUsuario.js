
const { json } = require('express');
const pool = require('../database')
const bcryptjs= require('bcryptjs');

const controladorUsuario={}

controladorUsuario.verificar=async(req,res)=>{

    const contra = req.body.password;

    //  const [bduser] = await pool.query('Select nombre FROM usuarios WHERE nombre=?',[user]);

    // const [bdpassword] = await pool.query('Select contrasena FROM usuarios WHERE contrasena=?',[passwordHash])
    // const contraseña= toString(bdpassword);

    let passwordHash= await bcryptjs.hash(contra,8)
    
        // res.json({
        //     passwordHash:passwordHash
        // })

        const {id_usuario,correo_electronico,nombre_user}=req.body
        try{
            
        const  [insert] = await pool.query('INSERT INTO usuarios VALUES (?,?,?,?)',[id_usuario,correo_electronico,nombre_user,passwordHash])
        res.send("tipo insertado");
        } catch(Excepcion){
            res.send("El correo electronico esta repetido")
        }




    // if (usuario == bduser && contra ==bdpassword){
    //     let passwordHash= await bcryptjs.hash(contra,8)
    //     res.json({
    //         message:'Autenticacion Existosa ',
    //         passwordHash:passwordHash
    //     });
    // }else{
    //     res.json({message:'Ingrese correctamente los datos correctos'})
    // }
    



    // let passwordHash= await bcryptjs.hash(contra,6);
        // if (usuario && contra){
        
        //     pool.query('Select * FROM usuarios where Nombre = ?', [usuario], async(error,result)=>{

        //         if(result.length==0 || !(await bcryptjs.compare(contra,result[0].contra))){
                    
        //             res.send('"estatus":"Confirmado"');
                    
        //         }else{
        //             // res.send('login correcto');
        //             res.send('"estatus":"Confirmado"');
        //         }
        //     })
        //     res.send("saltado")
        // }
    }
    //         if(result.lengt==0 || !(await bcryptjs.compare(password,result[0].password))){
    //             res.send('usuario y o pasword incorrectos');
    //         }else {
    //             res.send('login correcto');
    //         }
    //     })
    // }  


    // const [bduser] = await pool.query('Select nombre FROM usuarios WHERE nombre=?',[user]);

    // const [bdpassword] = await pool.query('Select contrasena FROM usuarios WHERE contrasena=?',[passwordHash])
    // const contraseña= toString(bdpassword);
    // let hashSaved =contraseña;
    // let compare =bcryptjs.compareSync(password,hashSaved);
    // if(compare){
    //     res.json('verificado')
    // }else{
        
    // // res.json(bdpassword)
    // res.json({
    //     message:bdpassword,
    //     passwordHash:passwordHash
    // })
    
    
    // }
    
    
    controladorUsuario.comparacion= async(req,res)=>{
    const usuario= req.body.user;
    const [bdpassword] =  await pool.query('select contrasena from usuarios where Nombre_usuario= ? ',[usuario]); 
    // const texto =json.parse(bdpassword)

    const contra = req.body.password;
    // let hola ='$2a$08$JmE4ZUHds3yZMYT1HcccyOectochk5aHbfnXDNAbCFgy5TFCN0kyK';
    // const newStr = contra.substring(bdpassword) //11

    contrabd = JSON.stringify(bdpassword);
    let encriptedbd = contrabd.substring(16,76);
    // res.json(encriptedbd)
    
    
    let compare =bcryptjs.compareSync(contra,encriptedbd);
    if(compare){
        
        // res.json('verificado')
        // res.send(bdpassword)
        // console.log(bdpassword.length);
        // const newStr = contrasena.substring(1)
        // res.send(texto)
        // let contra=bdpassword[0]
        // const newStr = contra.substring(bdpassword)
        // res.send(bdpassword)

        // res.send(contra)

        // res.send(newStr)

        res.send(encriptedbd)
    }else
    res.send("no es ")

    // res.send(contra)
}
module.exports=controladorUsuario