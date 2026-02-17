/**
 * HTML Email Templates for BloodBridge
 * Three main templates: OTP, Blood Request, Credentials
 */

const getEmailStyles = () => `
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .header .logo { font-size: 36px; margin-bottom: 10px; }
    .content { background: #ffffff; padding: 30px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; }
    .otp-box { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px dashed #dc2626; padding: 25px; margin: 25px 0; text-align: center; border-radius: 10px; }
    .otp-code { font-size: 36px; font-weight: bold; color: #dc2626; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 15px 0; }
    .alert-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .info-box { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .success-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .credentials-box { background: #f9fafb; border: 2px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .detail-row { display: flex; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { font-weight: 600; width: 150px; color: #6b7280; }
    .detail-value { flex: 1; color: #111827; font-weight: 500; }
    .button { display: inline-block; background: #dc2626; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .button:hover { background: #b91c1c; }
    .footer { background: #1f2937; padding: 25px; text-align: center; color: #9ca3af; font-size: 14px; border-radius: 0 0 10px 10px; }
    .footer-link { color: #dc2626; text-decoration: none; }
    .urgency-high { color: #dc2626; font-weight: bold; }
    .urgency-medium { color: #f59e0b; font-weight: bold; }
    .urgency-low { color: #10b981; font-weight: bold; }
    .warning-banner { background: #fef2f2; border: 2px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center; }
    
    /* Mobile Responsive Styles */
    @media only screen and (max-width: 600px) {
      .container { padding: 10px !important; width: 100% !important; }
      .header { padding: 20px 15px !important; border-radius: 8px 8px 0 0 !important; }
      .header h1 { font-size: 22px !important; }
      .header .logo { font-size: 28px !important; }
      .header p { font-size: 13px !important; }
      .content { padding: 20px 15px !important; }
      .otp-box { padding: 15px !important; margin: 15px 0 !important; }
      .otp-code { font-size: 28px !important; letter-spacing: 4px !important; }
      .alert-box, .info-box, .success-box { padding: 12px !important; margin: 15px 0 !important; font-size: 13px !important; }
      .credentials-box { padding: 15px !important; margin: 15px 0 !important; }
      .detail-row { flex-direction: column !important; padding: 10px 0 !important; }
      .detail-label { width: 100% !important; margin-bottom: 5px !important; font-size: 12px !important; }
      .detail-value { font-size: 14px !important; }
      .button { padding: 12px 20px !important; font-size: 14px !important; display: block !important; width: 100% !important; box-sizing: border-box !important; }
      .footer { padding: 20px 15px !important; font-size: 12px !important; }
      .warning-banner { padding: 12px !important; margin: 15px 0 !important; }
      h2 { font-size: 20px !important; }
      h3 { font-size: 18px !important; }
      h4 { font-size: 16px !important; }
      p { font-size: 14px !important; }
      ul { padding-left: 15px !important; }
      li { font-size: 13px !important; }
    }
  </style>
`;

/**
 * TEMPLATE 1: OTP & VERIFICATION EMAILS
 * Used for: Email verification, Login OTP, Password reset OTP
 */
