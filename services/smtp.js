const nodemailer = require('nodemailer');
require('dotenv').config();

async function enviarCorreo(options) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 25,
    secure: process.env.SMTP_SECURE === 'true', // set to true if using SSL/TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"Mi cultivo" <micultivoX@bayer.com>`,
    to: options.pCorreos,
    cc: options.ccArray,
    subject: options.pAsunto,
    html: options.pCuerpo,
    attachments: options.attachments || [],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return { Respuesta: true, Mensaje: 'Correo enviado correctamente.' };
  } catch (error) {
    console.error('Error sending email:', error.message);
    return { Respuesta: false, Mensaje: error.message };
  }
}

module.exports = enviarCorreo;
