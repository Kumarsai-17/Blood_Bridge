/**
 * Send email notification using EmailJS with template support
 */
const axios = require('axios');

/**
 * Send notification email
 * @param {string} toEmail - Recipient email
 * @param {string} subject - Email subject
 * @param {string} message - Plain text message
 * @param {string} html - HTML content
 * @param {string} templateType - Template type: 'otp', 'blood_request', 'credentials'
 */
exports.sendNotification = async (toEmail, subject, message, html = null, templateType = 'blood_request') => {
  try {
    console.log('📧 Notification Service - Email Config Check:', {
      hasEmailJS: !!process.env.EMAILJS_SERVICE_ID,
      recipient: toEmail,
      templateType: templateType
    });

    if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_PUBLIC_KEY) {
      console.error('❌ EmailJS credentials not configured');
      return;
    }

    // Select template based on type (2 templates only for free tier)
    let templateId;
    if (templateType === 'otp') {
      templateId = process.env.EMAILJS_TEMPLATE_OTP;
    } else {
      // Use general template for blood_request, credentials, and everything else
      templateId = process.env.EMAILJS_TEMPLATE_GENERAL;
    }

    if (!templateId) {
      throw new Error(`EmailJS template not configured for type: ${templateType}`);
    }

    const emailData = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        to_email: toEmail,
        subject: subject,
        message: message,
        html_content: html || message
      }
    };

    console.log(`📤 Sending notification email to: ${toEmail} (${templateType} template)`);
    const response = await axios.post(
      'https://api.emailjs.com/api/v1.0/email/send',
      emailData,
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'BloodBridge-Server/1.0'
        }
      }
    );
    
    if (response.status === 200) {
      console.log(`📧 Notification email sent successfully to ${toEmail}`);
      return response.data;
    } else {
      throw new Error('Email sending failed');
    }
  } catch (error) {
    console.error("❌ EMAIL NOTIFICATION ERROR:", error.message);
    console.error("Full error:", error.response?.data || error);
    throw error;
  }
};
