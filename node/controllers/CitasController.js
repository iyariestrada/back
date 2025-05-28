import {
    ExpedienteModel,
    UsuarioModel,
    PacientesTerapeutasModel,
    PacienteEstadoModel,
    EstadoActualModel,
    CitaModel,
  } from "../models/ExpedienteModel.js";
  import { Op } from "sequelize";
  import sequelize from "../database/db.js";

  const checkCitaPrevia = async (exp_num) => { 
    const cita_null = await CitaModel.findOne({
      where: {
        exp_num,
        fecha: { [Op.is]: null },
        hora: { [Op.is]: null },
      }
    });

    if (cita_null) return true;
    
    const cita_previa = await CitaModel.findOne({
      where: {
        exp_num,
      },
      order: [
        ['fecha', 'DESC'],
        ['hora', 'DESC'],
      ],
    });

    if (!cita_previa) return false;

    const now = new Date();
    const fecha_now = now.toISOString().slice(0, 10); 
    const hora_now = now.toTimeString().slice(0, 8); 
    if (
      cita_previa.fecha > fecha_now ||
      (cita_previa.fecha === fecha_now && cita_previa.hora > hora_now)
    ) {
      return true;
    }
    return false;
  }

  export const getCheckCitaPrevia = async (req, res) => {
    const { exp_num } = req.params;
    try {
      if (await checkCitaPrevia(exp_num)) {
        res.status(400).json({ error: "Ya existe una cita previa" });
      } else {
        res.status(200).json({ message: "No existe una cita previa" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  export const createPrimeraCita = async (req, res) => {
    const { exp_num, numero_tel_terapeuta, tipo } = req.body;
    try {
      if (await checkCitaPrevia(exp_num)) {
        res.status(400).json({ error: "Ya existe una cita previa" });
      } 
      else {
        const cita = await CitaModel.create({
          exp_num,
          numero_tel_terapeuta,
          fecha: null,
          hora: null,
          etapa: tipo,
        });
        const pacienteTerapeuta = await PacientesTerapeutasModel.findOne({
            where: { exp_num, numero_tel_terapeuta },
          });
        if (!pacienteTerapeuta) {
          PacientesTerapeutasModel.create({
            exp_num,
            numero_tel_terapeuta,
          });
        }
        res.status(201).json(cita);
      }
    } catch (error) {
      console.error("Error creating cita:", error);
      res.status(500).json({ error: "Internal server error" });
    }
   }

  export const createNextCitaMismaEtapa = async (req, res) => {
    const { exp_num, numero_tel_terapeuta } = req.body;
    try {
        const citaMasReciente = await CitaModel.findOne({
            where: {
                exp_num,
                numero_tel_terapeuta,
                fecha: { [Op.ne]: null },
                hora: { [Op.ne]: null },
            },
            order: [
                ['fecha', 'DESC'],
                ['hora', 'DESC'],
            ],
        });
      const cita = await CitaModel.create({
        exp_num,
        numero_tel_terapeuta,
        fecha: null,
        hora: null,
        etapa: citaMasReciente.etapa
      });
      res.status(201).json(cita);
    } catch (error) {
      console.error("Error creating cita:", error);
      res.status(500).json({ error: "Internal server error" });
    }
   }

  export const createPrimeraCitaSiguienteEtapa = async (req, res) => {
    const { exp_num, numero_tel_terapeuta } = req.body;
    try {
        const citaMasReciente = await CitaModel.findOne({
            where: {
                exp_num,
                numero_tel_terapeuta,
                fecha: { [Op.ne]: null },
                hora: { [Op.ne]: null },
            },
            order: [
                ['fecha', 'DESC'],
                ['hora', 'DESC'],
            ],
        });
      const cita = await CitaModel.create({
        exp_num,
        numero_tel_terapeuta,
        fecha: null,
        hora: null,
        etapa: String.fromCharCode(citaMasReciente.etapa.charCodeAt(0) + 1)
      });
      res.status(201).json(cita);
    } catch (error) {
      console.error("Error creating cita:", error);
      res.status(500).json({ error: "Internal server error" });
    }
   }

   export const getEtapaCita = async (req, res) => {
    const { exp_num } = req.params;
    console.log("EXP_NUM" + exp_num);
    try {
        const citaMasReciente = await CitaModel.findOne({
            where: {
                exp_num,
                fecha: { [Op.ne]: null },
                hora: { [Op.ne]: null },
            },
            order: [
                ['fecha', 'DESC'],
                ['hora', 'DESC'],
            ],
        });
      res.status(201).json(citaMasReciente.etapa);
    } catch (error) {
      console.error("Error creating cita:", error);
      res.status(500).json({ error: "Internal server error" });
    }
   }