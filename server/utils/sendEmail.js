const nodemailer = require("nodemailer");

// Create Gmail transporter
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App password for Gmail
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send email utility
module.exports = async (to, subject, text, html = null) => {
  try {
    console.log('📧 Email Config Check:', {
      hasGmail: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      recipient: to,
      emailHost: process.env.EMAIL_HOST,
      emailPort: process.env.EMAIL_PORT,
      emailUser: process.env.EMAIL_USER
    });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env");
    }

    console.log('📧 Sending email via Gmail SMTP...');
    
    const transporter = createGmailTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"BloodBridge" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || `<pre style="font-family: monospace; white-space: pre-wrap;">${text}</pre>`
    };
    
    console.log('📧 Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully via Gmail:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error("❌ SEND EMAIL ERROR:", error.message);
    console.error("Full error:", error);
    return { success: false, error: error.message };
  }
};