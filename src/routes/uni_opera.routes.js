
const { Router } = require('express');
const router =Router();
const controllerPlanta = require('../controllers/unidad_operativa');

router.get('/', controllerPlanta.obtenerPlanta);
router.post('/insertar',controllerPlanta.insertPlanta);

module.exports=router
