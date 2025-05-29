// services/emailService.js
import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // o tu proveedor de correo
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Recuperación de contraseña",
    html: `
      <h1>Recuperación de contraseña</h1>
      <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
      <p>Tu código de verificación es: <strong>${code}</strong></p>
      <p>Este código expirará en 10 minutos.</p>
      <p>Si no solicitaste este cambio, por favor ignora este correo.</p>
    `,
  };

  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
  console.log("Enviando correo a:", email);
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Correo enviado:", info.response);
    return info;
  } catch (error) {
    console.error("Error enviando correo:", error); // <-- Aquí verás el error real
    throw error;
  }

  //await transporter.sendMail(mailOptions);
};
