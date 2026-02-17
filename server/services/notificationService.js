/**
 * Send email notification using Resend
 */
exports.sendNotification = async (toEmail, subject, message, html = null) => {
  try {
    console.log('📧 Notification Service - Email Config Check:', {
      hasResend: !!process.env.RESEND_API_KEY,
      recipient: toEmail
    });

    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured');
      return;
    }

    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailData = {
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [toEmail],
      subject: subject,
      text: message,
      html: html || `<pre style="font-family: monospace; white-space: pre-wrap;">${message}</pre>`
    };

    console.log('📤 Sending notification email to:', toEmail);
    const result = await resend.emails.send(emailData);
    console.log(`📧 Notification email sent successfully to ${toEmail}`);
    console.log('Message ID:', result.id || result.data?.id);
    return result;
  } catch (error) {
    console.error("❌ EMAIL NOTIFICATION ERROR:", error.message);
    console.error("Full error:", error);
    throw error;
  }
};
