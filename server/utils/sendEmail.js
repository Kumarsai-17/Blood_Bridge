const nodemailer = require("nodemailer");

// Create Gmail transporter with multiple fallback options
const createGmailTransporter = () => {
  // Try port 465 with SSL (more likely to work on Render)
  const port = parseInt(process.env.EMAIL_PORT) || 465;
  const secure = port === 465; // true for 465, false for 587
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: port,
    secure: secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
  });
};

// Send email utility
module.exports = async (to, subject, text, html = null) => {
  try {
    console.log('📧 Email Config Check:', {
      hasGmail: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      recipient: to,
      emailHost: process.env.EMAIL_HOST,
      emailPort: process.env.EMAIL_PORT || 465,
      emailUser: process.env.EMAIL_USER,
      nodeEnv: process.env.NODE_ENV
    });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env");
    }

    console.log('📧 Attempting to send email via Gmail SMTP...');
    
    let transporter = createGmailTransporter();
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
      secure: transporter.options.secure
    });
    
    try {
      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully via Gmail (port ' + transporter.options.port + '):', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (primaryError) {
      console.error('❌ Primary attempt failed (port ' + transporter.options.port + '):', primaryError.message);
      
      // Fallback: Try port 587 if 465 failed, or vice versa
      const fallbackPort = transporter.options.port === 465 ? 587 : 465;
      console.log('🔄 Trying fallback port:', fallbackPort);
      
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: fallbackPort,
        secure: fallbackPort === 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2'
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
      });
      
      const fallbackResult = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent via fallback port ' + fallbackPort + ':', fallbackResult.messageId);
      return { success: true, messageId: fallbackResult.messageId };
    }

  } catch (error) {
    console.error("❌ SEND EMAIL ERROR:", error.message);
    console.error("Error code:", error.code);
    console.error("Full error:", error);
    
    // Provide helpful error messages
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
      console.error("💡 Connection timeout - Gmail SMTP ports may be blocked by hosting provider");
      console.error("   This is common on free hosting tiers (Render, Railway, etc.)");
      console.error("   Recommendation: Use a service like Resend, SendGrid, or Mailgun for production");
    } else if (error.code === 'EAUTH') {
      console.error("💡 Authentication failed - Check EMAIL_USER and EMAIL_PASS");
      console.error("   Make sure you're using a Gmail App Password, not your regular password");
    }
    
    return { success: false, error: error.message, code: error.code };
  }
};