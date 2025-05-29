import express from "express";
import {
  createPrimeraCita,
  createNextCitaMismaEtapa,
  createPrimeraCitaSiguienteEtapa,
  getEtapaCita,
  getCheckCitaPrevia,
} from "../controllers/CitasController.js";

const router = express.Router();

// crear primera cita
router.post("/primera-cita", createPrimeraCita);
// crear siguiente cita en la misma etapa
router.post("/siguiente-cita", createNextCitaMismaEtapa);
// crear la primera cita de la siguiente etapa
router.post("/siguiente-etapa", createPrimeraCitaSiguienteEtapa);
// Obtener la etapa del paciente
router.get("/etapa/:exp_num", getEtapaCita);
// Obtener si hay una cita previa que aun no ha pasado
router.get("/check-cita-previa/:exp_num", getCheckCitaPrevia);

export default router;