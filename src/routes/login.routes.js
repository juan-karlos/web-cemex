const { Router} = require('express')
const router= Router();
const valUsuario = require("../controllers/valUsuario")

router.post('/verifica', valUsuario.regisUsu)
router.get('/comparacion',valUsuario.comparacion)
router.get('/Unreg',valUsuario.uniUsuario)
router.put('/actualizar',valUsuario.actualizar)
router.delete('/eliminar',valUsuario.eliminar)
router.put('/actualizarContra',valUsuario.actualizarContrasena)
module.exports = router