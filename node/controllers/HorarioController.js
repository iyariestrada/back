import {
    ExpedienteModel,
    UsuarioModel,
    PacientesTerapeutasModel,
    PacienteEstadoModel,
    CitaModel,
} from "../models/ExpedienteModel.js";
import { Op } from "sequelize";
import sequelize from "../database/db.js";

//citas <= al dia de hoy
export const getCitasTerapeutaDia = async (req, res) => {

    const today = new Date(); // Obtiene la fecha actual
    console.log("Fecha actual ////////////////////:", today);
    const currentDate = today.toISOString().split("T")[0]; // Convierte la fecha a string en formato YYYY-MM-DD

    const { numero_tel_terapeuta } = req.params;
    try {
        const citas = await CitaModel.findAll({
            where: {
                numero_tel_terapeuta: numero_tel_terapeuta,
            },
            include: [
                {
                    model: ExpedienteModel,
                    attributes: ["nombre"],
                },
            ],
        });
        const citasNoHoy = citas.filter(cita => cita.fecha === currentDate);
        res.status(200).json(citasNoHoy);
    }
    catch (error) {
        console.error("Error al obtener las citas:", error);
        res.status(500).json({ error: "Error al obtener las citas" });
    }
}

export const getCitasTerapeutaSemana = async (req, res) => {
  const { dia } = req.body; // Obtiene el elemento "dia" del cuerpo de la solicitud
  const day = dia ? new Date(dia) : new Date(); // Si "dia" existe, lo convierte a Date; si no, usa la fecha actual

  // Calcular el rango de fechas de lunes a domingo
  const dayOfWeek = day.getDay(); // 0 (domingo) a 6 (sábado)
  const monday = new Date(day); // Copia la fecha
  monday.setDate(day.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Ajusta al lunes
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6); // Ajusta al domingo

  const startDate = monday.toISOString().split("T")[0]; // Lunes en formato YYYY-MM-DD
  const endDate = sunday.toISOString().split("T")[0]; // Domingo en formato YYYY-MM-DD

  const { numero_tel_terapeuta } = req.params;
  try {
    const citas = await CitaModel.findAll({
      where: {
        numero_tel_terapeuta: numero_tel_terapeuta,
        fecha: {
          [Op.between]: [startDate, endDate], // Filtrar entre lunes y domingo
        },
      },
      include: [
        {
          model: ExpedienteModel,
          attributes: ["nombre"],
        },
      ],
      order: [
        ["fecha", "ASC"], // Ordena por fecha ascendente (puedes usar 'DESC' para descendente)
        ["hora", "ASC"], // Luego por hora ascendente
      ],
    });

    // Crear un array con los días de la semana
    const diasSemana = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(monday);
      currentDay.setDate(monday.getDate() + i);
      const formattedDate = currentDay.toISOString().split("T")[0];
      diasSemana.push({
        dia: currentDay.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }), // Nombre del día con formato "miércoles 7 de mayo"
        fecha: formattedDate, // Fecha en formato YYYY-MM-DD
        horario: citas.filter((cita) => cita.fecha === formattedDate), // Citas para ese día
      });
    }

    res.status(200).json(diasSemana); // Devuelve las citas organizadas por día de la semana
  } catch (error) {
    console.error("Error al obtener las citas de la semana:", error);
    res.status(500).json({ error: "Error al obtener las citas de la semana" });
  }
};

export const getCitasTerapeutaDiaByDia = async (req, res) => {
  const { dia } = req.body; // Obtiene el día enviado en el cuerpo de la solicitud como string
  if (!dia) {
    return res.status(400).json({ error: "El campo 'dia' es requerido." });
  }

  const day = new Date(dia); // Convierte el string a un objeto Date
  const currentDate = day.toISOString().split("T")[0]; // Convierte la fecha a string en formato YYYY-MM-DD

  console.log("Día recibido (como string):", currentDate);

  const { numero_tel_terapeuta } = req.params;
  try {
    const citas = await CitaModel.findAll({
      where: {
        numero_tel_terapeuta: numero_tel_terapeuta, // Filtra por el terapeuta enviado en el parámetro
        [sequelize.where(
          sequelize.fn("DATE", sequelize.col("fecha")),
          currentDate
        )]: true, // Compara solo la parte de la fecha
      },
      include: [
        {
          model: ExpedienteModel,
          attributes: ["nombre"],
        },
      ],
    });

    res.status(200).json(citas); // Devuelve las citas del día para el terapeuta especificado
  } catch (error) {
    console.error("Error al obtener las citas del día:", error);
    res.status(500).json({ error: "Error al obtener las citas del día" });
  }
};
