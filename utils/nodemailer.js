import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: process.env.NODEMAILER_PORT,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD
  }
});

const sendEmail = async (options) => {
  await transporter.sendMail({
    from: '"Choudhary Enterprises Support" <helpdesk@choudharys.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  });
};

export default sendEmail;
