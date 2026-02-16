const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER, // usually your Brevo login email
        pass: process.env.BREVO_SMTP_KEY,  // SMTP key from Brevo dashboard
      },
    });

    const info = await transporter.sendMail({
      from: `"StudyNotion | Learn by Experts" <sanketgolekar3@gmail.com>`,
      to: email,
      subject: title,
      html: body,
    });

    return info;
  } catch (error) {
    console.error("BREVO MAIL ERROR:", error.message);
    throw error; // important for OTP / auth flows
  }
};

module.exports = mailSender;