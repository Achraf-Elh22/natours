const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create Transporter (Like Gmail or hotmail ...)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2) Define the emal options
  const mailOptions = {
    from: 'ACHRAF ELHAMZAOUI <achrafelh22@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //   html:
  };
  // 3)Send The Email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
