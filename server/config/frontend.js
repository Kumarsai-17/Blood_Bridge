// Frontend URL configuration
// Change this when deploying to production

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

module.exports = {
  FRONTEND_URL,
  getLoginUrl: () => `${FRONTEND_URL}/login`,
  getDonorRequestsUrl: () => `${FRONTEND_URL}/donor/requests`,
  getVerifyEmailUrl: () => `${FRONTEND_URL}/verify-email`,
  getResetPasswordUrl: () => `${FRONTEND_URL}/reset-password`
};
