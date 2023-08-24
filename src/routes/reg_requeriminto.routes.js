const { Router } = require("express");

const router =Router();
const controladorRegistros = require("../controllers/reg_requerimineto")

router.get('/obtener',controladorRegistros.obtenerRequerimiento)
router.post('/insertar',controladorRegistros.insertarRequerimiento)

module.exports=router