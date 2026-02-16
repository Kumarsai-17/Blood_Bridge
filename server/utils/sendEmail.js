const nodemailer = require("nodemailer");

// Simple Gmail SMTP transporter
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SYSTEM_EMAIL,
      pass: process.env.SYSTEM_EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

module.exports = async (to, subject, text, html = null) => {
  try {
    console.log('🔍 Email Config Check:', {
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasGmailEmail: !!process.env.SYSTEM_EMAIL,
      hasGmailPass: !!process.env.SYSTEM_EMAIL_PASS
    });

    // Check if using Resend (recommended for production)
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

    // Fallback to Gmail
    console.log('📧 Sending via Gmail');
    
    if (!process.env.SYSTEM_EMAIL || !process.env.SYSTEM_EMAIL_PASS) {
      throw new Error("Email configuration missing");
    }

    const transporter = createGmailTransporter();
    const mailOptions = {
      from: `"BloodBridge System" <${process.env.SYSTEM_EMAIL}>`,
      to,
      subject,
      text,
      html: html || text
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent via Gmail:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error("SEND EMAIL ERROR:", error.message);
    return { success: false, error: error.message };
  }
};