// Send email utility using Resend
module.exports = async (to, subject, text, html = null) => {
  try {
    console.log('📧 Email Config Check:', {
      hasResend: !!process.env.RESEND_API_KEY,
      recipient: to,
      resendFrom: process.env.RESEND_FROM_EMAIL
    });

    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured in environment variables");
    }

    console.log('📧 Sending email via Resend...');
    
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const emailData = {
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [to],
      subject: subject,
      text: text,
      html: html || `<pre style="font-family: monospace; white-space: pre-wrap;">${text}</pre>`
    };
    
    console.log('📧 Sending email:', {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject
    });
    
    const result = await resend.emails.send(emailData);
    
    console.log('✅ Email sent successfully via Resend:', result);
    return { success: true, messageId: result.id || result.data?.id };

  } catch (error) {
    console.error("❌ SEND EMAIL ERROR:", error.message);
    console.error("Full error:", error);
    
    if (error.message.includes('API key')) {
      console.error("� Invalid Resend API key - Check RESEND_API_KEY in environment variables");
    }
    
    return { success: false, error: error.message };
  }
};
