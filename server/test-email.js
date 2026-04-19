require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Starting email test...');
console.log('Email user:', process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendMail({
  from: `"DevCollab" <${process.env.EMAIL_USER}>`,
  to: process.env.EMAIL_USER,
  subject: 'Test Email',
  text: 'Email working!',
})
.then(() => {
  console.log('✅ Email sent successfully!');
})
.catch((error) => {
  console.error('❌ Error:', error.message);
});