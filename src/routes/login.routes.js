const { Router } = require("express");
const router = Router();
const valUsuario = require("../controllers/valUsuario");

router.post("/verifica", valUsuario.regisUsu);
router.get("/verifica/:token/:tokenData", valUsuario.verificaRegistro);
router.get("/cancelar/:token", valUsuario.cancelacion);
router.post("/comparacion", valUsuario.comparacion);
router.get("/", valUsuario.uniUsuario);
router.get("/usuarios",valUsuario.todosUsuarios)
router.delete("/eliminar/:id_usuario", valUsuario.eliminar);
router.patch("/actualizarContra", valUsuario.actualizarContrasena);
router.post("/administrador",valUsuario.administrador);
router.get("/conUsuarios/:id_usuario", valUsuario.usuario);
router.put("/actualusu/:id_usuario",valUsuario.actualizarinfo);
router.put("/actualcontra",valUsuario.recucontra)
module.exports = router;
