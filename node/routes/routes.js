import express from "express";
//import { verifyToken } from "../middleware/auth.js";

import {
  createExpediente,
  getExpediente,
  updateExpediente,
  createUsuario,
  completeRegistration,
  getUsuario,
  getUsuariosByTipo,
  getOnlyTerapeutas,
  getUsersValidForRegistration,
  getValidUserForRegistration,
  login,
  getTiposUsuario,
  createPacientesTerapeutas,
  getPacientes,
  getPacientesTerapeutas,
  updatePacientesTerapeutas,
  deletePacientesTerapeutas,
  updateEstadoActualTerminado,
  createEstadoActual,
  getTerapeutaWithPatients,
  getEstadoActualByTerapeuta,
  getEstadoActualTodosPacientes,
  createCita,
  getCitasSinFechaNiHora,
  getCitasByTerapeuta,
  getCitas,
  getCitaById,
  updateCita,
  updateCitaFechaHora,
  deleteCita,
  getCitasSinFechaNiHoraPorExpNum,
} from "../controllers/ExpedienteController.js";

const router = express.Router();

// Rutas públicas (sin autenticación)
router.post("/usuarios/login", login);
router.get("/usuarios/tipos", getTiposUsuario);
router.get("/usuarios/registervalid/:numero_tel", getValidUserForRegistration);
router.post("/usuarios/completeregistration", completeRegistration);

// Rutas protegidas (requieren token válido)
router.post("/", createExpediente);
router.get("/:exp_num", getExpediente);
router.put("/:exp_num", updateExpediente);

router.get("/vistaprevia/:numero_tel", getTerapeutaWithPatients);

router.get("/estadopacientes/todos", getEstadoActualTodosPacientes);
router.get("/estadopacientes/:numero_tel", getEstadoActualByTerapeuta);

router.get("/usuarios/pacientes", getPacientes);

router.post("/pacientesterapeutas", createPacientesTerapeutas);
router.post("/pacienteestado/actual", createEstadoActual);

router.post("/usuarios/new", createUsuario);
router.get("/usuarios/terapeutas", getOnlyTerapeutas);
router.get("/usuarios/registervalid", getUsersValidForRegistration);
router.get("/usuarios/tipo/:tipo", getUsuariosByTipo);
router.get("/usuarios/:numero_tel", getUsuario);

// Rutas de citas protegidas
router.post("/cita", createCita);
router.get("/citas/sinfecha/sinhora", getCitasSinFechaNiHora);
router.get("/citas/:numero_tel_terapeuta", getCitasByTerapeuta);

router.put("/agendar-cita/:cita_id", updateCitaFechaHora);
router.put("/estadoactual/:exp_num", updateEstadoActualTerminado);
router.get("/cita/sinfecha/sinhora/:exp_num", getCitasSinFechaNiHoraPorExpNum);

export default router;

/*import express from "express";
import { verifyToken } from "../middleware/auth.js";

import {
  createExpediente,
  getExpediente,
  updateExpediente,
  createUsuario,
  completeRegistration,
  getUsuario,
  getUsuariosByTipo,
  getOnlyTerapeutas,
  getUsersValidForRegistration,
  getValidUserForRegistration,
  login,
  getTiposUsuario,
  createPacientesTerapeutas,
  getPacientesTerapeutas,
  updatePacientesTerapeutas,
  deletePacientesTerapeutas,
  updateEstadoActualTerminado,
  createEstadoActual,
  getTerapeutaWithPatients,
  getEstadoActualByTerapeuta,
  createCita,
  getCitasSinFechaNiHora,
  getCitasByTerapeuta,
  getCitas,
  getCitaById,
  updateCita,
  updateCitaFechaHora,
  deleteCita,
  getCitasSinFechaNiHoraPorExpNum,
} from "../controllers/ExpedienteController.js";

const router = express.Router();

router.post("/", createExpediente);
router.get("/:exp_num", getExpediente);
router.put("/:exp_num", updateExpediente);

router.get("/vistaprevia/:numero_tel", getTerapeutaWithPatients);

router.get("/estadopacientes/:numero_tel", getEstadoActualByTerapeuta);

//router.get("/terapeuta/:numero_tel", getTerapeuta); *********

router.post("/pacientesterapeutas", createPacientesTerapeutas);

router.post("/pacienteestado/actual", createEstadoActual);

router.post("/usuarios", createUsuario);

// Obtener todos los terapeutas (opcional: filtrar por tipo con query ?tipo=A)
router.get("/usuarios/terapeutas", getOnlyTerapeutas);

router.get("/usuarios/registervalid", getUsersValidForRegistration);

router.post("/usuarios/completeregistration", completeRegistration);

router.post("/usuarios/login", login);
// Obtener tipos de usuario (debe ir antes para evitar conflictos)
router.get("/usuarios/tipos", getTiposUsuario);

// Obtener usuarios por tipo específico
router.get("/usuarios/tipo/:tipo", getUsuariosByTipo);

router.get("/usuarios/registervalid/:numero_tel", getValidUserForRegistration);

router.get("/usuarios/:numero_tel", getUsuario);

///hacer una cita, se panda en el doby un json con { "exp_num": 123, "numero_tel_terapeuta": "6648425432" } por ejemplo
//la cita queda con fecha y hora null
router.post("/cita", createCita);
///regresa todas las citas que tiene un terapeuta asignadas y que la fecha sea mayor a la actual.
router.get("/citas/:numero_tel_terapeuta", getCitasByTerapeuta);
////regresa todas las citas que no tienen fecha ni hora
router.get("/citas/sinfecha/sinhora", getCitasSinFechaNiHora);
///llena la cita con fecha y hora segun el id recuperado de getCitasSInFechaNiHora
router.put("/agendar-cita/:cita_id", updateCitaFechaHora);
///poner el estado actual de cierto paciente como terminado
router.put("/estadoactual/:exp_num", updateEstadoActualTerminado);

router.get("/cita/sinfecha/sinhora/:exp_num", getCitasSinFechaNiHoraPorExpNum);
export default router;
*/
