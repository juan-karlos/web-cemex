
const { Router } = require('express');
const router =Router();
const controllerPlanta = require('../controllers/unidad_operativa');

router.get('/uno/:cb', controllerPlanta.obtenerPlanta);//listo
router.get('/', controllerPlanta.obtenerPlantas); // listo
router.post('/insertar',controllerPlanta.insertPlanta); //listo
router.patch('/actualizar/:cb',controllerPlanta.actualizar);//listo
router.delete('/eliminar/:cb',controllerPlanta.eliminar); //listo
router.get('/actifi',controllerPlanta.activasFijas);

module.exports=router
