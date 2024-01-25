const { Router } = require("express");
const router = Router();
const valUsuario = require("../controllers/valUsuario");

router.post("/verifica", valUsuario.regisUsu);
router.get("/verifica/:token/:tokenData", valUsuario.verificaRegistro);
router.get("/cancelar/:token", valUsuario.cancelacion);
router.post("/comparacion", valUsuario.comparacion);
router.get("/", valUsuario.uniUsuario);

router.delete("/eliminar", valUsuario.eliminar);
router.patch("/actualizarContra", valUsuario.actualizarContrasena);
module.exports = router;
