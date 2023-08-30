const { Router } = require('express');

const router = Router()
const controladorRegistro= require('../controllers/registro');
const { route } = require('./reg_requeriminto.routes');

router.get('/registros',controladorRegistro.obtenerRegistro)
router.post('/insertar',controladorRegistro.insertarRegistro)
router.get('/fechaIniDia',controladorRegistro.buscarFechaDia)//busca fechas por dia de los registros de inicio
router.get('/fechaIniAAMM',controladorRegistro.buscarFechaAAMM)//busca fechas por mes y año de inicio de registro
router.get('/fechaIniAnio',controladorRegistro.buscarFechaAnio)//buscar fechas por año de inicio
router.get('/fechaVenDia',controladorRegistro.buscarFechaAnioT)//busca las fechas de vencimiento por dias especificos
router.get('/fechaVenAAMM',controladorRegistro.buscarFechaAAMMT)//busca las fechas de vencimiento por mes y año 
router.get('/fechaVenAnio',controladorRegistro.buscarFechaAT)//busca todas las fechas de vencimiento de un año
router.get('/fechaVenR',controladorRegistro.buscarFechRango)// busca un rango de fechas de vencimiento especificado
router.put('/actualizarEs',controladorRegistro.actualizarEstado)//actualiza el estado del registro
router.put('/actualizar',controladorRegistro.actualizarRegistro)
module.exports=router

