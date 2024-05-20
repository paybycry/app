import nodemailer from "nodemailer";

export default async function sendEmail(
  to: string,
  subject: string,
  text: string
) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Your App Name" <${process.env.EMAIL_USER}@demomailtrap.com>`, // Ensure the from address is correctly formatted
    to,
    subject,
    text,
  });
}
