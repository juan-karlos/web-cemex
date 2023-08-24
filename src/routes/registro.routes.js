const { Router } = require('express');

const router = Router()
const controladorRegistro= require('../controllers/registro');
const { route } = require('./reg_requeriminto.routes');

router.get('/registros',controladorRegistro.obtenerRegistro)
router.get('/fechaIniDia',controladorRegistro.buscarFechaDia)
router.get('/fechaIniAAMM',controladorRegistro.buscarFechaAAMM)
router.get('/fechaIniAnio',controladorRegistro.buscarFechaAnio)
router.get('/fechaVenDia',controladorRegistro.buscarFechaAnioT)
router.get('/fechaVenAAMM',controladorRegistro.buscarFechaAAMMT)
router.get('/fechaVenAnio',controladorRegistro.buscarFechaAT)
router.get('/fechaVenR',controladorRegistro.buscarFechRango)
router.post('/insertar',controladorRegistro.insertarRegistro)
router.put('/actualizar',controladorRegistro.actualizarRegistro)
module.exports=router