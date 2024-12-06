import express from "express";
import {
  getCitasSinFechaNiHoraPorExpNum,
  updateEstadoActualTerminado,
  updateCitaFechaHora,
  getCitasSinFechaNiHora,
  getCitasByTerapeuta,
  createCita,
  getTerapeutasByTipo,
  createEstadoActual,
  createExpediente,
  getExpediente,
  getTerapeuta,
  getTerapeutaWithPatients,
  updateExpediente,
  getEstadoActualByTerapeuta,
  createPacientesTerapeutas,
} from "../controllers/ExpedienteController.js";

const router = express.Router();

router.post("/", createExpediente);
router.get("/:exp_num", getExpediente);
router.put("/:exp_num", updateExpediente);

router.get("/vistaprevia/:numero_tel", getTerapeutaWithPatients);

router.get("/estadopacientes/:numero_tel", getEstadoActualByTerapeuta);

router.get("/terapeuta/:numero_tel", getTerapeuta);

router.post("/pacientesterapeutas", createPacientesTerapeutas);

router.post("/pacienteestado/actual", createEstadoActual);

///agarrar el tipo de terapeuta
router.get("/terapeutas/:tipo", getTerapeutasByTipo);
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
