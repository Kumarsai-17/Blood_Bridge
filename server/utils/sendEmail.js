const nodemailer = require("nodemailer");
const { Resend } = require('resend');

// Gmail SMTP transporter
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
      hasResend: !!process.env.RESEND_API_KEY,
      hasGmail: !!(process.env.SYSTEM_EMAIL && process.env.SYSTEM_EMAIL_PASS),
      recipient: to
    });

    // Priority 1: Resend (works on all platforms, 100 emails/day free)
    if (process.env.RESEND_API_KEY) {
      console.log('📧 Sending via Resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'BloodBridge <onboarding@resend.dev>',
        to: to,
        subject: subject,
        text: text,
        html: html || `<pre>${text}</pre>`
      });
      
      console.log('✅ Email sent via Resend:', result);
      return { success: true, messageId: result.id };
    }

    // Priority 2: Gmail SMTP (works locally only)
    if (process.env.SYSTEM_EMAIL && process.env.SYSTEM_EMAIL_PASS) {
      console.log('📧 Sending via Gmail SMTP');
      
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
    }

    throw new Error("No email service configured");

  } catch (error) {
    console.error("SEND EMAIL ERROR:", error.message);
    console.error("Full error:", error);
    return { success: false, error: error.message };
  }
};