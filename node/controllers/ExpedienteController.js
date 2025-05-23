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
/*
export const createUsuario = async (req, res) => {
  try {
    const { tipo_usuario } = req.body;

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
};*/

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
        tipo_usuario: ["ABC", "AB", "AC", "BC", "R", "A", "B", "C"],
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
    // incluir solo terapeutas y recepcionistas
    // Excluir administradores (ADM) y aquellos que ya tienen contraseña
    const usuarios = await UsuarioModel.findAll({
      where: {
        password: null,
        tipo_usuario: {
          [Op.or]: [
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
