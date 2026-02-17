const nodemailer = require("nodemailer");

// Create Gmail transporter - Port 587 with STARTTLS
const createGmailTransporter = () => {
  const port = parseInt(process.env.EMAIL_PORT) || 587;
  const secure = false; // false for port 587 (STARTTLS)
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: port,
    secure: secure,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    connectionTimeout: 20000, // 20 seconds
    greetingTimeout: 20000,     
    socketTimeout: 20000,
    debug: true,
    logger: true
  });
};

// Send email utility
module.exports = async (to, subject, text, html = null) => {
  try {
    console.log('📧 Email Config Check:', {
      hasGmail: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      recipient: to,
      emailHost: process.env.EMAIL_HOST,
      emailPort: process.env.EMAIL_PORT || 587,
      emailUser: process.env.EMAIL_USER,
      nodeEnv: process.env.NODE_ENV
    });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env");
    }

    console.log('📧 Attempting to send email via Gmail SMTP port 587...');
    
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
      subject: mailOptions.subject,
      port: transporter.options.port,
      secure: transporter.options.secure,
      requireTLS: transporter.options.requireTLS
    });
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully via Gmail port 587:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error("❌ SEND EMAIL ERROR:", error.message);
    console.error("Error code:", error.code);
    console.error("Full error:", error);
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
      console.error("💡 Connection timeout - Gmail SMTP port 587 may be blocked");
    } else if (error.code === 'EAUTH') {
      console.error("💡 Authentication failed - Check EMAIL_USER and EMAIL_PASS");
    }
    
    return { success: false, error: error.message, code: error.code };
  }
};