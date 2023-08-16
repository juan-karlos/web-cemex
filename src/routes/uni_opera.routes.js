
const { Router } = require('express');
const router =Router();
const controladorRegUniOpera = require('../controllers/unidad_operativa');

router.get('/', controladorRegUniOpera.obtenerPlanta);
router.post('/insertar',controladorRegUniOpera.insertPlanta);



module.exports=router
