import {
  PacienteEstadoModel,
  PacientesTerapeutasModel,
  ExpedienteModel,
} from "../models/ExpedienteModel.js";

// Crear un nuevo estado de paciente
export const createPacienteEstado = async (req, res) => {
  try {
    const { exp_num, estado } = req.body;
    const nuevoEstado = await PacienteEstadoModel.create({ exp_num, estado });
    res.status(201).json(nuevoEstado);
  } catch (error) {
    res.status(400).json({ message: "hola" });
  }
};

// Actualizar un estado de paciente
export const updatePacienteEstado = async (req, res) => {
  try {
    const { exp_num } = req.params;
    const { estado } = req.body;

    const [updated] = await PacienteEstadoModel.update(
      { estado },
      { where: { exp_num } }
    );
    if (updated) {
      res.json({ message: "Estado actualizado" });
    } else {
      res.status(404).json({ message: "Estado no encontrado" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar un estado de paciente
export const deletePacienteEstado = async (req, res) => {
  try {
    const { id_estado } = req.params;
    const deleted = await PacienteEstadoModel.destroy({ where: { id_estado } });
    if (deleted) {
      res.json({ message: "Estado eliminado" });
    } else {
      res.status(404).json({ message: "Estado no encontrado" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener todos los estados de pacientes de un terapeuta específico
export const getPacienteEstadosByTerapeuta = async (req, res) => {
  try {
    const { numero_tel_terapeuta } = req.params;
    // Buscar todos los exp_num asociados al terapeuta
    const relaciones = await PacientesTerapeutasModel.findAll({
      where: { numero_tel_terapeuta },
      attributes: ["exp_num"],
    });
    const expNums = relaciones.map((r) => r.exp_num);

    // Buscar todos los estados de esos pacientes
    const estados = await PacienteEstadoModel.findAll({
      where: { exp_num: expNums },
      include: [{ model: ExpedienteModel, attributes: ["nombre", "exp_num"] }],
    });

    res.json(estados);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los estados de todos los pacientes (de todos los terapeutas)
export const getAllPacienteEstados = async (req, res) => {
  try {
    const estados = await PacienteEstadoModel.findAll({
      include: [{ model: ExpedienteModel, attributes: ["nombre", "exp_num"] }],
    });
    res.json(estados);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
