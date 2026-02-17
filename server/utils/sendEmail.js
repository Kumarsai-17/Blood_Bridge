const nodemailer = require("nodemailer");

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
      recipient: to,
      resendFrom: process.env.RESEND_FROM_EMAIL
    });

    // Priority 1: Resend (works on all platforms, 100 emails/day free)
    if (process.env.RESEND_API_KEY) {
      console.log('📧 Attempting to send via Resend...');
      
      try {
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        const emailData = {
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: [to],
          subject: subject,
          text: text,
          html: html || `<pre style="font-family: monospace; white-space: pre-wrap;">${text}</pre>`
        };
        
        console.log('📧 Sending email with data:', {
          from: emailData.from,
          to: emailData.to,
          subject: emailData.subject
        });
        
        const result = await resend.emails.send(emailData);
        
        console.log('✅ Email sent via Resend successfully:', result);
        return { success: true, messageId: result.id || result.data?.id };
      } catch (resendError) {
        console.error('❌ Resend failed:', resendError.message);
        console.error('Resend error details:', resendError);
        // Fall through to Gmail if Resend fails
      }
    }

    // Priority 2: Gmail SMTP (works locally only)
    if (process.env.SYSTEM_EMAIL && process.env.SYSTEM_EMAIL_PASS) {
      console.log('📧 Sending via Gmail SMTP (fallback)');
      
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

    throw new Error("No email service configured or all services failed");

  } catch (error) {
    console.error("❌ SEND EMAIL ERROR:", error.message);
    console.error("Full error:", error);
    return { success: false, error: error.message };
  }
};