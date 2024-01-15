const pool = require("../database.js");
const axios = require('axios');
const nodemailer = require('nodemailer');
const exceljs = require('exceljs');
const generateRandomToken = require('../emails/tokenGenerator.js');
const transporter = require ('../emails/mailer.js');
const { json } = require("body-parser");

const controladorVencimiento = {}; 
// hace la actualizacion de permisos y realiza el envio de emails a los que estan registrados en la base de datos.
controladorVencimiento.updateToVencimiento = async (req, res) => {
    try {
        const response = await axios.get('http://worldtimeapi.org/api/ip'); // Obtener fecha actual desde la red
        const utcRed = response.data.utc_datetime;

        // Trabajar directamente con la hora UTC de la red
        const networkDate = new Date(utcRed);

        // Obtener la diferencia de tiempo (offset) en minutos
        const timezoneOffset = networkDate.getTimezoneOffset();

        // Ajustar la fecha local restando el offset
        const adjustedLocalDate = new Date(networkDate.getTime() - timezoneOffset * 60 * 1000);

        const fecha = adjustedLocalDate.toISOString().split('T')[0]; //recupero solo la fecha actual

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
                const excelFileName = `Requerimientos Vencidos, fecha: ${fecha}.xlsx`;
                
                //traer todos los correos de los usuarios
                const [correos] = await pool.query('Select correo_electronico from usuarios')
                const correo = correos.map((usuario) => usuario.correo_electronico);

                // Enviar correo electrónico con el archivo adjunto
                const info = await transporter.sendMail({
                    from: '"Admin" <fortijc@gmail.com>',
                    to: correo,  //a quien se le envia el correo 
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
                    message: 'No hay requerimientos vencidos en este dia.'
                });
            }

            console.log('Estado de registros actualizado a "Vencido".');
        }else{
            console.error('no hay requerimientos vencidos');
        }
  
      console.log('Tarea programada ejecutada correctamente.');
    } catch (excepcion) {
      console.error('Error en la tarea programada:', excepcion);
    }
  };