exports.otpTemplate = (data) => {
  const { recipientName, otp, purpose, expiryMinutes = 10, additionalInfo = '' } = data;
  
  const purposeText = {
    'email_verification': 'Email Verification',
    'login': 'Login Verification',
    'password_reset': 'Password Reset',
    'resend_verification': 'Email Verification (Resent)'
  };

  const purposeEmoji = {
    'email_verification': '✉️',
    'login': '🔐',
    'password_reset': '�',
    'resend_verification': '✉️'
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${getEmailStyles()}
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🩸</div>
      <h1>BloodBridge</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px;">Connecting Lives, One Donation at a Time</p>
    </div>
    
    <div class="content">
      <h2 style="color: #111827; margin-top: 0;">Hello ${recipientName || 'there'},</h2>
      
      <p style="font-size: 16px; color: #374151;">
        ${purposeEmoji[purpose] || '🔐'} You requested a <strong>${purposeText[purpose] || 'verification'}</strong> code for your BloodBridge account.
      </p>
      
      <div class="otp-box">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
        <div class="otp-code">${otp}</div>
        <p style="margin: 10px 0 0 0; font-size: 13px; color: #6b7280;">Enter this code to continue</p>
      </div>
      
      <div class="info-box">
        <p style="margin: 0; font-size: 14px;">
          ⏰ <strong>This code will expire in ${expiryMinutes} minutes.</strong> Please use it before it expires.
        </p>
      </div>
      
      ${additionalInfo ? `
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #374151;">${additionalInfo}</p>
      </div>
      ` : ''}
      
      <div class="warning-banner">
        <p style="margin: 0; color: #dc2626; font-weight: 600;">
          🔒 Security Notice
        </p>
        <p style="margin: 10px 0 0 0; font-size: 13px; color: #6b7280;">
          Never share this code with anyone. BloodBridge staff will never ask for your verification code.
        </p>
      </div>
      
      <p style="color: #6b7280; font-size: 13px; margin-top: 30px; text-align: center;">
        If you didn't request this code, please ignore this email or contact support if you're concerned about your account security.
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0; color: #fff;"><strong>BloodBridge</strong> - Saving Lives Together</p>
      <p style="margin: 0; font-size: 12px;">
        Need help? Contact us at <a href="mailto:support@bloodbridge.com" class="footer-link">support@bloodbridge.com</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * TEMPLATE 2: BLOOD REQUEST NOTIFICATIONS
 * Used for: Notifying donors about blood requests
 */
exports.bloodRequestTemplate = (data) => {
  const { 
    donorName, 
    bloodGroup, 
    units, 
    urgency, 
    hospitalName, 
    hospitalPhone, 
    hospitalAddress, 
    hospitalLocation,
    distance, 
    notes, 
    requestUrl, 
    isDisaster 
  } = data;
  
  const urgencyClass = `urgency-${urgency}`;
  const urgencyEmoji = urgency === 'high' ? '🚨' : urgency === 'medium' ? '⚠️' : 'ℹ️';
  
  // Format location for display
  const locationText = hospitalLocation 
    ? `${hospitalLocation.lat.toFixed(4)}, ${hospitalLocation.lng.toFixed(4)}` 
    : 'Location not available';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${getEmailStyles()}
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🩸</div>
      <h1>BloodBridge</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px;">Connecting Lives, One Donation at a Time</p>
    </div>
    
    <div class="content">
      ${isDisaster ? `
        <div class="alert-box" style="background: #7f1d1d; color: white; border: 3px solid #dc2626;">
          <h2 style="margin: 0 0 10px 0; color: #fff; font-size: 22px;">🚨 EMERGENCY DISASTER ALERT 🚨</h2>
          <p style="margin: 0; font-weight: 600; font-size: 16px; color: #fef2f2;">
            This is a CRITICAL EMERGENCY request during DISASTER MODE!
          </p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #fecaca;">
            Mass casualty event in progress. Multiple lives at stake. IMMEDIATE response needed!
          </p>
          <p style="margin: 10px 0 0 0; font-size: 13px; color: #fecaca; font-style: italic;">
            All donation cooldown periods have been suspended. Every donor is urgently needed.
          </p>
        </div>
      ` : ''}
      
      <h2 style="color: #111827; margin-top: 0;">Hello ${donorName},</h2>
      
      <p style="font-size: 16px; color: #374151;">
        ${isDisaster 
          ? '<strong style="color: #dc2626;">URGENT:</strong> A nearby hospital urgently needs your help during this emergency! Your blood type matches a critical requirement.' 
          : 'A nearby hospital urgently needs your help! Your blood type matches a critical requirement.'
        }
      </p>
      
      <div class="alert-box">
        <h3 style="margin: 0 0 15px 0; color: #dc2626;">🩸 Blood Request Details</h3>
        
        <div class="detail-row">
          <div class="detail-label">Blood Group:</div>
          <div class="detail-value" style="font-size: 20px; font-weight: bold; color: #dc2626;">${bloodGroup}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Units Needed:</div>
          <div class="detail-value"><strong>${units} unit(s)</strong></div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Urgency Level:</div>
          <div class="detail-value"><span class="${urgencyClass}">${urgencyEmoji} ${urgency.toUpperCase()}</span></div>
        </div>
        
        ${notes ? `
        <div class="detail-row">
          <div class="detail-label">Notes:</div>
          <div class="detail-value">${notes}</div>
        </div>
        ` : ''}
        
        ${distance ? `
        <div class="detail-row">
          <div class="detail-label">Distance:</div>
          <div class="detail-value">📍 ${distance} km from you</div>
        </div>
        ` : ''}
      </div>
      
      <div style="background: #f0f9ff; border: 2px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #1e40af;">🏥 Hospital Contact Information</h3>
        
        <div class="detail-row" style="border-bottom: 1px solid #dbeafe;">
          <div class="detail-label">Hospital Name:</div>
          <div class="detail-value" style="font-weight: bold; color: #1e40af;">${hospitalName}</div>
        </div>
        
        ${hospitalPhone ? `
        <div class="detail-row" style="border-bottom: 1px solid #dbeafe;">
          <div class="detail-label">Phone Number:</div>
          <div class="detail-value">
            <a href="tel:${hospitalPhone}" style="color: #dc2626; text-decoration: none; font-weight: 600;">
              📞 ${hospitalPhone}
            </a>
          </div>
        </div>
        ` : ''}
        
        ${hospitalAddress ? `
        <div class="detail-row" style="border-bottom: 1px solid #dbeafe;">
          <div class="detail-label">Address:</div>
          <div class="detail-value">${hospitalAddress}</div>
        </div>
        ` : ''}
        
        ${hospitalLocation ? `
        <div class="detail-row" style="border-bottom: none;">
          <div class="detail-label">Location:</div>
          <div class="detail-value">
            <a href="https://www.google.com/maps?q=${hospitalLocation.lat},${hospitalLocation.lng}" 
               target="_blank" 
               style="color: #dc2626; text-decoration: none; font-weight: 600;">
              📍 View on Map
            </a>
            <br>
            <span style="font-size: 12px; color: #6b7280;">${locationText}</span>
          </div>
        </div>
        ` : ''}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${requestUrl}" class="button" style="font-size: 16px; padding: 16px 32px;">
          ${isDisaster ? '🚨 RESPOND TO EMERGENCY REQUEST →' : 'View & Respond to Request →'}
        </a>
      </div>
      
      <div class="${isDisaster ? 'alert-box' : 'info-box'}">
        <p style="margin: 0; font-size: 14px;">
          <strong>⏰ Time is critical!</strong> Please respond as soon as possible if you're available to donate.
          ${isDisaster ? '<br><strong style="color: #dc2626;">During disaster mode, every second counts. Multiple patients need your help!</strong>' : 'Your donation can save lives!'}
        </p>
      </div>
      
      ${isDisaster ? `
      <div style="background: #fef2f2; border: 2px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px; color: #7f1d1d; font-weight: 600;">
          ⚠️ DISASTER MODE INFORMATION:
        </p>
        <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #991b1b; font-size: 13px;">
          <li>All donation cooldown periods are suspended</li>
          <li>Priority processing for all donors</li>
          <li>Emergency protocols are active</li>
          <li>Multiple casualties require immediate blood supply</li>
        </ul>
      </div>
      ` : ''}
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        If you're unable to donate, please consider sharing this request with friends or family who might be able to help.
        ${isDisaster ? '<strong style="color: #dc2626;"> During this emergency, every donor counts!</strong>' : ''}
      </p>
      
      <p style="color: #111827; font-size: 15px; margin-top: 20px; text-align: center; font-weight: 600;">
        Thank you for being a lifesaver! 💝
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0; color: #fff;"><strong>BloodBridge</strong> - Saving Lives Together</p>
      <p style="margin: 0; font-size: 12px;">
        You received this email because you're registered as a blood donor in our system.
      </p>
      ${isDisaster ? `
      <p style="margin: 10px 0 0 0; font-size: 11px; color: #fca5a5;">
        This is an emergency disaster alert. Please respond immediately if possible.
      </p>
      ` : ''}
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * TEMPLATE 3: CREDENTIALS (Admin, Hospital, Blood Bank)
 * Used for: Sending login credentials to approved users
 */
exports.credentialsTemplate = (data) => {
  const { 
    recipientName, 
    email, 
    password, 
    role, 
    loginUrl, 
    region = null, 
    state = null, 
    city = null,
    isResend = false,
    additionalInfo = ''
  } = data;
  
  const roleInfo = {
    'admin': {
      title: 'Administrator',
      emoji: '👨‍💼',
      color: '#7c3aed',
      permissions: [
        'Approve/reject hospital and blood bank registrations in your region',
        'View and manage users in your region',
        'Access admin dashboard and reports for your region',
        'Monitor blood donation activities in your region'
      ]
    },
    'hospital': {
      title: 'Hospital',
      emoji: '🏥',
      color: '#dc2626',
      permissions: [
        'Create blood requests for patients',
        'View and manage donor responses',
        'Track donation history',
        'Access hospital dashboard and analytics'
      ]
    },
    'bloodbank': {
      title: 'Blood Bank',
      emoji: '🏦',
      color: '#0891b2',
      permissions: [
        'Manage blood inventory',
        'Track blood stock levels',
        'View donation requests',
        'Generate inventory reports'
      ]
    }
  };

  const info = roleInfo[role] || roleInfo['hospital'];
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${getEmailStyles()}
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, ${info.color} 0%, #991b1b 100%);">
      <div class="logo">${info.emoji}</div>
      <h1>BloodBridge</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px;">
        ${isResend ? 'Credentials Reset' : 'Welcome to BloodBridge!'}
      </p>
    </div>
    
    <div class="content">
      <h2 style="color: #111827; margin-top: 0;">Hello ${recipientName},</h2>
      
      ${isResend ? `
        <div class="info-box">
          <p style="margin: 0; font-size: 15px;">
            Your ${info.title} account credentials have been reset by an administrator.
          </p>
        </div>
      ` : `
        <div class="success-box">
          <p style="margin: 0; font-size: 15px;">
            ${role === 'admin' 
              ? 'Your administrator account has been created by the Super Admin.' 
              : `Great news! Your ${info.title} registration has been approved by our admin team.`
            }
          </p>
        </div>
      `}
      
      <div class="credentials-box">
        <h3 style="margin: 0 0 20px 0; color: #dc2626; text-align: center;">
          🔐 Your Login Credentials
        </h3>
        
        <div class="detail-row">
          <div class="detail-label">Email:</div>
          <div class="detail-value" style="color: #dc2626; font-family: monospace;">${email}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Password:</div>
          <div class="detail-value" style="color: #dc2626; font-family: monospace; font-weight: bold;">${password}</div>
        </div>
        
        ${role === 'admin' && region ? `
        <div class="detail-row">
          <div class="detail-label">Region:</div>
          <div class="detail-value">${region}</div>
        </div>
        ` : ''}
        
        ${role === 'admin' && state ? `
        <div class="detail-row">
          <div class="detail-label">State:</div>
          <div class="detail-value">${state}</div>
        </div>
        ` : ''}
        
        ${role === 'admin' && city ? `
        <div class="detail-row" style="border-bottom: none;">
          <div class="detail-label">City:</div>
          <div class="detail-value">${city}</div>
        </div>
        ` : ''}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" class="button">
          Login to Your Account →
        </a>
      </div>
      
      <div class="warning-banner">
        <p style="margin: 0; color: #dc2626; font-weight: 600;">
          🔒 IMPORTANT SECURITY NOTICE
        </p>
        <p style="margin: 10px 0 0 0; font-size: 13px; color: #6b7280;">
          Please keep your credentials secure and do not share them with anyone. 
          ${isResend ? 'We recommend changing your password after logging in.' : 'You can change your password anytime from your account settings.'}
        </p>
      </div>
      
      ${role === 'admin' && region ? `
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h4 style="margin: 0 0 15px 0; color: #0891b2;">📋 Your Responsibilities</h4>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">
          As a regional administrator for <strong>${city}, ${state}</strong> (${region} region), you can:
        </p>
        <ul style="margin: 10px 0; padding-left: 20px; color: #374151; font-size: 14px;">
          ${info.permissions.map(p => `<li style="margin: 5px 0;">${p}</li>`).join('')}
        </ul>
        <p style="margin: 10px 0 0 0; font-size: 13px; color: #6b7280;">
          <strong>Note:</strong> You can only access data for your assigned region.
        </p>
      </div>
      ` : `
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h4 style="margin: 0 0 15px 0; color: #0891b2;">✨ What You Can Do</h4>
        <ul style="margin: 10px 0; padding-left: 20px; color: #374151; font-size: 14px;">
          ${info.permissions.map(p => `<li style="margin: 5px 0;">${p}</li>`).join('')}
        </ul>
      </div>
      `}
      
      ${additionalInfo ? `
      <div class="info-box">
        <p style="margin: 0; font-size: 14px;">${additionalInfo}</p>
      </div>
      ` : ''}
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
        If you have any questions or need assistance, please contact ${role === 'admin' ? 'the Super Admin' : 'our support team'}.
      </p>
      
      <p style="color: #111827; font-size: 15px; margin-top: 30px; text-align: center; font-weight: 600;">
        Welcome to the team! 🎉
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0; color: #fff;"><strong>BloodBridge</strong> - Saving Lives Together</p>
      <p style="margin: 0; font-size: 12px;">
        Need help? Contact us at <a href="mailto:support@bloodbridge.com" class="footer-link">support@bloodbridge.com</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * HELPER: Get template ID based on email type
 */
exports.getTemplateId = (emailType) => {
  const templates = {
    'otp': process.env.EMAILJS_TEMPLATE_OTP,
    'blood_request': process.env.EMAILJS_TEMPLATE_BLOOD_REQUEST,
    'credentials': process.env.EMAILJS_TEMPLATE_CREDENTIALS
  };
  
  return templates[emailType] || process.env.EMAILJS_TEMPLATE_OTP;
};
