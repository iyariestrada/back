import {
  CitaModel,
  UsuarioModel,
} from "../models/ExpedienteModel.js";
import { DataTypes } from "sequelize";
import db from "../database/db.js";

const ObservacionesCitaModel = db.define("observaciones_cita", {
  id_observacion: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  cita_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    references: { model: "cita", key: "cita_id" } 
  },
  observacion: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  numero_tel_terapeuta: { 
    type: DataTypes.STRING(15), 
    allowNull: false, 
    references: { model: "usuarios", key: "numero_tel" } 
  },
  createdAt: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  updatedAt: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW, 
    onUpdate: DataTypes.NOW 
  },
}, {
  tableName: 'observaciones_cita',
  timestamps: true
});

// Relaciones
ObservacionesCitaModel.belongsTo(CitaModel, { 
  foreignKey: 'cita_id', 
  targetKey: 'cita_id' 
});
ObservacionesCitaModel.belongsTo(UsuarioModel, { 
  foreignKey: 'numero_tel_terapeuta', 
  targetKey: 'numero_tel' 
});
CitaModel.hasMany(ObservacionesCitaModel, { 
  foreignKey: 'cita_id', 
  sourceKey: 'cita_id' 
});

export const getObservacionesCita = async (req, res) => {
  try {
    const { cita_id } = req.params;
    
    const observaciones = await ObservacionesCitaModel.findAll({
      where: { cita_id },
      include: [
        {
          model: UsuarioModel,
          attributes: ["nombre"],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    res.json(observaciones);
  } catch (error) {
    console.error("Error al obtener observaciones:", error);
    res.status(500).json({ 
      message: "Error al obtener las observaciones",
      error: error.message 
    });
  }
};

export const createObservacionCita = async (req, res) => {
  try {
    const { cita_id, observacion, numero_tel_terapeuta } = req.body;

    if (!observacion || !observacion.trim()) {
      return res.status(400).json({
        message: "La observación es requerida"
      });
    }

    if (observacion.length > 500) {
      return res.status(400).json({
        message: "La observación no puede exceder 500 caracteres"
      });
    }

    const cita = await CitaModel.findByPk(cita_id);
    if (!cita) {
      return res.status(404).json({
        message: "Cita no encontrada"
      });
    }

    const terapeuta = await UsuarioModel.findOne({
      where: { numero_tel: numero_tel_terapeuta }
    });
    if (!terapeuta) {
      return res.status(404).json({
        message: "Terapeuta no encontrado"
      });
    }

    const nuevaObservacion = await ObservacionesCitaModel.create({
      cita_id,
      observacion: observacion.trim(),
      numero_tel_terapeuta
    });

    const observacionCompleta = await ObservacionesCitaModel.findByPk(
      nuevaObservacion.id_observacion,
      {
        include: [
          {
            model: UsuarioModel,
            attributes: ["nombre"],
          },
        ],
      }
    );

    res.status(201).json({
      message: "Observación agregada exitosamente",
      observacion: observacionCompleta
    });
  } catch (error) {
    console.error("Error al crear observación:", error);
    res.status(500).json({ 
      message: "Error al crear la observación",
      error: error.message 
    });
  }
};

export {ObservacionesCitaModel};