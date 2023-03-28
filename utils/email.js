const nodemailer = require("nodemailer");

const sendEmail = async(options) => {
  // 1) create The Transporter (Service that send the email)

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "smsm258sem@gmail.com",
      pass: "ficmxelaiuzvximq",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // 2) define the email options

  const mailOptions = {
    from : "Osama Eljamala <smsm258sem@gmail.com>",
    to : options.email,
    subject : options.subject,
    text : options.text
  }

  // 3) send the email 

  await transporter.sendMail(mailOptions); // it's an Asynchronous Function

};

module.exports = sendEmail;
