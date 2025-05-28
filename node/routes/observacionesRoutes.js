import express from "express";
import {
  getObservacionesCita,
  createObservacionCita,
} from "../controllers/ObservacionesController.js";

const router = express.Router();

router.get("/cita/:cita_id", getObservacionesCita);
router.post("/cita", createObservacionCita);

export default router;