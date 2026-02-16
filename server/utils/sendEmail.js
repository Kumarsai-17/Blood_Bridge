const nodemailer = require("nodemailer");
const { google } = require('googleapis');

// Gmail OAuth2 configuration (more reliable than App Password)
const createOAuth2Transporter = async () => {
  const OAuth2 = google.auth.OAuth2;
  
  const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
  });

  const accessToken = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.SYSTEM_EMAIL,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessToken.token
    }
  });
};

// Simple Gmail SMTP with App Password (fallback)
const createSimpleTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SYSTEM_EMAIL,
      pass: process.env.SYSTEM_EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

module.exports = async (to, subject, text, html = null) => {
  try {
    if (!process.env.SYSTEM_EMAIL) {
      throw new Error("SYSTEM_EMAIL is required");
    }

    const mailOptions = {
      from: `"BloodBridge System" <${process.env.SYSTEM_EMAIL}>`,
      to,
      subject,
      text,
      html: html || text
    };

    // Try OAuth2 first if configured (more reliable on cloud platforms)
    if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
      try {
        console.log('📧 Sending via Gmail OAuth2');
        const transporter = await createOAuth2Transporter();
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent via OAuth2:', result.messageId);
        return { success: true, messageId: result.messageId };
      } catch (oauthError) {
        console.error('OAuth2 failed, trying App Password:', oauthError.message);
      }
    }

    // Fallback to App Password
    if (!process.env.SYSTEM_EMAIL_PASS) {
      throw new Error("Either OAuth2 credentials or SYSTEM_EMAIL_PASS is required");
    }

    console.log('📧 Sending via Gmail App Password');
    const transporter = createSimpleTransporter();
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent via App Password:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error("SEND EMAIL ERROR:", error.message);
    return { success: false, error: error.message };
  }
};