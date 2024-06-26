const { Router } = require("express");

const router = Router();
const controladorRegistro = require("../controllers/registro");
const controladorVencimiento = require("../controllers/verificadorVencidos");
const controladorinsertmasiva = require("../controllers/exel");
const controladorExel=require('../controllers/controllercargaexel')


// router.post('/load_pdf',controladorRegistro.insertpdf)

router.get("/", controladorRegistro.obtenerRegistro);
router.post("/regisSeg", controladorRegistro.obtenerRegistro_segmento);
router.post("/pdf", controladorRegistro.insertarPdf);
router.get("/fechaIniDia", controladorRegistro.buscarFechaDia); //busca fechas por dia de los registros de inicio
router.get("/fechaIniAAMM", controladorRegistro.buscarFechaAAMM); //busca fechas por mes y año de inicio de registro
router.get("/fechaIniAnio", controladorRegistro.buscarFechaAnio); //buscar fechas por año de inicio
router.get("/fechaVenDia", controladorRegistro.buscarFechaAnioT); //busca las fechas de vencimiento por dias especificos
router.get("/fechaVenAAMM", controladorRegistro.buscarFechaAAMMT); //busca las fechas de vencimiento por mes y año
router.get("/fechaVenAnio", controladorRegistro.buscarFechaAT); //busca todas las fechas de vencimiento de un año
router.get("/fechaVenR", controladorRegistro.buscarFechRango); // busca un rango de fechas de vencimiento especificado
router.patch("/actualizarEs", controladorRegistro.actualizarEstado); //actualiza el estado del registro
router.post("/grafica", controladorRegistro.graficatotal);
router.get("/graficaTotal", controladorRegistro.Graficatotal);
router.post("/granacio",controladorRegistro.administrativas)

router.post("/descargas", controladorRegistro.descargas);
router.get("/doc/:cb",controladorRegistro.docsplan);

router.get("/permiso/:cb", controladorRegistro.obtenerUnRegi);
router.patch("/actualizarPer", controladorRegistro.actualizarRegistro);
router.get("/documento/:nombredoc", controladorRegistro.documento);
router.get("/exel", controladorRegistro.importExel);

router.post("/carga", controladorinsertmasiva.insertmasiva);
router.get("/rutas", controladorinsertmasiva.rutas);
router.post("/cargaexel",controladorExel.recargaexel);

router.patch("/updateToVencido", controladorVencimiento.updateToVencimiento);
// router.get("/diaSiguiente", controladorVencimiento.vencSiguienteDia);
router.get("/mes", controladorVencimiento.unMes);

router.get("/resmes", controladorVencimiento.tresMeses);

module.exports = router;


