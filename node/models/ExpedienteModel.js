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

const PacienteEstadoModel = db.define(
  "paciente_estado",
  {
    id_estado: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    exp_num: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: ExpedienteModel, key: "exp_num" },
    },
    estado: {
      type: DataTypes.STRING(1),
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
    tableName: "paciente_estado",
  }
);

const CitaModel = db.define("cita", {
    cita_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    exp_num: { type: DataTypes.INTEGER, allowNull: true, references: { model: "pacientes", key: "exp_num" } },
    numero_tel_terapeuta: { type: DataTypes.STRING(15), allowNull: true, references: { model: "terapeuta", key: "numero_tel" } },
    fecha: { type: DataTypes.DATEONLY, allowNull: true },
    hora: { type: DataTypes.TIME, allowNull: true },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, onUpdate: DataTypes.NOW },
    etapa: { type: DataTypes.STRING(1), allowNull: true },
}, {
    tableName: 'cita', // Especificar el nombre de la tabla
    timestamps: true
});

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


PacienteEstadoModel.belongsTo(ExpedienteModel, { foreignKey: "exp_num" });

CitaModel.belongsTo(ExpedienteModel, { foreignKey: 'exp_num', targetKey: 'exp_num' });
ExpedienteModel.hasMany(CitaModel, { foreignKey: 'exp_num', sourceKey: 'exp_num' });

// Exportamos  modelos
export {
  ExpedienteModel,
  UsuarioModel,
  PacientesTerapeutasModel,
  PacienteEstadoModel,
  CitaModel,
};
