const nodemailer = require("nodemailer");

const nodemailerTransporter = nodemailer.createTransport({
  host: process.env.SENDER_EMAIL_HOSTNAME,
  port: process.env.SENDER_EMAIL_PORT,
  auth: {
    user: process.env.SENDER_EMAIL_ID,
    pass: process.env.SENDER_EMAIL_PASSWORD,
  },
});

module.exports = { nodemailerTransporter };
