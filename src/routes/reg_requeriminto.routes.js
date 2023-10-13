const { Router } = require("express");

const router =Router();
const controladorRequerimiento = require("../controllers/reg_requerimineto")

router.get('/obtener/',controladorRequerimiento.obtenerRequerimiento)
router.get('/reqIndivudual/:cb',controladorRequerimiento.obtenerUnRequerimiento)
router.patch('/actualizar/:cb',controladorRequerimiento.actualizarRequerimiento)//ruta de las actaulizaciones
router.post('/insertar',controladorRequerimiento.insertarRequerimiento)//insercion de los requerimientos
router.delete('/eliminar',controladorRequerimiento.eliminarRequerimiento)//eliminar requerimientos
module.exports=router