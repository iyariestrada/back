// ExpedienteModel.js
import db from "../database/db.js";
import { DataTypes } from "sequelize";

const ExpedienteModel = db.define(
  "pacientes",
  {
    exp_num: { type: DataTypes.INTEGER, primaryKey: true },
    nombre: { type: DataTypes.STRING },
    fecha_nacimiento: { type: DataTypes.DATE },
    numero_tel: { type: DataTypes.STRING },
    remitido: { type: DataTypes.TINYINT },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
  }
);

const TerapeutaModel = db.define(
  "terapeuta",
  {
    numero_tel: { type: DataTypes.STRING, primaryKey: true },
    nombre: { type: DataTypes.STRING },
    tipo: { type: DataTypes.STRING(3) },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
  }
);

const PacientesTerapeutasModel = db.define(
  "pacientes_terapeuta",
  {
    exp_num: {
      type: DataTypes.INTEGER,
      references: { model: ExpedienteModel, key: "exp_num" },
      primaryKey: true,
    },
    numero_tel_terapeuta: {
      type: DataTypes.STRING,
      references: { model: TerapeutaModel, key: "numero_tel" },
      primaryKey: true,
    },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
  }
);

const EstadoActualModel = db.define(
  "estado_actual",
  {
    exp_num: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: ExpedienteModel, key: "exp_num" },
    },
    cita_estado: { type: DataTypes.TINYINT },
    tratamiento_estado: { type: DataTypes.TINYINT },
    diagnostico_final: { type: DataTypes.TINYINT },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  },
  {
    tableName: "estado_actual", // Especificar el nombre de la tabla
    timestamps: true,
  }
);
const PacienteEstadoModel = db.define(
  "paciente_estado",
  {
    exp_num: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: ExpedienteModel, key: "exp_num" },
      primaryKey: true,
    },
    etapa: { type: DataTypes.STRING(20), allowNull: false, primaryKey: true },
    numero_tel_terapeuta: {
      type: DataTypes.STRING(15),
      allowNull: false,
      references: { model: TerapeutaModel, key: "numero_tel" },
      primaryKey: true,
    },
    sesion_num: { type: DataTypes.INTEGER, allowNull: true },
    etapa_actual: { type: DataTypes.TINYINT, allowNull: true },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
  }
);

const CitaModel = db.define(
  "cita",
  {
    cita_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    exp_num: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "pacientes", key: "exp_num" },
    },
    numero_tel_terapeuta: {
      type: DataTypes.STRING(15),
      allowNull: true,
      references: { model: "terapeuta", key: "numero_tel" },
    },
    fecha: { type: DataTypes.DATE, allowNull: true },
    hora: { type: DataTypes.TIME, allowNull: true },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  },
  {
    tableName: "cita", // Especificar el nombre de la tabla
    timestamps: true,
  }
);

export default CitaModel;
// Definimos las relaciones
ExpedienteModel.belongsToMany(TerapeutaModel, {
  through: PacientesTerapeutasModel,
  foreignKey: "exp_num",
});
TerapeutaModel.belongsToMany(ExpedienteModel, {
  through: PacientesTerapeutasModel,
  foreignKey: "numero_tel_terapeuta",
});

EstadoActualModel.belongsTo(ExpedienteModel, { foreignKey: "exp_num" });

PacienteEstadoModel.belongsTo(ExpedienteModel, { foreignKey: "exp_num" });
PacienteEstadoModel.belongsTo(TerapeutaModel, {
  foreignKey: "numero_tel_terapeuta",
});

// Exportamos todos los modelos de la misma manera
export {
  ExpedienteModel,
  TerapeutaModel,
  PacientesTerapeutasModel,
  PacienteEstadoModel,
  EstadoActualModel,
  CitaModel,
};
