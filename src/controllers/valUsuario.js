const pool = require('../database')
const bcryptjs= require('bcryptjs')
const controladorUsuario={}

controladorUsuario.verificar=async(req,res)=>{

    const user = req.body.user;
    const password = req.body.password;
    
    if (user == 'admin' && password =='11'){
        let passwordHash= await bcryptjs.hash(password,8)
        res.json({
            message:'Autenticacion Existosa ',
            passwordHash:passwordHash
        });
    }else{
        res.json({message:'Ingrese correctamente los datos correctos'})
    }
    
}

controladorUsuario.comparacion=(req,res)=>{
    let hashSaved ='$2a$08$JmE4ZUHds3yZMYT1HcccyOectochk5aHbfnXDNAbCFgy5TFCN0kyK';
    let compare =bcryptjs.compareSync('11',hashSaved);
    if(compare){
        res.json('verificado')
    }else
    res.json('no es igual')
}
module.exports=controladorUsuario