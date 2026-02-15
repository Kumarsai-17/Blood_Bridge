const nodemailer = require("nodemailer");
const path = require("path");

// Load environment variables from the correct path
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Create transporter with better error handling
const createTransporter = () => {
  try {
    console.log('📧 Creating email transporter...');
    console.log('Email:', process.env.SYSTEM_EMAIL);
    console.log('Password configured:', !!process.env.SYSTEM_EMAIL_PASS);
    
    if (!process.env.SYSTEM_EMAIL || !process.env.SYSTEM_EMAIL_PASS) {
      throw new Error('Email credentials not configured in environment variables');
    }
    
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SYSTEM_EMAIL,
        pass: process.env.SYSTEM_EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error.message);
    return null;
  }
};

const transporter = createTransporter();

/**
 * Send email notification
 */
exports.sendNotification = async (toEmail, subject, message, html = null) => {
  try {
    if (!transporter) {
      console.error('❌ Email transporter not available');
      return;
    }

    // Verify transporter connection
    try {
      await transporter.verify();
      console.log('✅ Email server connection verified');
    } catch (verifyError) {
      console.error('❌ Email server verification failed:', verifyError.message);
      throw verifyError;
    }

    const mailOptions = {
      from: `"BloodBridge Alerts" <${process.env.SYSTEM_EMAIL}>`,
      to: toEmail,
      subject: subject,
      text: message
    };

    if (html) {
      mailOptions.html = html;
    }

    console.log('📤 Sending email to:', toEmail);
    const result = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${toEmail}`);
    console.log('Message ID:', result.messageId);
    return result;
  } catch (error) {
    console.error("❌ EMAIL NOTIFICATION ERROR:", error.message);
    console.error("Error code:", error.code);
    console.error("Error response:", error.response);
    throw error; // Re-throw to see the error in calling code
  }
};