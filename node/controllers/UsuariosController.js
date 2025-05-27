import {
  ExpedienteModel,
  UsuarioModel,
  PacientesTerapeutasModel,
  PacienteEstadoModel,
  EstadoActualModel,
  CitaModel,
} from "../models/ExpedienteModel.js";

import { Op } from "sequelize";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendResetEmail } from "../services/emailService.js";
import jwt from "jsonwebtoken";

// Lista tipos de usuario posibles
const TIPOS_USUARIO = {
  ADMINISTRADOR: "ADM",
  RECEPCIONISTA: "R",
  TERAPEUTA_A: "A",
  TERAPEUTA_B: "B",
  TERAPEUTA_C: "C",
  TERAPEUTA_AB: "AB",
  TERAPEUTA_AC: "AC",
  TERAPEUTA_BC: "BC",
  TERAPEUTA_ABC: "ABC",
  TERAPEUTA: "NA",
};

// combinaciones válidas
const TIPOS_VALIDOS = Object.values(TIPOS_USUARIO);

// para crear un nuevo usuario se necesita minimo numero de telefono y tipo de usuario
export const createUsuario = async (req, res) => {
  try {
    const { numero_tel, tipo_usuario } = req.body;

    // Validar el tipo de usuario
    if (!TIPOS_VALIDOS.includes(tipo_usuario)) {
      return res.status(400).json({
        message: `Tipo de usuario no válido. Los tipos permitidos son: ${TIPOS_VALIDOS.join(
          ", "
        )}`,
        tipos_validos: TIPOS_VALIDOS,
      });
    }

    // Validar combinaciones exclusivas para terapeutas
    if (
      tipo_usuario !== TIPOS_USUARIO.ADMINISTRADOR &&
      tipo_usuario !== TIPOS_USUARIO.RECEPCIONISTA
    ) {
      if (!/^[ABC]+$/.test(tipo_usuario)) {
        return res.status(400).json({
          message:
            "Combinación de terapeuta no válida. Use solo A, B, C o sus combinaciones",
        });
      }
    }

    // Verificar si el número de teléfono ya está registrado
    const usuarioExistente = await UsuarioModel.findOne({
      where: { numero_tel },
    });
    if (usuarioExistente) {
      return res.status(400).json({
        message: "Número de teléfono ya registrado",
      });
    }

    // Crear el nuevo usuario
    const usuario = await UsuarioModel.create(req.body);
    res.status(201).json({
      message: `${getRolNombre(tipo_usuario)} creado exitosamente`,
      data: usuario,
      tipo: tipo_usuario,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear usuario",
      error: error.message,
      detalles: error.errors?.map((e) => e.message),
    });
  }
};

export const completeRegistration = async (req, res) => {
  try {
    const { numero_tel, nombre, correo, password, confirmPassword } = req.body;

    // Validaciones básicas
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Las contraseñas no coinciden",
      });
    }

    // Buscar usuario
    const usuario = await UsuarioModel.findOne({
      where: {
        numero_tel,
        tipo_usuario: ["ADM", "ABC", "AB", "AC", "BC", "R", "A", "B", "C"],
      },
    });

    if (usuario.nombre && usuario.correo && usuario.password) {
      return res.status(400).json({
        success: false,
        message: "Este número ya completó su registro",
      });
    }

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Número no válido para registro o ya registrado",
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await usuario.update({
      nombre,
      correo,
      password: hashedPassword,
    });

    res.json({
      success: true,
      message: "Registro completado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al completar registro",
    });
  }
};

export const getUsuario = async (req, res) => {
  try {
    const { numero_tel } = req.params;
    const usuario = await UsuarioModel.findOne({
      where: { numero_tel },
    });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({
      message: "Error al buscar usuario",
      error: error.message,
    });
  }
};

export const getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await UsuarioModel.findAll({
      order: [["nombre", "ASC"]],
      attributes: { exclude: ["password"] },
    });
    if (usuarios.length === 0) {
      return res.status(404).json({
        message: "No se encontraron usuarios",
        sugerencia: "Verifique si la base de datos está vacía",
      });
    }
    res.json({
      count: usuarios.length,
      usuarios,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener usuarios",
      error: error.message,
    });
  }
};

