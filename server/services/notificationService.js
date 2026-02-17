const nodemailer = require("nodemailer");
const path = require("path");

// Load environment variables from the correct path
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Create transporter with better error handling
const createTransporter = () => {
  try {
    console.log('📧 Creating email transporter...');
    console.log('Email:', process.env.EMAIL_USER);
    console.log('Password configured:', !!process.env.EMAIL_PASS);
    console.log('Email Host:', process.env.EMAIL_HOST);
    console.log('Email Port:', process.env.EMAIL_PORT);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials not configured in environment variables');
    }
    
    const port = parseInt(process.env.EMAIL_PORT) || 587;
    const secure = false; // false for port 587 (STARTTLS)
    
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: port,
      secure: secure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
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
      from: process.env.EMAIL_FROM || `"BloodBridge Alerts" <${process.env.EMAIL_USER}>`,
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