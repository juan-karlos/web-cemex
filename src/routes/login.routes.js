const { Router} = require('express')
const router= Router();
const valUsuario = require("../controllers/valUsuario")

router.post('/verifica', valUsuario.regisUsu)
router.get('/comparacion',valUsuario.comparacion)
router.get('/',valUsuario.uniUsuario)
// router.put('/actualizar',valUsuario.actualizarContraseña)
router.delete('/eliminar',valUsuario.eliminar)
router.put('/actualizarContra',valUsuario.actualizarContrasena)
module.exports = router