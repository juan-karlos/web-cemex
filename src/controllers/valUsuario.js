const pool = require("../database");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateRandomToken = require("../emails/tokenGenerator.js");
const transporter = require("../emails/mailer.js");
const { token } = require("morgan");

const controladorUsuario = {};

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
    const { user, correo, apellidos } = req.body; // <--esto son los datos que envolvere en el tokenData

    let passwordHash = await bcryptjs.hash(contra, 8); // <-- este se esta agregando al inicio que es el token de la contraseña

    const token = await generateRandomToken(); //< --genera un token para la verificacion del correo
    const tokenData = jwt.sign(
      { correo, user, apellidos, passwordHash },
      "secreto",
      { expiresIn: "15m" }
    ); //<--envuelvo todos los datos que mandare

    // Enviar correo electrónico con el token
    await transporter.sendMail({
      from: '"Admin" <fortijc@gmail.com>', // Envia el correo
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
                <a href="http://localhost:3200/api/login/verifica/${token}/${tokenData}">
                    <button id="aceptar">Aceptar</button>
                </a>
                <a href="http://localhost:3200/api/login/cancelar/${token}">
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
      const { correo, user, apellidos, passwordHash } = decodedToken;

      const [email] = await pool.query(
        "SELECT correo_electronico FROM usuarios WHERE correo_electronico = ?",
        [correo]
      );
      if (email.length <= 0) {
        // Realiza la inserción del usuario en la base de datos
        const [insert] = await pool.query(
          "INSERT INTO usuarios (correo_electronico, nombre_usuario, apellidos, contrasena) VALUES (?, ?, ?, ?)",
          [correo, user, apellidos, passwordHash]
        );
        res.status(200).json({ message: "Registro completado con éxito" });
      } else {
        res.json({ error: "El correo que ingresaste ya existe" });
      }
    } catch (excepcion) {
      if (excepcion.name === "TokenExpiredError") {
        res.status(401).json({ error: "Token expirado" });
      }
    }
  } catch (error) {
    res.status(500).json("No fue posible conectar con el servidor.");
  }
};

controladorUsuario.cancelacion = async (req, res) => {
  try {
    const tokenv = req.params.token;

    res.status(401).json({
      message: "No ha sido validado el registro",
      tokenv,
    });
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
  try {
    const correo = req.body.correo;
    const contrasena = req.body.password;

    const [bdpassword] = await pool.query(
      "select contrasena from usuarios where correo_electronico= ?",
      [correo]
    );

    if (bdpassword.length > 0) {
      contrabd = JSON.stringify(bdpassword);
      let encriptedbd = contrabd.substring(16, 76);

      let compare = bcryptjs.compareSync(contrasena, encriptedbd);

      if (compare) {
        await pool.query("Delete From usuarios Where correo_electronico= ? ", [
          correo,
        ]);
        res.status(200).json("Usuario eliminado.");
      } else {
        res.status(400).json("contraseña o correo electronico no es correcto.");
      }
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

controladorUsuario.actualizarContrasena = async (req, res) => {
  try {
    const correo = req.body.correo;
    const contra = req.body.password;
    const contranueva = req.body.passnuevo;

    const [bdpassword] = await pool.query(
      "select contrasena from usuarios where correo_electronico= ? ",
      [correo]
    );
    if (bdpassword.length > 0) {
      // const passwor = bdpassword[0].params.contrasena;
      contrabd = JSON.stringify(bdpassword);
      let encriptedbd = contrabd.substring(16, 76);
      let compare = bcryptjs.compareSync(contra, encriptedbd);
      if (compare) {
        let passwordHash = await bcryptjs.hash(contranueva, 8);
        await pool.query(
          `UPDATE usuarios SET contrasena=ifNULL(?,contrasena) WHERE correo_electronico=?`,
          [passwordHash, correo]
        );
        res.json("se actualizon con exito");
      } else {
        res.json("no se encuentra el usuario");
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

module.exports = controladorUsuario;
