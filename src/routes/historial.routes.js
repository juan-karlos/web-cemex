const { Router } = require("express");
const router = Router()

const historial = require("../controllers/historial")

router.get('/segmento',historial.buseg);
router.get('/zona',historial.buzon);
router.get('/cumplimineto',historial.buscumpli);
router.get('/fecha',historial.busfecha);
router.post('/reghis',historial.insertarHitorial);
router.post('/ZonaSegmento',historial.zonaSegmento);

module.exports=router

