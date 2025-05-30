import {
  ExpedienteModel,
  UsuarioModel,
  PacientesTerapeutasModel,
  PacienteEstadoModel,
  CitaModel,
} from "../models/ExpedienteModel.js";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const createExpediente = async (req, res) => {
  try {
    const resp = await ExpedienteModel.create(req.body);
    res.json({ message: "¡Expediente creado correctamente!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getExpediente = async (req, res) => {
  try {
    const paciente = await ExpedienteModel.findOne({
      where: { exp_num: req.params.exp_num },
    });
    res.json(paciente);
  } catch (error) {
    res.json({ message: error });
  }
};

export const updateExpediente = async (req, res) => {
  try {
    const [updatedRows] = await ExpedienteModel.update(req.body, {
      where: { exp_num: req.params.exp_num },
    });

    if (updatedRows === 0) {
      return res.status(404).json({
        message: "No se encontró el expediente o no hubo cambios.",
      });
    }

    res.json({
      message: "¡Registro actualizado correctamente!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPacientesTerapeutas = async (req, res) => {
  try {
    await PacientesTerapeutasModel.create(req.body);
    res.json({ message: "Relación creada" });
  } catch (error) {
    res.json({ message: error });
  }
};

// ExpedienteController.js

export const getPacientes = async (req, res) => {
  try {
    const pacientes = await ExpedienteModel.findAll({
      order: [["nombre", "ASC"]],
      attributes: [
        "exp_num",
        "nombre",
        "fecha_nacimiento",
        "numero_tel",
        "remitido",
      ],
    });
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener pacientes",
      error: error.message,
    });
  }
};

export const getPacientesTerapeutas = async (req, res) => {
  try {
    const relacion = await PacientesTerapeutasModel.findOne({
      where: { exp_num: req.params.exp_num, numero_tel: req.params.numero_tel },
    });
    res.json(relacion);
  } catch (error) {
    res.json({ message: error });
  }
};

export const updatePacientesTerapeutas = async (req, res) => {
  try {
    await PacientesTerapeutasModel.update(req.body, {
      where: { exp_num: req.params.exp_num, numero_tel: req.params.numero_tel },
    });
    res.json({
      message: "¡Registro actualizado correctamente!",
    });
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const deletePacientesTerapeutas = async (req, res) => {
  try {
    await PacientesTerapeutasModel.destroy({
      where: { exp_num: req.params.exp_num, numero_tel: req.params.numero_tel },
    });
    res.json({
      message: "¡Relación eliminada correctamente!",
    });
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const getTerapeutaWithPatients = async (req, res) => {
  try {
    const { numero_tel } = req.params;

    // Verifica que el parámetro numero_tel no esté undefined
    if (!numero_tel) {
      return res
        .status(400)
        .json({ message: "El parámetro numero_tel es requerido" });
    }

    // Obtener el terapeuta
    const usuario = await UsuarioModel.findOne({ where: { numero_tel } });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Obtener los pacientes asociados
    const pacientesTerapeutas = await PacientesTerapeutasModel.findAll({
      where: { numero_tel_terapeuta: numero_tel },
    });
    const exp_nums = pacientesTerapeutas.map((pt) => pt.exp_num);
    const pacientes = await ExpedienteModel.findAll({
      where: { exp_num: exp_nums },
    });

    res.json({ usuario, pacientes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear una nueva cita
export const createCita = async (req, res) => {
  try {
    const { exp_num, numero_tel_terapeuta, tipo } = req.body;
    const nuevaCita = await CitaModel.create({
      exp_num,
      numero_tel_terapeuta,
      tipo,
    });
    const pacienteTerapeuta = await PacientesTerapeutasModel.findOne({
      where: { exp_num, numero_tel_terapeuta },
    });
    if (!pacienteTerapeuta) {
      PacientesTerapeutasModel.create({
        exp_num,
        numero_tel_terapeuta,
      });
    }
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

// Esto realmente va a devolver todos los pacientes
export const getCitas = async (req, res) => {
  try {
    const expedientes = await ExpedienteModel.findAll({
      order: [["nombre", "ASC"]],
      attributes: [
        "exp_num",
        "nombre",
        "fecha_nacimiento",
        "numero_tel",
        "remitido",
      ],
    });
    res.json(expedientes);
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

// Timeline obtener citas por paciente
export const getCitasByPaciente = async (req, res) => {
  try {
    const { exp_num } = req.params;

    const citas = await CitaModel.findAll({
      where: { exp_num },
      include: [
        {
          model: ExpedienteModel,
          attributes: ["nombre"],
        },
      ],
      order: [
        ["fecha", "ASC"],
        ["hora", "ASC"],
      ],
    });

    if (citas.length === 0) {
      return res.status(404).json({
        message: "No se encontraron citas para este paciente",
        citas: [],
      });
    }

    res.json(citas);
  } catch (error) {
    console.error("Error al obtener citas del paciente:", error);
    res.status(500).json({
      message: "Error al obtener las citas del paciente",
      error: error.message,
    });
  }
};
