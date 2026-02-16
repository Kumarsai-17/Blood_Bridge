const nodemailer = require("nodemailer");
const sgMail = require('@sendgrid/mail');

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
      hasSendGrid: !!process.env.SENDGRID_API_KEY,
      hasGmail: !!(process.env.SYSTEM_EMAIL && process.env.SYSTEM_EMAIL_PASS),
      recipient: to
    });

    // Priority 1: SendGrid (works on all platforms, 100 emails/day free)
    if (process.env.SENDGRID_API_KEY) {
      console.log('📧 Sending via SendGrid');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      const msg = {
        to: to,
        from: process.env.SENDGRID_FROM_EMAIL || process.env.SYSTEM_EMAIL,
        subject: subject,
        text: text,
        html: html || text
      };
      
      const result = await sgMail.send(msg);
      console.log('✅ Email sent via SendGrid');
      return { success: true, messageId: result[0].headers['x-message-id'] };
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
    return { success: false, error: error.message };
  }
};