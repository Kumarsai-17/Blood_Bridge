const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SYSTEM_EMAIL,
    pass: process.env.SYSTEM_EMAIL_PASS
  }
});

// Verify transporter configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Email transporter configuration error:", error);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

module.exports = async (to, subject, text, html = null) => {
  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    console.log(`📧 From: ${process.env.SYSTEM_EMAIL}`);
    
    // Validate email configuration
    if (!process.env.SYSTEM_EMAIL || !process.env.SYSTEM_EMAIL_PASS) {
      throw new Error("Email configuration missing. Please check SYSTEM_EMAIL and SYSTEM_EMAIL_PASS environment variables.");
    }
    
    const mailOptions = {
      from: `"BloodBridge System" <${process.env.SYSTEM_EMAIL}>`,
      to,
      subject,
      text
    };
    
    if (html) {
      mailOptions.html = html;
    }
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}:`, result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ SEND EMAIL ERROR:", error.message);
    console.error("Full error:", error);
    
    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      console.error("❌ Authentication failed. Check your email credentials.");
    } else if (error.code === 'ECONNECTION') {
      console.error("❌ Connection failed. Check your internet connection.");
    }
    
    return { success: false, error: error.message };
  }
};