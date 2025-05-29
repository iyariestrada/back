import { Router } from "express";
import {
  createPacienteEstado,
  updatePacienteEstado,
  deletePacienteEstado,
  getPacienteEstadosByTerapeuta,
  getAllPacienteEstados,
  getPacienteEstadoByExpNum,
} from "../controllers/PacienteEstadoController.js";

const router = Router();

// Crear un nuevo estado de paciente
router.post("/", createPacienteEstado);

// Actualizar un estado de paciente
router.put("/:exp_num", updatePacienteEstado);

// Eliminar un estado de paciente
router.delete("/:id_estado", deletePacienteEstado);

// Obtener todos los estados de pacientes de un terapeuta específico
router.get("/terapeuta/:numero_tel_terapeuta", getPacienteEstadosByTerapeuta);

// Obtener todos los estados de todos los pacientes
router.get("/", getAllPacienteEstados);
// Obtener el estado de un paciente por su número de expediente
router.get("/:exp_num", getPacienteEstadoByExpNum);
export default router;
