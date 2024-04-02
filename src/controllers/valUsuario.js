const pool = require("../database");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateRandomToken = require("../emails/tokenGenerator.js");
const transporter = require("../emails/mailer.js");
const { token } = require("morgan");

const controladorUsuario = {};

const gmail = "devsolidit@gmail.com"


controladorUsuario.todosUsuarios= async(req,res)=>{
  try{
    const [usuarios]= await pool.query("SELECT id_usuario, nombre_usuario,apellidos,correo_electronico,zona_asignada,rol FROM usuarios")
    if(usuarios.length>=1){
      res.status(200).json(usuarios)
    }else{
      res.status(404).json({message:"No se encontraron Usuarios"})
    }
  }catch(error){
    console.log(error)
    res.status(500).json({message:"Error del sistema"})
  }

}

controladorUsuario.uniUsuario = async (req, res) => {
  try {
    const [usuario] = await pool.query("select *  From usuarios ");
    res.send(usuario);
  } catch (error) {
    res.status(500).json("No fue posible establecer conexion con el servidor.");
  }
};

controladorUsuario.regisUsu = async (req, res) => {
  try {
    const contra = req.body.password;
    const { user, correo, apellidos,zona,rol } = req.body; // <--esto son los datos que envolvere en el tokenData

    let passwordHash = await bcryptjs.hash(contra, 8); // <-- este se esta agregando al inicio que es el token de la contraseña

    const token = await generateRandomToken(); //< --genera un token para la verificacion del correo
    const tokenData = jwt.sign(
      { correo, user, apellidos, passwordHash,zona,rol },
      "secreto",
      { expiresIn: "24h"}
    ); //<--envuelvo todos los datos que mandare

    // Enviar correo electrónico con el token
    await transporter.sendMail({
      from: `"Admin" <${gmail}>`, // Envia el correo
      to: correo, // Lista de los correos que lo recibirán
      subject: "Verificación de seguridad.", // Este será el asunto
      html: `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Validacion</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        margin: 20px;
                    }

                    button {
                        padding: 10px 20px;
                        font-size: 16px;
                        margin: 5px;
                        cursor: pointer;
                    }

                    #cancelar {
                        background-color: #e74c3c;
                        color: #fff;
                        border: none;
                    }

                    #aceptar {
                        background-color: #2ecc71;
                        color: #fff;
                        border: none;
                    }
                    img {
                        padding: 1px 1px;
                        width: 200px;  /* Ancho deseado en píxeles */
                        height: 200px; /* Altura deseada en píxeles */
                    }
                </style>
            </head>
            <body>
                <h1>Verificación de datos.</h1>
                <img src="https://static.vecteezy.com/system/resources/previews/006/925/139/non_2x/play-button-white-color-lock-user-account-login-digital-design-logo-icon-free-photo.jpg" alt="Inicio de sesión">
                <h3>Para concluir con el registro, valida en el siguiente campo.</h3>
                <a href="http://86.38.204.102:3200/api/login/verifica/${token}/${tokenData}">
                    <button id="aceptar">Aceptar</button>
                </a>
                <a href="http://86.38.204.102:3200/api/login/cancelar/${token}">
                    <button id="cancelar">Cancelar</button> 
                </a>
            </body>
            </html>
            `,
    });

    res
      .status(200)
      .json({
        message:
          "Se ha enviado un correo para verificar el registro con tiempo limite de 15 minutos",
      });
  } catch (error) {
    console.log(error)
    console.log("faltaron datos")
    res.status(500).json({
      message: "No fue posible establecer conexion con el servidor.",
    });
  }
};

