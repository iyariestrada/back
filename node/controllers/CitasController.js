import {
  ExpedienteModel,
  UsuarioModel,
  PacientesTerapeutasModel,
  PacienteEstadoModel,
  EstadoActualModel,
  CitaModel,
} from "../models/ExpedienteModel.js";

import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Crear una nueva cita
export const createCita = async (req, res) => {
  try {
    const { exp_num, numero_tel_terapeuta } = req.body;
    const nuevaCita = await CitaModel.create({ exp_num, numero_tel_terapeuta });
    res.status(201).json(nuevaCita);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener citas sin fecha ni hora
export const getCitasSinFechaNiHora = async (req, res) => {
  try {
    const citas = await CitaModel.findAll({
      where: {
        fecha: null,
        hora: null,
      },
    });

    if (citas.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron citas sin fecha ni hora" });
    }
    const exp_nums = citas.map((cita) => cita.exp_num);
    const pacientes = await ExpedienteModel.findAll({
      where: { exp_num: exp_nums },
    });

    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//obtener citas segun numero_tel_terapeuta y la fecha sea mayor a la actual
export const getCitasByTerapeuta = async (req, res) => {
  try {
    const { numero_tel_terapeuta } = req.params;
    const citas = await CitaModel.findAll({
      where: {
        numero_tel_terapeuta,
        fecha: { [Op.gte]: new Date() },
      },
    });
    res.json(citas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener todas las citas
export const getCitas = async (req, res) => {
  try {
    const citas = await CitaModel.findAll();
    res.json(citas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener una cita por ID
export const getCitaById = async (req, res) => {
  try {
    const { cita_id } = req.params;
    const cita = await CitaModel.findByPk(cita_id);
    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    res.json(cita);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar una cita
export const updateCita = async (req, res) => {
  try {
    const { cita_id } = req.params;
    const { exp_num, numero_tel_terapeuta, fecha, hora } = req.body;
    const cita = await CitaModel.findByPk(cita_id);
    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    cita.exp_num = exp_num;
    cita.numero_tel_terapeuta = numero_tel_terapeuta;
    cita.fecha = fecha;
    cita.hora = hora;
    await cita.save();
    res.json(cita);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCitaFechaHora = async (req, res) => {
  try {
    const { cita_id } = req.params;
    const { numero_tel_terapeuta, fecha, hora } = req.body;

    const cita = await CitaModel.findByPk(cita_id);
    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    cita.numero_tel_terapeuta = numero_tel_terapeuta;
    cita.fecha = fecha;
    cita.hora = hora;
    await cita.save();

    const { exp_num } = cita;

    const estadoActual = await EstadoActualModel.findOne({
      where: { exp_num },
    });
    if (estadoActual) {
      estadoActual.cita_estado = 1;
      await estadoActual.save();
    } else {
      await EstadoActualModel.create({ exp_num, cita_estado: 1 });
    }

    res.json(cita);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar una cita
export const deleteCita = async (req, res) => {
  try {
    const { cita_id } = req.params;
    const cita = await CitaModel.findByPk(cita_id);
    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    await cita.destroy();
    res.json({ message: "Cita eliminada" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCitasSinFechaNiHoraPorExpNum = async (req, res) => {
  const { exp_num } = req.params;

  try {
    const citas = await CitaModel.findAll({
      where: {
        exp_num: exp_num,
        fecha: null,
        hora: null,
      },
    });

    if (citas.length === 0) {
      return res.status(404).json({
        message:
          "No se encontraron citas sin fecha ni hora para el expediente proporcionado",
      });
    }

    res.json(citas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
