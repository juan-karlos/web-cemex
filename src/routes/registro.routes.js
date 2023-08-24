const { Router } = require('express');

const router = Router()
const controladorRegistro= require('../controllers/registro')

router.get('/registros',controladorRegistro.obtenerRegistro)
module.exports=router