controladorUsuario.verificaRegistro = async (req, res) => {
  try {
    const tokenData = req.params.tokenData;
    try {
      const decodedToken = jwt.verify(tokenData, "secreto");
      const {  correo, user, apellidos, passwordHash,zona,rol } = decodedToken;
    
      const [email] = await pool.query(
        "SELECT correo_electronico FROM usuarios WHERE correo_electronico = ?",
        [correo]
      );
      if (email.length <= 0) {
        // Realiza la inserción del usuario en la base de datos
        const [insert] = await pool.query(
          "INSERT INTO usuarios (correo_electronico, nombre_usuario, apellidos, contrasena,zona_asignada,rol) VALUES (?, ?, ?, ?, ?, ?)",
          [correo, user, apellidos, passwordHash,zona,rol]
        );
        res.status(200).send(
        `<!DOCTYPE html>
        <html lang="es">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registro Completado</title>
        <style>
          body {
            background-color: #05265b;
            font-family: Arial, sans-serif;
          }
          .container {
            text-align: center;
            margin-top: 100px;
          }
          .success-message {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            font-size: 24px;
            width: 300px;
            margin: 0 auto;
          }
        </style>
        </head>
        <body>
        <div class="container">
          <div class="success-message">
            ¡Registro completado con éxito bienvenido!
          </div>
        </div>
        </body>
        </html>`);
      } else {
        res.send(`<!DOCTYPE html>
        <html lang="es">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registro Completado</title>
        <style>
          body {
            background-color: #05265b;
            font-family: Arial, sans-serif;
          }
          .container {
            text-align: center;
            margin-top: 100px;
          }
          .success-message {
            background-color: #cfd441;
            color: rgb(0, 0, 0);
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            font-size: 24px;
            width: 300px;
            margin: 0 auto;
          }
        </style>
        </head>
        <body>
        <div class="container">
          <div class="success-message">
            ¡El correo ya existe intente de nuevo!
          </div>
        </div>
        </body>
        </html>` );
      }
    } catch (excepcion) {
      if (excepcion.name === "TokenExpiredError") {
        res.status(404).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registro Completado</title>
        <style>
          body {
            background-color: #05265b;
            font-family: Arial, sans-serif;
          }
          .container {
            text-align: center;
            margin-top: 100px;
          }
          .success-message {
            background-color: #a61a1a;
            color: #eae6e6;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            font-size: 24px;
            width: 300px;
            margin: 0 auto;
          }
        </style>
        </head>
        <body>
        <div class="container">
          <div class="success-message">
            <h1>Error</h1>
            ¡Error el tiempo de verificación expiro!
          </div>
        </div>
        </body>
        </html>
        `);
      }
    }
  } catch (error) {
    res.status(500).json("No fue posible conectar con el servidor.");
  }
};

controladorUsuario.cancelacion = async (req, res) => {
  try {
    const tokenv = req.params.token;

    res.status(401).send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro Completado</title>
    <style>
      body {
        background-color: #05265b;
        font-family: Arial, sans-serif;
      }
      .container {
        text-align: center;
        margin-top: 100px;
      }
      .success-message {
        background-color: #a61a1a;
        color: #eae6e6;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        font-size: 24px;
        width: 300px;
        margin: 0 auto;
      }
    </style>
    </head>
    <body>
    <div class="container">
      <div class="success-message">
        <h1>Registro no completado</h1>
        ¡Verificación Rechazada!
      </div>
    </div>
    </body>
    </html>
    `)
  } catch (error) {
    res.status(500).json("No fue posible conectar con el servidor.");
  }
};

controladorUsuario.comparacion = async (req, res) => {
  try {
    const correo = req.body.correo;
    const contra = req.body.password;

    const [usuario] = await pool.query(
      "select contrasena, id_usuario from usuarios where correo_electronico = ?",
      [correo]
    );

    if (usuario.length > 0) {
      const encriptedbd = usuario[0]["contrasena"];
      const userId = usuario[0]["id_usuario"];

      let compare = bcryptjs.compareSync(contra, encriptedbd);

      if (compare) {
        // Credenciales válidas, genera un token
        const access_token = jwt.sign({ userId, correo }, "1a2b3c4d5", {
          expiresIn: "12h",
        });

        // Envía el token como respuesta
        console.log(access_token)
        res.json({ access_token });
      } else {
        res.status(404).json({ message: "Contraseña incorrecta" });
      }
    } else {
      res.status(404).json({ message: "No se encuentra el usuario" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "No se pudo establecer conexión con el servidor." });
  }
};

controladorUsuario.administrador = async (req, res) => {
  try {
    const correo = req.body.correo;
    const contra = req.body.password;

    const [usuario] = await pool.query(
      "select contrasena, id_usuario from usuarios where correo_electronico = ? and rol ='Administrador'",
      [correo]
    );

    if (usuario.length > 0) {
      const encriptedbd = usuario[0]["contrasena"];
      const userId = usuario[0]["id_usuario"];

      let compare = bcryptjs.compareSync(contra, encriptedbd);

      if (compare) {
        // Credenciales válidas, genera un token
        const access_token = jwt.sign({ userId, correo }, "1a2b3c4d5", {
          expiresIn: "12h",
        });

        // Envía el token como respuesta
        console.log(access_token)
        res.json({ access_token });
      } else {
        res.status(404).json({ message: "Contraseña incorrecta" });
      }
    } else {
      res.status(404).json({ message: "No se encuentra el usuario" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "No se pudo establecer conexión con el servidor." });
  }
};

controladorUsuario.eliminar = async (req, res) => {
  ////---revisar
  let id_usuario ={ id_usuario:req.params.id_usuario}
  id_usuario = JSON.stringify(id_usuario)
  let rec = /(\d+)/g;
  const idrecu = id_usuario.match(rec);
  try {
    const [bdpassword] = await pool.query(
      "select contrasena from usuarios where id_usuario= ?",
      [idrecu]
    );

    if (bdpassword.length > 0) {
        await pool.query("Delete From usuarios Where id_usuario= ? ", [idrecu]);
        res.status(200).json("Usuario eliminado.");
    } else {
      res
        .status(400)
        .json(
          "No se encontro ningun correo que cincida con el que proporcionaste."
        );
    }
  } catch (error) {
    res.status(500).json({
      Error: "No se pudo conectar con el servidor.",
    });
  }
};

controladorUsuario.usuario = async(req,res)=>{
  let id_usuario= {id_usuario:req.params.id_usuario}
  id_usuario = JSON.stringify(id_usuario)
  let rec = /(\d+)/g;
  const idrecu = id_usuario.match(rec);
  const consulta= 'SELECT id_usuario, nombre_usuario,apellidos,correo_electronico,zona_asignada,rol FROM usuarios WHERE id_usuario = ? '
  try{
    const [usuario] = await pool.query(consulta,[idrecu])
    if(usuario.length>=1){
      res.status(200).json(usuario)
    }
    else{
      res.status(400).json({message:"No se encontraron usuarios"})
    }
  }catch(error){
    console.log(error)
    res.status(500).json({message:"Error interno"})
  }
}

controladorUsuario.recucontra = async (req, res) => {
  const correo = req.body.correo;
  let query = 'SELECT * FROM usuarios WHERE correo_electronico = ?';
  let actualiza ='UPDATE usuarios SET contrasena = ifNULL(?,contrasena) WHERE correo_electronico = ? '

  try{
    const [consulta] = await pool.query(query, [correo]);
  
    if (consulta.length > 0) {
      let caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let longitud = 6;
      let resultado = '';
      for (let i = 0; i < longitud; i++) {
        resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }
      await transporter.sendMail({
        from: `"Admin" <${gmail}>`, // Envia el correo
        to: correo, // Lista de los correos que lo recibirán
        subject: "Nueva contraseña.", // Este será el asunto
        html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Información en Correo Electrónico</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #1a3c86;
            }
            .container {
              width: 80%;
              margin: 20px auto;
            }
            .header {
              background-color: #f5f5f5;
              padding: 20px;
              border-bottom: 1px solid #000000;
            }
            .header h1 {
              margin: 0;
            }
            .content {
              padding: 20px;
            }
            .info-box {
              border: 1px solid #000000;
              padding: 10px;
              margin-bottom: 20px;
              background-color: #f9f9f9;
            }
            .info-box h2 {
              margin-top: 0;
            }
            .info-box p {
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Nueva contraseña</h1>
              <h4>Estimado(a)</h4>
              <p>Recientemente has solicitado restablecer tu contraseña, y te enviamos una nueva que funciona para que puedas entrar a tu perfil de CEMEX</p>
               
            </div>
            <div class="content">
              <div class="info-box">
                <h2>Se Actualizo su contraseña</h2>
                <p>Su nueva contraseña es ${resultado}</p>
              </div>
              <div class="info-box">
                <h2>Recomendaciones</h2>
                <p>Por favor vuelva al inicio e ingrese la nueva contraseña para volver ingresar</p>
               
              </div>
            </div>
          </div>
        </body>
        </html>
              `,
      });

      let passwordHash = await bcryptjs.hash(resultado, 8);

      await pool.query(actualiza,[passwordHash,correo])
      console.log(passwordHash); 
      console.log(resultado)
      // Imprime el resultado en la consola
      res.status(200).json({ message: 'Se generó un código aleatorio y se envio al correo.' });
    } else {
     res.status(404).json({ message: 'Usuario no encontrado' });
    }
  }catch(error){
    console.log(error)
    res.status(500).json({message:"Hay un error interno revise el servidor"})
  }

}



//cambiar contrsaseña para los usuarios

controladorUsuario.actualizarContrasena = async (req, res) => {
  try {
    const correo = req.body.correo;
    const password = req.body.password;
    const passnuevo = req.body.passnuevo;

    const [bdpassword] = await pool.query(
      "select contrasena from usuarios where correo_electronico= ? ",
      [correo]
    );
    if (bdpassword.length > 0) {
      // const passwor = bdpassword[0].params.contrasena;
      contrabd = JSON.stringify(bdpassword);
      let encriptedbd = contrabd.substring(16, 76);
      let compare = bcryptjs.compareSync(password, encriptedbd);
      if (compare) {
        let passwordHash = await bcryptjs.hash(passnuevo, 8);
        await pool.query(
          `UPDATE usuarios SET contrasena=ifNULL(?,contrasena) WHERE correo_electronico=?`,
          [passwordHash, correo]
        );
        res.status(200).json("se actualizon con exito");
      } else {
        res.status(200).json("no se encuentra el usuario");
      }
    } else {
      res.status(400).json({
        message:
          "No se encontro una contraseña ligada al correo que proporcionaste",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "No hay conexion con el servidor",
    });
  }
};

controladorUsuario.actualizarinfo=async(req,res)=>{
  let id_usuario ={ id_usuario:req.params.id_usuario}
  id_usuario = JSON.stringify(id_usuario)
  let rec = /(\d+)/g;
  const idrecu = id_usuario.match(rec);

  const { user, correo, apellidos,zona,rol } = req.body
  try{
    console.log("Se actualizo este usuario")
  const [usuario]= await pool.query("SELECT * FROM usuarios WHERE id_usuario = ?" , [idrecu])
  console.log(usuario)
 if(usuario.length>=1){
  let actualizar = `
  UPDATE usuarios SET nombre_usuario=ifNULL(?,nombre_usuario),
  apellidos = ifNULL(?,apellidos),correo_electronico = ifNULL(?,correo_electronico),
  zona_asignada = ifNULL(?,zona_asignada),rol= ifNULL(?,rol) 
  where id_usuario = ?  `
 await pool.query(actualizar,[user,apellidos,correo,zona,rol,idrecu])
 res.status(200).json({message:"Se actualizo con exito"})
 
 }else{
  res.status(400).json({message:"No se encontro al usuario"})
 }
} catch (error){
  console.log(error)
  res.status(500).json({message:"Error interno revise el servidor"})
}

 

}



module.exports = controladorUsuario;
