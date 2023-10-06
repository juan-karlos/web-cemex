const { Router} = require('express')
const router= Router();
const controllersLogica=require("../controllers/logica")

router.get('/total',controllersLogica.pesoTotal)
router.get('/parcial',controllersLogica.pesoParcial)
router.get('/porcentaje',controllersLogica.pesoEnPorcentajeEstatus)
router.get('/sumaTotal',controllersLogica.sumTotalZonaSegmento)
router.get('/totalPlanta',controllersLogica.totalPlantas)
module.exports=router;