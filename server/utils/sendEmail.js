const nodemailer = require("nodemailer");

// Try multiple Gmail SMTP configurations
const createGmailTransporter = (port = 587, secure = false) => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: port,
    secure: secure,
    auth: {
      user: process.env.SYSTEM_EMAIL,
      pass: process.env.SYSTEM_EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000
  });
};

module.exports = async (to, subject, text, html = null) => {
  try {
    console.log('🔍 Email Config Check:', {
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasGmailEmail: !!process.env.SYSTEM_EMAIL,
      hasGmailPass: !!process.env.SYSTEM_EMAIL_PASS,
      recipient: to
    });

    // Try Gmail with multiple port configurations
    if (process.env.SYSTEM_EMAIL && process.env.SYSTEM_EMAIL_PASS) {
      const gmailConfigs = [
        { port: 587, secure: false, name: 'Port 587 (TLS)' },
        { port: 465, secure: true, name: 'Port 465 (SSL)' },
        { port: 25, secure: false, name: 'Port 25' }
      ];

      for (const config of gmailConfigs) {
        try {
          console.log(`📧 Attempting Gmail via ${config.name}`);
          
          const transporter = createGmailTransporter(config.port, config.secure);
          const mailOptions = {
            from: `"BloodBridge System" <${process.env.SYSTEM_EMAIL}>`,
            to,
            subject,
            text,
            html: html || text
          };
          
          const result = await transporter.sendMail(mailOptions);
          console.log(`✅ Email sent via Gmail ${config.name}:`, result.messageId);
          return { success: true, messageId: result.messageId };
        } catch (gmailError) {
          console.log(`⚠️ Gmail ${config.name} failed:`, gmailError.message);
          continue; // Try next configuration
        }
      }
      
      console.log('⚠️ All Gmail configurations failed, trying Resend');
    }

    // Fallback to Resend
    if (process.env.RESEND_API_KEY) {
      console.log('📧 Sending via Resend API');
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'BloodBridge <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        text: text,
        html: html || text
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Email sent via Resend:', data.id);
      return { success: true, messageId: data.id };
    }

    throw new Error("No email configuration available or all methods failed");

  } catch (error) {
    console.error("SEND EMAIL ERROR:", error.message);
    return { success: false, error: error.message };
  }
};