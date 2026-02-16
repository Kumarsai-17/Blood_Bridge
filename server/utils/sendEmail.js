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
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("SEND EMAIL ERROR:", error.message);
    return { success: false, error: error.message };
  }
};