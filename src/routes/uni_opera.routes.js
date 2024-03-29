const { Router } = require("express");
const router = Router();
const controllerPlanta = require("../controllers/unidad_operativa");
const controllerNacional= require("../controllers/controllerNacional")

//rutas de nacional
router.get("/Nacional",controllerNacional.estadisticaNacional);
router.get("/conteoNacional",controllerNacional.conteoPlantas)

router.get("/uno/:cb", controllerPlanta.obtenerPlanta); //listo
router.get("/", controllerPlanta.obtenerPlantas); // listo
router.get("/plantastrue", controllerPlanta.activasFijas); // listo
router.get("/plantasfalse", controllerPlanta.inactivasFijas);
router.post("/insertar", controllerPlanta.insertPlanta); //listo
router.patch("/actualizar/:cb", controllerPlanta.actualizar); //listo
router.delete("/eliminar/:cb", controllerPlanta.eliminar); //listo
router.get("/pasifico", controllerPlanta.pasifico);
router.get("/norte", controllerPlanta.norte);
router.get("/centro", controllerPlanta.centro);
router.get("/sur", controllerPlanta.sur);
router.get("/movilestrue", controllerPlanta.activasMoviles);
router.get("/movilesfalse", controllerPlanta.inactivasMoviles);




module.exports = router;
