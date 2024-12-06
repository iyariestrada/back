import {
  ExpedienteModel,
  TerapeutaModel,
  PacientesTerapeutasModel,
  PacienteEstadoModel,
  EstadoActualModel,
  CitaModel,
} from "../models/ExpedienteModel.js";
import { Op } from "sequelize";

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

export const createTerapeuta = async (req, res) => {
  try {
    await TerapeutaModel.create(req.body);
    res.json({ message: "Terapeuta creado" });
  } catch (error) {
    res.json({ message: error });
  }
};

export const getTerapeuta = async (req, res) => {
  try {
    const terapeuta = await TerapeutaModel.findOne({
      where: { numero_tel: req.params.numero_tel },
    });
    res.json(terapeuta);
  } catch (error) {
    res.json({ message: error });
  }
};

export const getTerapeutasByTipo = async (req, res) => {
  try {
    const { tipo } = req.params;

    // Obtener los terapeutas del tipo solicitado
    const terapeutas = await TerapeutaModel.findAll({
      where: {
        tipo: {
          [Op.like]: `%${tipo}%`,
        },
      },
    });

    if (terapeutas.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron terapeutas de este tipo" });
    }

    res.json(terapeutas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTerapeuta = async (req, res) => {
  try {
    await TerapeutaModel.update(req.body, {
      where: { numero_tel: req.params.numero_tel },
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
    const terapeuta = await TerapeutaModel.findOne({ where: { numero_tel } });

    if (!terapeuta) {
      return res.status(404).json({ message: "Terapeuta no encontrado" });
    }

    // Obtener los pacientes asociados
    const pacientesTerapeutas = await PacientesTerapeutasModel.findAll({
      where: { numero_tel_terapeuta: numero_tel },
    });
    const exp_nums = pacientesTerapeutas.map((pt) => pt.exp_num);
    const pacientes = await ExpedienteModel.findAll({
      where: { exp_num: exp_nums },
    });

    res.json({ terapeuta, pacientes });
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
    const { fecha, hora } = req.body;

    const cita = await CitaModel.findByPk(cita_id);
    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

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
