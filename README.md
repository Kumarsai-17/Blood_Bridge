# Blood Bridge 🩸

A comprehensive blood donation management system connecting donors, hospitals, and blood banks to save lives.

## 🌟 Features

### For Donors
- Register and create donor profile with blood group
- View nearby blood requests based on location
- Accept/decline donation requests
- Track donation history
- Receive real-time notifications for urgent requests
- View accepted requests and hospital details

### For Hospitals
- Create blood requests with urgency levels
- View donor responses in real-time
- Track request status and fulfillment
- Disaster mode for emergency situations
- Contact support for assistance
- Manage donation history

### For Blood Banks
- Manage blood inventory by blood group
- Track inventory levels and expiry dates
- View blood requests from hospitals
- Generate reports on blood availability

### For Admins
- Approve/reject user registrations
- Manage users (donors, hospitals, blood banks)
- View system-wide statistics and reports
- Regional admin support (filter by state/city)
- Create additional admin accounts (super admin only)
- Export donor data

## 🚀 Tech Stack

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Axios
- Lucide React Icons
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Nodemailer for email notifications
- Node-cron for scheduled tasks

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Gmail account for email notifications

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/Kumarsai-17/Blood_Bridge.git
cd Blood_Bridge
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 3. Setup Frontend
```bash
cd ../client/bloodbridge-client
npm install
```

## 🏃‍♂️ Running the Application

### Start Backend Server
```bash
cd server
npm start
# or for development with auto-reload
npm run dev
```

### Start Frontend
```bash
cd client/bloodbridge-client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5001

## 👤 Default Admin Credentials

```
Email: superadmin@bloodbridge.com
Password: SuperAdmin@123
```

**Note:** You will be required to change the password on first login.

## 🔐 User Roles

1. **Super Admin**: Full system access, can create regional admins
2. **Regional Admin**: Manage users and approvals for specific state/city
3. **Donor**: Register, respond to blood requests, track donations
4. **Hospital**: Create blood requests, manage responses, disaster mode
5. **Blood Bank**: Manage inventory, view requests

## 📧 Email Notifications

The system sends automated emails for:
- Email verification during registration
- Login OTP verification
- Account approval notifications
- Blood request alerts (30km radius)
- Password reset
- Donation confirmations

## 🚨 Disaster Mode

Hospitals can activate disaster mode during emergencies:
- Suspends donation cooldown periods
- Expands search radius to 30km
- Prioritizes all notifications
- Immediate alerts to all eligible donors

## 📊 Key Features

### Location-Based Matching
- Uses GPS coordinates for donor-hospital matching
- Configurable search radius (default 30km for emails)
- Distance calculation for optimal donor selection

### Blood Compatibility
- Automatic blood type compatibility checking
- Supports all blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Universal donor/recipient logic

### Security
- JWT-based authentication
- Password hashing with bcrypt
- OTP verification for login (except super admin)
- Email verification required
- Role-based access control

## 📁 Project Structure

```
Blood_Bridge/
├── client/bloodbridge-client/    # React frontend
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── pages/               # Page components
│   │   ├── context/             # React context
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API services
│   │   └── router/              # Route configuration
│   └── package.json
│
└── server/                       # Express backend
    ├── config/                   # Configuration files
    ├── controllers/              # Route controllers
    ├── models/                   # Mongoose models
    ├── routes/                   # API routes
    ├── middleware/               # Custom middleware
    ├── services/                 # Business logic
    ├── utils/                    # Utility functions
    ├── cron/                     # Scheduled jobs
    └── package.json
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Kumar Sai - [GitHub](https://github.com/Kumarsai-17)

## 🙏 Acknowledgments

- Thanks to all contributors who helped build this system
- Inspired by the need to streamline blood donation processes
- Built to save lives and connect communities

---

**Note:** This is a college project/learning project. For production use, additional security measures and testing are recommended.
