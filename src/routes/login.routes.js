const { Router} = require('express')
const router= Router();
const valUsuario = require("../controllers/valUsuario")

router.post('/verifica', valUsuario.regisUsu)
router.get('/comparacion',valUsuario.comparacion)
router.get('/',valUsuario.uniUsuario)

router.delete('/eliminar',valUsuario.eliminar)
router.patch('/actualizarContra',valUsuario.actualizarContrasena)
module.exports = router