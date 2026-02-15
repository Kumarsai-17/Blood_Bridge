const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SYSTEM_EMAIL,
    pass: process.env.SYSTEM_EMAIL_PASS
  }
});

module.exports = async (to, subject, text, html = null) => {
  try {
    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    
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
    return { success: false, error: error.message };
  }
};