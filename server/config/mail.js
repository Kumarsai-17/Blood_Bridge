const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SYSTEM_EMAIL,
    pass: process.env.SYSTEM_EMAIL_PASS
  }
});

module.exports = {
  transporter,
  
  async sendMail(to, subject, text, html = null) {
    try {
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
      console.log(`📧 Email sent to ${to}: ${subject}`);
      return result;
    } catch (error) {
      console.error("EMAIL ERROR:", error.message);
      throw error;
    }
  }
};