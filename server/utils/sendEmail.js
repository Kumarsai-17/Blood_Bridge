// Send email utility using EmailJS with multiple template support
const axios = require('axios');

/**
 * Send email using EmailJS
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content (fallback)
 * @param {string} html - HTML content
 * @param {string} templateType - Template type: 'otp', 'blood_request', 'credentials'
 */
module.exports = async (to, subject, text, html = null, templateType = 'otp') => {
  try {
    console.log('📧 Email Config Check:', {
      hasEmailJS: !!process.env.EMAILJS_SERVICE_ID,
      recipient: to,
      templateType: templateType
    });

    if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_PUBLIC_KEY) {
      throw new Error("EmailJS credentials not configured in environment variables");
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

    console.log('📧 Sending email via EmailJS...', {
      template: templateType,
      templateId: templateId
    });
    
    const emailData = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        to_email: to,
        subject: subject,
        message: text,
        html_content: html || text
      }
    };
    
    console.log('📧 Sending email:', {
      to: to,
      subject: subject,
      template: templateType
    });
    
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
      console.log(`✅ Email sent successfully via EmailJS (${templateType} template)`);
      return { success: true, messageId: response.data };
    } else {
      console.error('❌ EmailJS API Error:', response.data);
      return { 
        success: false, 
        error: 'Email sending failed'
      };
    }

  } catch (error) {
    console.error("❌ SEND EMAIL ERROR:", error.message);
    console.error("Full error:", error.response?.data || error);
    
    if (error.response?.status === 400) {
      console.error("💡 Invalid EmailJS configuration - Check your credentials and template IDs");
    }
    
    return { success: false, error: error.message };
  }
};