controladorVencimiento.vencSiguienteDia = async (req, res) => {
    try {
        const response = await axios.get('http://worldtimeapi.org/api/ip'); // Obtener fecha actual desde la red
        const utcRed = response.data.utc_datetime;

        // Trabajar directamente con la hora UTC de la red
        const networkDate = new Date(utcRed);

        // Obtener la diferencia de tiempo (offset) en minutos
        const timezoneOffset = networkDate.getTimezoneOffset();

        // Ajustar la fecha local sumando el offset
        const adjustedLocalDate = new Date(networkDate.getTime() - timezoneOffset * 60 * 1000);

        //solo trae la fecha 
        const fechaR = adjustedLocalDate.toISOString().split('T')[0];

        function formatoFecha(fecha) {
            const partesFecha = fecha.split('-');
            const anio = partesFecha[0];
            const mes = partesFecha[1];
            const dia = partesFecha[2];
            return `${anio}/${mes}/${dia}`;
        }

        const fechaFormateada = formatoFecha(fechaR);

        //recupero la fecha de mañana
        const [fechaAdelantada] = await pool.query(
            `SELECT DATE_ADD(?, INTERVAL 1 DAY) as FechaManana`,[fechaFormateada]
        );
        
        const fechaFormateada2 = formatoFecha(fechaAdelantada[0].FechaManana);
        
        //consulta que trae todos los requeriminetos que venceran mañana
        const [IdRegistro] = await pool.query(`SELECT id_registro FROM registro WHERE fecha_vencimiento = ? AND estatus = "Vigente"`,[fechaFormateada2])
        
        if (IdRegistro.length > 0) {
            
            //Mando a traer todos los requerimientos vencidos 
            const [rows] = await pool.query(`SELECT
                requerimiento.nombre_requerimiento as requerimiento,
                requerimiento.siglas as siglas,
                requerimiento.impacto as impacto,
                unidad_operativa.nombre_planta as planta,
                registro.estatus as estatus,
                registro.fecha_vencimiento as data
            FROM
                registro
                JOIN requerimiento  ON registro.id_requerimiento = requerimiento.id_requerimiento
                JOIN unidad_operativa ON registro.id_planta = unidad_operativa.id_planta
            WHERE
                registro.id_registro IN (?)
                ORDER BY registro.fecha_vencimiento ASC`, 
            [IdRegistro.map((registro) => registro.id_registro)]);
            
            if (rows.length > 0) {
                // Crear un nuevo libro de Excel
                const workbook = new exceljs.Workbook();
                const worksheet = workbook.addWorksheet('Requerimientos apunto de vencer');
    
                // Agregar encabezados
                worksheet.columns = [
                    { header: 'Planta', key: 'planta', width: 40 },
                    { header: 'Requerimiento', key: 'requerimiento', width: 40 },
                    { header: 'Siglas', key: 'siglas', width: 10  },
                    { header: 'Impacto', key: 'impacto', width: 15  },
                    { header: 'Estatus', key: 'estatus', width: 10  },
                    { header: 'Fecha Vencimiento', key: 'data', width: 10 }
                ];
    
                // Agregar datos al libro de Excel
                worksheet.addRows(rows);
    
                // Guardar el libro de Excel en un buffer
                const buffer = await workbook.xlsx.writeBuffer();
    
                // Generar un nombre único para el archivo Excel
                const excelFileName = `Requerimientos que vencen Mañana, fecha: ${fechaAdelantada[0].FechaManana}.xlsx`;
                
                //traer todos los correos de los usuarios
                const [correos] = await pool.query('Select correo_electronico from usuarios')
                const correo = correos.map((usuario) => usuario.correo_electronico);

                // Enviar correo electrónico con el archivo adjunto
                const info = await transporter.sendMail({
                    from: '"Admin" <fortijc@gmail.com>',
                    to: correo,  //a quien se le envia el correo 
                    subject: 'Requerimientos que venceran mañana',
                    text: 'Adjunto encontrarás los requerimientos que estan apunto de vencer',
                    attachments: [{
                        filename: excelFileName,
                        content: buffer,
                        encoding: 'base64'
                    }]
                });
    
                console.log('envio de emails correctamente')
    
            } else {
                res.status(200).json({
                    message: 'Ningun requerimiento vence mañana'
                });
            }

            console.log('Estos son los requerimientos que venceran mañana".');
        }else{
            console.error('Ningun requerimiento vence mañana');
        }
  
      console.log('Tarea programada ejecutada correctamente.');
    } catch (excepcion) {
      console.error('Error en la tarea programada:', excepcion);
    }
  };

  controladorVencimiento.VencenEstaSemana = async (req, res) => {
    try {
        const response = await axios.get('http://worldtimeapi.org/api/ip'); // Obtener fecha actual desde la red
        const utcRed = response.data.utc_datetime;

        // Trabajar directamente con la hora UTC de la red
        const networkDate = new Date(utcRed);

        // Obtener la diferencia de tiempo (offset) en minutos
        const timezoneOffset = networkDate.getTimezoneOffset();

        // Ajustar la fecha local sumando el offset
        const adjustedLocalDate = new Date(networkDate.getTime() - timezoneOffset * 60 * 1000);

        //solo trae la fecha 
        const fechaR = adjustedLocalDate.toISOString().split('T')[0];

        function formatoFecha(fecha) {
            const partesFecha = fecha.split('-');
            const anio = partesFecha[0];
            const mes = partesFecha[1];
            const dia = partesFecha[2];
            return `${anio}/${mes}/${dia}`;
        }

        const fechaFormateada1 = formatoFecha(fechaR);
        
        //recupero la fecha de una semana
        const [fechaAdelantada] = await pool.query(
            `SELECT DATE_ADD(?, INTERVAL 7 DAY) as semana`, [fechaFormateada1]
        );
        
        const fechaFormateada2 =  formatoFecha(fechaAdelantada[0].semana);

        //consulta que trae todos los requeriminetos que venceran esta semana
        const [IdRegistro] = await pool.query(`SELECT id_registro FROM registro WHERE fecha_vencimiento >= ? and fecha_vencimiento <= ? AND estatus = "Vigente"`,[fechaFormateada1, fechaFormateada2])

        if (IdRegistro.length > 0) {
            
            //Mando a traer todos los requerimientos vencidos 
            const [rows] = await pool.query(`SELECT
                requerimiento.nombre_requerimiento as requerimiento,
                requerimiento.siglas as siglas,
                requerimiento.impacto as impacto,
                unidad_operativa.nombre_planta as planta,
                registro.estatus as estatus,
                registro.fecha_vencimiento as data
            FROM
                registro
                JOIN requerimiento  ON registro.id_requerimiento = requerimiento.id_requerimiento
                JOIN unidad_operativa ON registro.id_planta = unidad_operativa.id_planta
            WHERE
                registro.id_registro IN (?)
                ORDER BY registro.fecha_vencimiento ASC`, 
            [IdRegistro.map((registro) => registro.id_registro)]);
            
            if (rows.length > 0) {
                // Crear un nuevo libro de Excel
                const workbook = new exceljs.Workbook();
                const worksheet = workbook.addWorksheet('Requerimientos por vencer');
    
                // Agregar encabezados
                worksheet.columns = [
                    { header: 'Planta', key: 'planta', width: 40 },
                    { header: 'Requerimiento', key: 'requerimiento', width: 40 },
                    { header: 'Siglas', key: 'siglas', width: 10 },
                    { header: 'Impacto', key: 'impacto', width: 15 },
                    { header: 'Estatus', key: 'estatus', width: 10 },
                    { header: 'Fecha Vencimiento', key: 'data', width: 10 }
                ];
    
                // Agregar datos al libro de Excel
                worksheet.addRows(rows);
    
                // Guardar el libro de Excel en un buffer
                const buffer = await workbook.xlsx.writeBuffer();
    
                // Generar un nombre único para el archivo Excel
                const excelFileName = `Requerimientos que vencen esta semana, fechaI: ${fechaFormateada1} fechaF: ${fechaFormateada2}.xlsx`;
                
                //traer todos los correos de los usuarios
                const [correos] = await pool.query('Select correo_electronico from usuarios')
                const correo = correos.map((usuario) => usuario.correo_electronico);

                // Enviar correo electrónico con el archivo adjunto
                const info = await transporter.sendMail({
                    from: '"Admin" <fortijc@gmail.com>',
                    to: correo,  //a quien se le envia el correo 
                    subject: 'Requerimientos que venceran esta semana',
                    text: 'Adjunto encontrarás los requerimientos que vencen esta semana.',
                    attachments: [{
                        filename: excelFileName,
                        content: buffer,
                        encoding: 'base64'
                    }]
                });
    
                console.log('envio de emails correctamente')
    
            } else {
                res.status(200).json({
                    message: 'Ningun requerimiento vence esta semana'
                });
            }

            console.log('Estos son los requerimientos que venceran esta semana".');
        }else{
            console.error('Ningun requerimiento vence esta semana');
        }
  
      console.log('Tarea programada ejecutada correctamente.');
    } catch (excepcion) {
      console.error('Error en la tarea programada:', excepcion);
    }
  };