export const getUsuariosByTipo = async (req, res) => {
  try {
    const { tipo } = req.params;

    // Validar el tipo de usuario
    if (!TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({
        message: `Tipo de usuario no válido. Los tipos permitidos son: ${TIPOS_VALIDOS.join(
          ", "
        )}`,
        tipos_validos: TIPOS_VALIDOS,
      });
    }

    // Construir condición de búsqueda
    let whereCondition;

    if (
      tipo === TIPOS_USUARIO.ADMINISTRADOR ||
      tipo === TIPOS_USUARIO.RECEPCIONISTA
    ) {
      // Búsqueda exacta para ADM y R
      whereCondition = { tipo_usuario: tipo };
    } else {
      // Para terapeutas: búsqueda exacta más inclusiva para combinaciones
      whereCondition = {
        tipo_usuario: {
          [Op.and]: [
            { [Op.not]: ["ADM", "R"] }, // Excluir siempre ADM y R
            { [Op.regexp]: `^[ABC]*${tipo}[ABC]*$` }, // Coincidencia exacta o combinaciones
          ],
        },
      };
    }

    const usuarios = await UsuarioModel.findAll({
      where: whereCondition,
      order: [["nombre", "ASC"]],
      attributes: { exclude: ["password"] }, // Excluir contraseñas de la respuesta
    });

    if (usuarios.length === 0) {
      return res.status(404).json({
        message: `No se encontraron usuarios de tipo ${tipo}`,
        sugerencia: `Verifique si el tipo ${tipo} es correcto`,
      });
    }

    res.json({
      //count: usuarios.length,
      //tipo_buscado: tipo,
      //tipo_descripcion: getRolNombre(tipo),
      //resultados: usuarios,
      usuarios,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al buscar usuarios",
      error: error.message,
    });
  }
};

function getRolNombre(tipo) {
  const roles = {
    [TIPOS_USUARIO.ADMINISTRADOR]: "Administrador",
    [TIPOS_USUARIO.RECEPCIONISTA]: "Recepcionista",
    [TIPOS_USUARIO.TERAPEUTA_A]: "Terapeuta tipo A",
    [TIPOS_USUARIO.TERAPEUTA_B]: "Terapeuta tipo B",
    [TIPOS_USUARIO.TERAPEUTA_C]: "Terapeuta tipo C",
    [TIPOS_USUARIO.TERAPEUTA_AB]: "Terapeuta tipo AB",
    [TIPOS_USUARIO.TERAPEUTA_AC]: "Terapeuta tipo AC",
    [TIPOS_USUARIO.TERAPEUTA_BC]: "Terapeuta tipo BC",
    [TIPOS_USUARIO.TERAPEUTA_ABC]: "Terapeuta tipo ABC",
  };

  return roles[tipo] || `Usuario (${tipo})`;
}

export const getOnlyTerapeutas = async (req, res) => {
  try {
    const { tipo } = req.query; // Opcional: filtrar por tipo específico

    let whereCondition = {
      tipo_usuario: {
        [Op.not]: ["ADM", "R"],
        [Op.regexp]: "^[ABC]+$",
      },
    };

    // Si se especifica un tipo de terapeuta
    if (tipo && ["A", "B", "C", "AB", "AC", "BC", "ABC"].includes(tipo)) {
      whereCondition.tipo_usuario[Op.regexp] = `^[ABC]*${tipo}[ABC]*$`;
    }

    const terapeutas = await UsuarioModel.findAll({
      where: whereCondition,
      order: [["nombre", "ASC"]],
      attributes: [
        "id_usuario",
        "numero_tel",
        "nombre",
        "correo",
        "tipo_usuario",
        "createdAt",
      ],
    });

    res.json({
      count: terapeutas.length,
      tipo_filtrado: tipo || "Todos",
      terapeutas: terapeutas,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener terapeutas",
      error: error.message,
    });
  }
};
// los usuarios que no han completado su registro son aquellos que no tienen password
export const getUsersValidForRegistration = async (req, res) => {
  try {
    // Excluir aquellos que ya tienen contraseña
    const usuarios = await UsuarioModel.findAll({
      where: {
        password: null,
        tipo_usuario: {
          [Op.or]: [
            { [Op.eq]: "ADM" }, // Administradores
            { [Op.regexp]: "^[ABC]+$" }, // Terapeutas (A, B, C, AB, etc.)
            { [Op.eq]: "R" }, // Recepcionistas
          ],
        },
      },
      order: [["nombre", "ASC"]],
      attributes: [
        "id_usuario",
        "numero_tel",
        "nombre",
        "correo",
        "password",
        "tipo_usuario",
        "createdAt",
      ],
    });

    if (usuarios.length === 0) {
      return res.status(404).json({
        message: "No se encontraron usuarios válidos para registro",
      });
    }

    res.json({
      count: usuarios.length,
      usuarios: usuarios,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener usuarios válidos para registro",
      error: error.message,
    });
  }
};

