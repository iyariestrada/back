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

export const createExpediente = async (req, res) => {
  try {
    await ExpedienteModel.create(req.body);
    res.json({ message: error });
  } catch (error) {
    res.json({ message: error });
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
    await ExpedienteModel.update(req.body, {
      where: { exp_num: req.params.exp_num },
    });
    res.json({
      message: "¡Registro actualizado correctamente!",
    });
  } catch (error) {
    res.json({ message: error.message });
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

export const updateEstadoActualTerminado = async (req, res) => {
  try {
    const { exp_num } = req.params; // Obtener el exp_num de los parámetros de la ruta

    // Actualizar el estado actual a 0
    const [updated] = await EstadoActualModel.update(
      { tratamiento_estado: 2 }, // Valores a actualizar
      { where: { exp_num } } // Condición para seleccionar el registro
    );

    if (updated) {
      const updatedEstadoActual = await EstadoActualModel.findOne({
        where: { exp_num },
      });
      res.status(200).json(updatedEstadoActual);
    } else {
      res.status(404).json({ message: "Estado actual no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEstadoActual = async (req, res) => {
  try {
    await EstadoActualModel.create(req.body);
    res.json({ message: "Estado actual creado" });
  } catch (error) {
    res.json({ message: error });
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

export const getEstadoActualByTerapeuta = async (req, res) => {
  try {
    const { numero_tel } = req.params;

    // Obtener los pacientes asociados al terapeuta
    const pacientesTerapeutas = await PacientesTerapeutasModel.findAll({
      where: { numero_tel_terapeuta: numero_tel },
      attributes: ["exp_num"],
    });

    if (pacientesTerapeutas.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron pacientes para este terapeuta" });
    }

    const expNums = pacientesTerapeutas.map((pt) => pt.exp_num);

    // Obtener las entidades de estado_actual para los pacientes encontrados
    const estadosActuales = await EstadoActualModel.findAll({
      where: { exp_num: expNums },
    });

    res.json(estadosActuales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEstadoActualTodosPacientes = async (req, res) => {
  try {
    const estadosActuales = await EstadoActualModel.findAll({
      order: [["exp_num", "ASC"]],
    });

    if (estadosActuales.length === 0) {
      return res.status(404).json({ message: "No se encontraron estados" });
    }

    res.json(estadosActuales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