controladorVencimiento.unMes = async (req, res) => {
    try {
        const response = await axios.get('http://worldtimeapi.org/api/ip'); // Obtener fecha actual desde la red
        const utcRed = response.data.utc_datetime;

        // Trabajar directamente con la hora UTC de la red
        const networkDate = new Date(utcRed);

        // Obtener la diferencia de tiempo (offset) en minutos
        const timezoneOffset = networkDate.getTimezoneOffset();

        // Ajustar la fecha local sumando el offset
        const adjustedLocalDate = new Date(networkDate.getTime() - timezoneOffset * 60 * 1000);

        //solo trae la fecha 
        const fechaR = adjustedLocalDate.toISOString().split('T')[0];

        function formatoFecha(fecha) {
            const partesFecha = fecha.split('-');
            const anio = partesFecha[0];
            const mes = partesFecha[1];
            const dia = partesFecha[2];
            return `${anio}/${mes}/${dia}`;
        }

        const fechaFormateada1 = formatoFecha(fechaR); //formato de la fecha actual

        //recupero la fecha de un mes
        const [fechaAdelantada] = await pool.query(
            `SELECT DATE_ADD(?, INTERVAL 1 MONTH) as mes`,[fechaFormateada1]
        );
        
        const fechaFormateada2 = formatoFecha(fechaAdelantada[0].mes) //formato de la fecha adelantada

        //consulta que trae todos los requeriminetos que venceran esta semana
        const [IdRegistro] = await pool.query(`SELECT id_registro 
        FROM registro 
        WHERE fecha_vencimiento BETWEEN ? AND ?
        AND estatus = "Vigente"`,
        [fechaFormateada1, fechaFormateada2]);

        if (IdRegistro.length > 0) {
            
            //Mando a traer todos los requerimientos vencidos 
            const [rows] = await pool.query(`SELECT
                requerimiento.nombre_requerimiento as requerimiento,
                requerimiento.siglas as siglas,
                requerimiento.impacto as impacto,
                unidad_operativa.nombre_planta as planta,
                registro.estatus as estatus,
                registro.fecha_vencimiento as data
            FROM
                registro
                JOIN requerimiento  ON registro.id_requerimiento = requerimiento.id_requerimiento
                JOIN unidad_operativa ON registro.id_planta = unidad_operativa.id_planta
            WHERE
                registro.id_registro IN (?)
                ORDER BY registro.fecha_vencimiento ASC`, 
            [IdRegistro.map((registro) => registro.id_registro)]);
            
            if (rows.length > 0) {
                // Crear un nuevo libro de Excel
                const workbook = new exceljs.Workbook();
                const worksheet = workbook.addWorksheet('Vencen este mes');
    
                // Agregar encabezados
                worksheet.columns = [
                    { header: 'Planta', key: 'planta', width: 40 },
                    { header: 'Requerimiento', key: 'requerimiento', width: 40 },
                    { header: 'Siglas', key: 'siglas', width: 10 },
                    { header: 'Impacto', key: 'impacto', width: 15 },
                    { header: 'Estatus', key: 'estatus', width: 10 },
                    { header: 'Fecha Vencimiento', key: 'data', width: 10 }
                ];
    
                // Agregar datos al libro de Excel
                worksheet.addRows(rows);
    
                // Guardar el libro de Excel en un buffer
                const buffer = await workbook.xlsx.writeBuffer();
    
                // Generar un nombre único para el archivo Excel
                const excelFileName = `Requerimientos que vencen este mes, fechaI: ${fechaFormateada1} fechaF: ${fechaFormateada2}.xlsx`;
                
                //traer todos los correos de los usuarios
                const [correos] = await pool.query('Select correo_electronico from usuarios')
                const correo = correos.map((usuario) => usuario.correo_electronico);

                // Enviar correo electrónico con el archivo adjunto
                const info = await transporter.sendMail({
                    from: '"Admin" <fortijc@gmail.com>',
                    to: correo,  //a quien se le envia el correo 
                    subject: 'Requerimientos que venceran este mes',
                    text: 'Adjunto encontrarás los requerimientos que vencen este mes.',
                    attachments: [{
                        filename: excelFileName,
                        content: buffer,
                        encoding: 'base64'
                    }]
                });
    
                console.log('envio de emails correctamente')
    
            } else {
                res.status(200).json({
                    message: 'Ningun requerimiento vence este mes'
                });
            }

            console.log('Estos son los requerimientos que venceran este mes".');
        }else{
            console.error('Ningun requerimiento vence este mes');
        }
  
      console.log('Tarea programada ejecutada correctamente.');
    } catch (excepcion) {
      console.error('Error en la tarea programada:', excepcion);
    }
};

