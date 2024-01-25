const { Router } = require("express");
const router = Router();
const controllersLogica = require("../controllers/logica");

router.get("/total", controllersLogica.pesoTotal);
router.get("/parcial", controllersLogica.pesoParcial);
router.get("/porcentaje", controllersLogica.pesoEnPorcentajeEstatus); //si
router.get("/totalPlanta", controllersLogica.totalPlantas); //si
router.get("/sumaTotal", controllersLogica.sumTotalZonaSegmento); //si

router.get("/porcentajePlanta", controllersLogica.porcentaje);

router.get("/zonas", controllersLogica.zonas); //si
router.get("/fijas", controllersLogica.fijas); //si
router.get("/moviles", controllersLogica.moviles); //si
router.post("/vencidas", controllersLogica.vencida); //si
router.post("/vigentes", controllersLogica.vigente); //si

module.exports = router;
