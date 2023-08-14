const { Router } = require("express");

const router =Router();
const controladorRegistros = require("../controllers/reg_requerimineto")

router.get('/',controladorRegistros.obtenerRegistro)
router.post('/insertar',controladorRegistros.insertarRegistro)

module.exports=router