controladorVencimiento.tresMeses = async (req, res) => {
    try {
        const response = await axios.get('http://worldtimeapi.org/api/ip'); // Obtener fecha actual desde la red
        const utcRed = response.data.utc_datetime;

        // Trabajar directamente con la hora UTC de la red
        const networkDate = new Date(utcRed);

        // Obtener la diferencia de tiempo (offset) en minutos
        const timezoneOffset = networkDate.getTimezoneOffset();

        // Ajustar la fecha local sumando el offset
        const adjustedLocalDate = new Date(networkDate.getTime() - timezoneOffset * 60 * 1000);

        //solo trae la fecha 
        const fechaR = adjustedLocalDate.toISOString().split('T')[0];

        function formatoFecha(fecha) {
            const partesFecha = fecha.split('-');
            const anio = partesFecha[0];
            const mes = partesFecha[1];
            const dia = partesFecha[2];
            return `${anio}/${mes}/${dia}`;
        }

        const fechaFormateada1 = formatoFecha(fechaR); //formato de la fecha actual

        //recupero la fecha de un mes
        const [fechaAdelantada] = await pool.query(
            `SELECT DATE_ADD(?, INTERVAL 3 MONTH) as meses`,[fechaFormateada1]
        );
        
        const fechaFormateada2 = formatoFecha(fechaAdelantada[0].meses) //formato de la fecha adelantada

        //consulta que trae todos los requeriminetos que venceran esta semana
        const [IdRegistro] = await pool.query(`SELECT id_registro 
        FROM registro 
        WHERE fecha_vencimiento BETWEEN ? AND ?
        AND estatus = "Vigente"`,
        [fechaFormateada1, fechaFormateada2]);

        if (IdRegistro.length > 0) {
            
            //Mando a traer todos los requerimientos vencidos 
            const [rows] = await pool.query(`SELECT
                requerimiento.nombre_requerimiento as requerimiento,
                requerimiento.siglas as siglas,
                requerimiento.impacto as impacto,
                unidad_operativa.nombre_planta as planta,
                registro.estatus as estatus,
                registro.fecha_vencimiento as data
            FROM
                registro
                JOIN requerimiento  ON registro.id_requerimiento = requerimiento.id_requerimiento
                JOIN unidad_operativa ON registro.id_planta = unidad_operativa.id_planta
            WHERE
                registro.id_registro IN (?)
                ORDER BY registro.fecha_vencimiento ASC`, 
            [IdRegistro.map((registro) => registro.id_registro)]);
            
            if (rows.length > 0) {
                // Crear un nuevo libro de Excel
                const workbook = new exceljs.Workbook();
                const worksheet = workbook.addWorksheet('Vencen en estos 3 meses');
    
                // Agregar encabezados
                worksheet.columns = [
                    { header: 'Planta', key: 'planta', width: 40 },
                    { header: 'Requerimiento', key: 'requerimiento', width: 40 },
                    { header: 'Siglas', key: 'siglas', width: 10 },
                    { header: 'Impacto', key: 'impacto', width: 15 },
                    { header: 'Estatus', key: 'estatus', width: 10 },
                    { header: 'Fecha Vencimiento', key: 'data', width: 10 }
                ];
    
                // Agregar datos al libro de Excel
                worksheet.addRows(rows);
    
                // Guardar el libro de Excel en un buffer
                const buffer = await workbook.xlsx.writeBuffer();
    
                // Generar un nombre único para el archivo Excel
                const excelFileName = `Requerimientos que vencen en estos 3 meses, fechaI: ${fechaFormateada1} fechaF: ${fechaFormateada2}.xlsx`;
                
                //traer todos los correos de los usuarios
                const [correos] = await pool.query('Select correo_electronico from usuarios')
                const correo = correos.map((usuario) => usuario.correo_electronico);

                // Enviar correo electrónico con el archivo adjunto
                const info = await transporter.sendMail({
                    from: '"Admin" <fortijc@gmail.com>',
                    to: correo,  //a quien se le envia el correo 
                    subject: 'Requerimientos que venceran durante estos 3 meses',
                    text: 'Adjunto encontrarás los requerimientos que vencen en estos meses.',
                    attachments: [{
                        filename: excelFileName,
                        content: buffer,
                        encoding: 'base64'
                    }]
                });
    
                console.log('envio de emails correctamente')
    
            } else {
                res.status(200).json({
                    message: 'Ningun requerimiento vence este mes'
                });
            }

            console.log('Estos son los requerimientos que venceran en estos tres meses".');
        }else{
            console.error('Ningun requerimiento vencera en este lapso');
        }
  
      console.log('Tarea programada ejecutada correctamente.');
    } catch (excepcion) {
      console.error('Error en la tarea programada:', excepcion);
    }
};

module.exports = controladorVencimiento;