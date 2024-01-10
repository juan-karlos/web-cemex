const pool = require("../database");
const axios = require('axios');
const nodemailer = require('nodemailer');
const exceljs = require('exceljs');
const generateRandomToken = require('../emails/tokenGenerator.js');
const transporter = require ('../emails/mailer.js');

const controladorVencimiento = {}; 
// hace la actualizacion de permisos y realiza el envio de emails a los que estan registrados en la base de datos.
controladorVencimiento.updateToVencimiento = async (req, res) => {
    try {
        const response = await axios.get('http://worldtimeapi.org/api/ip'); // Obtener fecha actual desde la red
        const networkDate = new Date(response.data.utc_datetime);
    
        const localDate = new Date();     // fecha actual en la zona horaria local
        const timezoneOffset = localDate.getTimezoneOffset();// Obtener la diferencia de tiempo (offset) en minutos
    
        // Ajustar la fecha local sumando el offset
        const adjustedLocalDate = new Date(localDate.getTime() + timezoneOffset * 60 * 1000);
    
        // Obtener registros con fecha de vencimiento igual o anterior a la fecha actual
        const [registrosVencidos] = await pool.query(
            'SELECT id_registro FROM registro WHERE fecha_vencimiento <= ? AND estatus = "Vigente"',
            [adjustedLocalDate]
        );

        if (registrosVencidos.length > 0) {
            // Actualizar el estado de los registros a "Vencido"
            await pool.query(
            'UPDATE registro SET estatus = "Vencido" WHERE id_registro IN (?)',
            [registrosVencidos.map((registro) => registro.id_registro)]
            );
            
            //Mando a traer todos los requerimientos vencidos 
            const [rows] = await pool.query(`SELECT
                requerimiento.nombre_requerimiento as requerimiento,
                requerimiento.siglas as siglas,
                requerimiento.impacto as impacto,
                unidad_operativa.nombre_planta as planta,
                registro.estatus as estatus
            FROM
                registro
                JOIN requerimiento  ON registro.id_requerimiento = requerimiento.id_requerimiento
                JOIN unidad_operativa ON registro.id_planta = unidad_operativa.id_planta
            WHERE
                registro.id_registro IN (?)`, 
            [registrosVencidos.map((registro) => registro.id_registro)]);
            
            if (rows.length > 0) {
                // Crear un nuevo libro de Excel
                const workbook = new exceljs.Workbook();
                const worksheet = workbook.addWorksheet('Requerimientos Vencidos');
    
                // Agregar encabezados
                worksheet.columns = [
                    { header: 'Planta', key: 'planta', width: 40 },
                    { header: 'Requerimiento', key: 'requerimiento', width: 40 },
                    { header: 'Siglas', key: 'siglas', width: 10  },
                    { header: 'Impacto', key: 'impacto', width: 15  },
                    { header: 'Estatus', key: 'estatus', width: 10  }
                ];
    
                // Agregar datos al libro de Excel
                worksheet.addRows(rows);
    
                // Guardar el libro de Excel en un buffer
                const buffer = await workbook.xlsx.writeBuffer();
    
                // Generar un nombre único para el archivo Excel
                const excelFileName = `RequerimientosVencidos ${adjustedLocalDate}.xlsx`;
                
                //traer todos los correos de los usuarios
                const [correos] = await pool.query('Select correo_electronico from usuarios')
                const correo = correos.map((usuario) => usuario.correo_electronico);

                // Enviar correo electrónico con el archivo adjunto
                const info = await transporter.sendMail({
                    from: '"Admin" <fortijc@gmail.com>',
                    to: correo,
                    subject: 'Requerimientos Vencidos',
                    text: 'Adjunto encontrarás los requerimientos vencidos.',
                    attachments: [{
                        filename: excelFileName,
                        content: buffer,
                        encoding: 'base64'
                    }]
                });
    
                console.log('envio de emails correctamente')
    
            } else {
                res.status(200).json({
                    message: 'No hay requerimientos vencidos con datos para enviar.'
                });
            }

            console.log('Estado de registros actualizado a "Vencido".');
        }else{
            // console.error('no hay requerimientos vencidos');
            res.status(200).json({
                message: 'no hay requerimientos vencidos'
            })
        }
  
      console.log('Tarea programada ejecutada correctamente.');
    } catch (excepcion) {
      console.error('Error en la tarea programada:', excepcion);
    }
  };
module.exports = controladorVencimiento;