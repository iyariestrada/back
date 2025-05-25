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

const UsuarioModel = db.define(
  "usuarios",
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    numero_tel: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
    },
    correo: {
      type: DataTypes.STRING(150),
    },
    password: {
      type: DataTypes.STRING(255),
    },
    tipo_usuario: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    tableName: "usuarios",
    indexes: [
      {
        unique: true,
        fields: ["numero_tel"],
      },
    ],
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
      type: DataTypes.STRING(15),
      references: { model: UsuarioModel, key: "numero_tel" },
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
    tableName: "estado_actual",
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
      references: { model: UsuarioModel, key: "numero_tel" }, // Cambiado a UsuarioModel
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
      references: { model: ExpedienteModel, key: "exp_num" },
    },
    numero_tel_terapeuta: {
      type: DataTypes.STRING(15),
      allowNull: true,
      references: { model: UsuarioModel, key: "numero_tel" }, // Cambiado a UsuarioModel
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
    tableName: "cita",
    timestamps: true,
  }
);

// Definición de relaciones
ExpedienteModel.belongsToMany(UsuarioModel, {
  through: PacientesTerapeutasModel,
  foreignKey: "exp_num",
  otherKey: "numero_tel_terapeuta",
  as: "terapeutas", // Opcional: alias para la relación
});

UsuarioModel.belongsToMany(ExpedienteModel, {
  through: PacientesTerapeutasModel,
  foreignKey: "numero_tel_terapeuta",
  otherKey: "exp_num",
  as: "pacientes", // Opcional: alias para la relación
});

EstadoActualModel.belongsTo(ExpedienteModel, { foreignKey: "exp_num" });

PacienteEstadoModel.belongsTo(ExpedienteModel, { foreignKey: "exp_num" });
PacienteEstadoModel.belongsTo(UsuarioModel, {
  foreignKey: "numero_tel_terapeuta",
  as: "terapeuta", // Opcional: alias para la relación
});

// Exportamos  modelos
export {
  ExpedienteModel,
  UsuarioModel,
  PacientesTerapeutasModel,
  PacienteEstadoModel,
  EstadoActualModel,
  CitaModel,
};

export default UsuarioModel;