export const getValidUserForRegistration = async (req, res) => {
  try {
    const { numero_tel } = req.params;
    const usuario = await UsuarioModel.findOne({
      where: { numero_tel },
    });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    if (usuario.password) {
      return res.status(400).json({
        message: "El usuario ya ha completado el registro",
      });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({
      message: "Error al buscar usuario",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { numero_tel, password } = req.body;

    // Validación básica
    if (!numero_tel || !password) {
      return res.status(400).json({
        success: false,
        message: "Número y contraseña son requeridos",
      });
    }

    // Buscar usuario (con número normalizado)
    const numeroNormalizado = numero_tel.replace(/\D/g, "");
    const usuario = await UsuarioModel.findOne({
      where: { numero_tel: numeroNormalizado },
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar si la contraseña está asignada
    if (!usuario.password) {
      return res.status(401).json({
        success: false,
        message: "La cuenta no ha finalizado su registro",
      });
    }

    // Comparar contraseñas
    const isPasswordValid = await bcrypt.compare(password, usuario.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        numero_tel: usuario.numero_tel,
        tipo: usuario.tipo_usuario,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        numero_tel: usuario.numero_tel,
        tipo: usuario.tipo_usuario,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error al iniciar sesión",
    });
  }
};

export const getTiposUsuario = async (req, res) => {
  try {
    const categorias = {
      administradores: {
        codigo: TIPOS_USUARIO.ADMINISTRADOR,
        descripcion: getRolNombre(TIPOS_USUARIO.ADMINISTRADOR),
      },
      recepcionistas: {
        codigo: TIPOS_USUARIO.RECEPCIONISTA,
        descripcion: getRolNombre(TIPOS_USUARIO.RECEPCIONISTA),
      },
      terapeutas: {
        individuales: [
          { codigo: "A", descripcion: getRolNombre("A") },
          { codigo: "B", descripcion: getRolNombre("B") },
          { codigo: "C", descripcion: getRolNombre("C") },
        ],
        combinaciones: [
          { codigo: "AB", descripcion: getRolNombre("AB") },
          { codigo: "AC", descripcion: getRolNombre("AC") },
          { codigo: "BC", descripcion: getRolNombre("BC") },
          { codigo: "ABC", descripcion: getRolNombre("ABC") },
        ],
      },
    };

    res.json({
      categorias,
      total_individual: 5, // ADM, R, A, B, C
      total_combinaciones: 4, // AB, AC, BC, ABC
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener tipos de usuario",
      error: error.message,
    });
  }
};

// Actualizar solo numero
export const updateUserPhone = async (req, res) => {
  try {
    const { numero_actual, nuevo_numero } = req.body;

    // Verificar que ambos números están presentes
    if (!numero_actual || !nuevo_numero) {
      return res.status(400).json({
        message: "Debe proporcionar el número actual y el nuevo número",
      });
    }

    // Validar que el nuevo número no esté ya registrado
    const existeNuevo = await UsuarioModel.findOne({
      where: { numero_tel: nuevo_numero },
    });
    if (existeNuevo) {
      return res.status(400).json({
        message: "El nuevo número ya está registrado por otro usuario",
      });
    }

    // Buscar el usuario con el número actual
    const usuario = await UsuarioModel.findOne({
      where: { numero_tel: numero_actual },
    });

    if (!usuario) {
      return res.status(404).json({
        message: "No se encontró un usuario con el número actual proporcionado",
      });
    }

    // Actualizar el número
    await usuario.update({ numero_tel: nuevo_numero });

    res.json({
      message: "Número de teléfono actualizado exitosamente",
      usuario_actualizado: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        nuevo_numero: usuario.numero_tel,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar número de teléfono",
      error: error.message,
    });
  }
};

// Actualizar nombre y correo
export const updateUserData = async (req, res) => {
  try {
    const { numero_tel, nombre, correo } = req.body;

    if (!numero_tel || (!nombre && !correo)) {
      return res.status(400).json({
        success: false,
        message:
          "Se requiere número de teléfono y al menos un dato a actualizar.",
      });
    }

    const usuario = await UsuarioModel.findOne({ where: { numero_tel } });
    if (!usuario) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    await usuario.update({ nombre, correo });

    res.json({
      success: true,
      message: "Datos actualizados correctamente",
      usuario: {
        nombre: usuario.nombre,
        correo: usuario.correo,
        numero_tel: usuario.numero_tel,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar datos",
      error: error.message,
    });
  }
};

// Actualizar contraseña
export const updatePassword = async (req, res) => {
  try {
    const { numero_tel, currentPassword, newPassword, confirmPassword } =
      req.body;

    if (!numero_tel || !currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "La nueva contraseña y la confirmación no coinciden.",
      });
    }

    const usuario = await UsuarioModel.findOne({ where: { numero_tel } });
    if (!usuario) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      usuario.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "La contraseña actual es incorrecta.",
      });
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await usuario.update({ password: hashedPassword });

    res.json({
      success: true,
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar la contraseña",
      error: error.message,
    });
  }
};
export const deleteUsuario = async (req, res) => {
  try {
    const { numero_tel } = req.params;

    const usuario = await UsuarioModel.findOne({ where: { numero_tel } });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si es terapeuta
    const tiposTerapeuta = ["A", "B", "C", "AB", "AC", "BC", "ABC"];
    if (tiposTerapeuta.includes(usuario.tipo_usuario)) {
      const citas = await CitaModel.findAll({
        where: { numero_tel_terapeuta: numero_tel },
      });

      // Limpiar citas para ser reasignadas
      for (const cita of citas) {
        await cita.update({
          fecha: null,
          hora: null,
          numero_tel_terapeuta: null,
        });
      }

      // Buscar todos los exp_num relacionados a este terapeuta
      const relaciones = await PacientesTerapeutasModel.findAll({
        where: { numero_tel_terapeuta: numero_tel },
        attributes: ["exp_num"],
      });
      const expNums = relaciones.map((r) => r.exp_num);

      // Eliminar todos los registros de pacientes_terapeuta con esos exp_num
      if (expNums.length > 0) {
        await PacientesTerapeutasModel.destroy({
          where: { exp_num: expNums },
        });
      }
    }

    // Eliminar cualquier relación directa por número de terapeuta
    await PacientesTerapeutasModel.destroy({
      where: { numero_tel_terapeuta: numero_tel },
    });

    await usuario.destroy();

    res.json({
      success: true,
      message:
        "Usuario eliminado correctamente. Las citas y relaciones quedaron libres para reasignar.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar usuario",
      error: error.message,
    });
  }
};

// Funciones para recuperación de contraseña

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UsuarioModel.findOne({ where: { correo: email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No se encontró una cuenta con ese correo",
      });
    }

    // Generar código de 6 dígitos
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await user.update({
      resetPasswordCode: resetCode,
      resetPasswordExpires: expiresAt,
    });

    // Enviar correo con el código
    await sendResetEmail(email, resetCode);

    res.json({
      success: true,
      message: "Código de recuperación enviado",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error.message,
      stack: error.stack, // Esto muestra el stacktrace
      detalles: error, // Esto muestra el objeto error completo (puedes quitarlo si es muy extenso)
    });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await UsuarioModel.findOne({
      where: {
        correo: email,
        resetPasswordCode: code,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Código inválido o expirado",
      });
    }

    res.json({
      success: true,
      message: "Código verificado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al verificar el código",
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await UsuarioModel.findOne({
      where: {
        correo: email,
        resetPasswordCode: code,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Código inválido o expirado",
      });
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await user.update({
      password: hashedPassword,
      resetPasswordCode: null,
      resetPasswordExpires: null,
    });

    res.json({
      success: true,
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar la contraseña",
      error: error.message,
    });
  }
};
