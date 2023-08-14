const { Router} = require('express')
const router= Router();
const valUsuario = require("../controllers/valUsuario")

router.post('/verifica', valUsuario.verificar)
router.get('/comparacion',valUsuario.comparacion)

module.exports = router