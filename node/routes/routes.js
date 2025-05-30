import express from "express";
//import { verifyToken } from "../middleware/auth.js";

import {
  createExpediente,
  getExpediente,
  updateExpediente,
  createPacientesTerapeutas,
  getPacientes,
  getPacientesTerapeutas,
  updatePacientesTerapeutas,
  deletePacientesTerapeutas,
  getTerapeutaWithPatients,
  createCita,
  getCitasSinFechaNiHora,
  getCitasByTerapeuta,
  getCitas,
  getCitaById,
  updateCita,
  updateCitaFechaHora,
  deleteCita,
  getCitasSinFechaNiHoraPorExpNum,
  getCitasByPaciente,
} from "../controllers/ExpedienteController.js";

import {
  getCitasTerapeutaDia,
  getCitasTerapeutaDiaByDia,
  getCitasTerapeutaSemana,
} from "../controllers/HorarioController.js";

import {
  createUsuario,
  completeRegistration,
  getUsuario,
  getAllUsuarios,
  getUsuariosByTipo,
  getOnlyTerapeutas,
  getUsersValidForRegistration,
  getValidUserForRegistration,
  login,
  getTiposUsuario,
  updateUserPhone,
  updateUserData,
  updatePassword,
  deleteUsuario,
  forgotPassword,
  verifyCode,
  resetPassword,
} from "../controllers/UsuariosController.js";

const router = express.Router();

// Rutas públicas (sin autenticación)
router.post("/usuarios/login", login);
router.get("/usuarios/tipos", getTiposUsuario);
router.get("/usuarios/registervalid/:numero_tel", getValidUserForRegistration);
router.post("/usuarios/completeregistration", completeRegistration);
router.post("/usuarios/forgotpass", forgotPassword);
router.post("/usuarios/verifycode", verifyCode);
router.post("/usuarios/resetpass", resetPassword);
router.get("/usuarios/pacientes", getPacientes);
router.post("/usuarios/new", createUsuario);
router.get("/usuarios/all", getAllUsuarios);
router.get("/usuarios/terapeutas", getOnlyTerapeutas);
router.get("/usuarios/registervalid", getUsersValidForRegistration);
router.get("/usuarios/tipo/:tipo", getUsuariosByTipo);
router.get("/usuarios/:numero_tel", getUsuario);
router.put("/usuarios/:numero_tel", updateUserData);
router.put("/usuarios/updatephone/:numero_tel", updateUserPhone);
router.put("/usuarios/changepassword/:numero_tel", updatePassword);
router.delete("/usuarios/:numero_tel", deleteUsuario);

// Rutas protegidas (requieren token válido)
router.post("/", createExpediente);
router.get("/:exp_num", getExpediente);
router.put("/:exp_num", updateExpediente);

router.get("/vistaprevia/:numero_tel", getTerapeutaWithPatients);

router.post("/pacientesterapeutas", createPacientesTerapeutas);

// Rutas de citas protegidas
router.get("/todas/las/citas", getCitas);
router.post("/cita", createCita);
router.get("/citas/sinfecha/sinhora", getCitasSinFechaNiHora);
router.get("/citas/:numero_tel_terapeuta", getCitasByTerapeuta);

router.put("/agendar-cita/:cita_id", updateCitaFechaHora);
router.get("/cita/sinfecha/sinhora/:exp_num", getCitasSinFechaNiHoraPorExpNum);

//horario de un dia de un terapeuta
router.get("/horario/:numero_tel_terapeuta", getCitasTerapeutaDia);

router.post("/horario/:numero_tel_terapeuta", getCitasTerapeutaDiaByDia);

router.post("/horario/semana/:numero_tel_terapeuta", getCitasTerapeutaSemana);

router.get("/citas/paciente/:exp_num", getCitasByPaciente);

export default router;
