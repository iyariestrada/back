import {
  ExpedienteModel,
  UsuarioModel,
  PacientesTerapeutasModel,
  PacienteEstadoModel,
  CitaModel,
} from "../models/ExpedienteModel.js";
import { Op } from "sequelize";
import sequelize from "../database/db.js";

const checkCitaPrevia = async (exp_num) => {
  const cita_null = await CitaModel.findOne({
    where: {
      exp_num,
      fecha: { [Op.is]: null },
      hora: { [Op.is]: null },
    },
  });

  if (cita_null) return true;

  const cita_previa = await CitaModel.findOne({
    where: {
      exp_num,
    },
    order: [
      ["fecha", "DESC"],
      ["hora", "DESC"],
    ],
  });

  if (!cita_previa) return false;

  const now = new Date();
  const fecha_now = now.toISOString().slice(0, 10);
  const hora_now = now.toTimeString().slice(0, 8);
  if (
    cita_previa.fecha > fecha_now ||
    (cita_previa.fecha === fecha_now && cita_previa.hora > hora_now)
  ) {
    return true;
  }
  return false;
};

export const getCheckCitaPrevia = async (req, res) => {
  const { exp_num } = req.params;
  try {
    if (await checkCitaPrevia(exp_num)) {
      res.status(400).json({ error: "Ya existe una cita previa" });
    } else {
      res.status(200).json({ message: "No existe una cita previa" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createPrimeraCita = async (req, res) => {
  const { exp_num, numero_tel_terapeuta, tipo } = req.body;
  try {
    if (await checkCitaPrevia(exp_num)) {
      res.status(400).json({ error: "Ya existe una cita previa" });
    } else {
      if (tipo == "D") {
        await PacienteEstadoModel.update(
          { estado: "T" },
          { where: { exp_num } }
        );
        ////Peticion de API OSCAR FINALIZACION DE TRATAMIENTO
      }
      const cita = await CitaModel.create({
        exp_num,
        numero_tel_terapeuta,
        fecha: null,
        hora: null,
        etapa: tipo,
      });
      const pacienteTerapeuta = await PacientesTerapeutasModel.findOne({
        where: { exp_num, numero_tel_terapeuta },
      });
      if (!pacienteTerapeuta) {
        PacientesTerapeutasModel.create({
          exp_num,
          numero_tel_terapeuta, // aquí puede ser null
        });
      }
      res.status(201).json(cita);
    }
  } catch (error) {
    console.error("Error creating cita:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createNextCitaMismaEtapa = async (req, res) => {
  const { exp_num, numero_tel_terapeuta } = req.body;
  try {
    const citaMasReciente = await CitaModel.findOne({
      where: {
        exp_num,
        numero_tel_terapeuta,
        fecha: { [Op.ne]: null },
        hora: { [Op.ne]: null },
      },
      order: [
        ["fecha", "DESC"],
        ["hora", "DESC"],
      ],
    });
    const cita = await CitaModel.create({
      exp_num,
      numero_tel_terapeuta,
      fecha: null,
      hora: null,
      etapa: citaMasReciente.etapa,
    });
    res.status(201).json(cita);
  } catch (error) {
    console.error("Error creating cita:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEtapaCita = async (req, res) => {
  const { exp_num } = req.params;
  try {
    // Buscar primero una cita pendiente (fecha y hora null)
    const citaPendiente = await CitaModel.findOne({
      where: {
        exp_num,
        fecha: { [Op.is]: null },
        hora: { [Op.is]: null },
      },
    });

    if (citaPendiente) {
      return res.status(200).json(citaPendiente.etapa);
    }

    // Si no hay cita pendiente, buscar la cita más reciente con fecha y hora
    const citaMasReciente = await CitaModel.findOne({
      where: { exp_num },
      order: [
        ["fecha", "DESC"],
        ["hora", "DESC"],
      ],
    });

    if (!citaMasReciente) {
      return res.status(404).json({ message: "No se encontró cita" });
    }

    res.status(200).json(citaMasReciente.etapa);
  } catch (error) {
    console.error("Error obteniendo etapa de cita:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createPrimeraCitaSiguienteEtapa = async (req, res) => {
  const { exp_num, numero_tel_terapeuta } = req.body;
  try {
    const citaMasReciente = await CitaModel.findOne({
      where: {
        exp_num,
        numero_tel_terapeuta,
        fecha: { [Op.ne]: null },
        hora: { [Op.ne]: null },
      },
      order: [
        ["fecha", "DESC"],
        ["hora", "DESC"],
      ],
    });
    const cita = await CitaModel.create({
      exp_num,
      numero_tel_terapeuta,
      fecha: null,
      hora: null,
      etapa: String.fromCharCode(citaMasReciente.etapa.charCodeAt(0) + 1),
    });
    res.status(201).json(cita);
  } catch (error) {
    console.error("Error creating cita:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
