const { Router} = require('express')
const router= Router();
const controllersLogica=require("../controllers/logica");

router.get('/total',controllersLogica.pesoTotal)
router.get('/parcial',controllersLogica.pesoParcial)
router.get('/porcentaje',controllersLogica.pesoEnPorcentajeEstatus)
router.get('/totalPlanta',controllersLogica.totalPlantas)
router.get('/sumaTotal',controllersLogica.sumTotalZonaSegmento)
router.get('/porcentajePlanta', controllersLogica.porcentaje)
router.get('/zonas', controllersLogica.zonas)
router.get('/fijas', controllersLogica.fijas) 
router.get('/moviles', controllersLogica.moviles) 
module.exports=router;
