const { Router } = require("express");
const router = Router();

const historial = require("../controllers/historial");

router.get("/segmento", historial.buseg);
router.get("/zona", historial.buzon);
router.get("/cumplimineto", historial.buscumpli);
router.get("/fecha", historial.busfecha);
router.post("/reghis", historial.insertarHitorial);
router.post("/ZonaSegmento", historial.zonaSegmento); //si
router.get("/insHistori", historial.insertHistorial);
router.post("/ObtenerMesPasadoPorSegmento", historial.obtenerMesPasado); //si
router.post("/insertarHistorial",historial.insertarHitorial);
module.exports = router;
