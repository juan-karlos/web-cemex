const { Router } = require("express");
const router = Router();
const controllersLogica = require("../controllers/logica");

router.get("/total", controllersLogica.pesoTotal);
// router.post("/parcial", controllersLogica.InsertHistorial);
router.get("/porcentaje", controllersLogica.pesoEnPorcentajeEstatus); //si
router.get("/totalPlanta", controllersLogica.totalPlantas); //si
router.get("/sumaTotal", controllersLogica.sumTotalZonaSegmento); //si

router.get("/porcentajePlanta", controllersLogica.porcentaje);

router.get("/zonas", controllersLogica.zonas); //si
router.get("/fijas", controllersLogica.fijas); //si
router.get("/moviles", controllersLogica.moviles); //si
router.post("/vencidas", controllersLogica.vencida); //si
router.post("/vigentes", controllersLogica.vigente); //si
router.post("/vencidasNacional", controllersLogica.vencidaNacional); //si
router.post("/estadistica", controllersLogica.estadistica);
router.post("/NoTramitables", controllersLogica.NoTramitables);
router.post("/NoTramitablesTabla", controllersLogica.NoTramitablesTabla);
router.post("/NoTramitablesTablaNacional", controllersLogica.NoTramitablesTablaNacional);
router.post("/vigentesNacional", controllersLogica.vigenteNacional); //si

module.exports = router;
