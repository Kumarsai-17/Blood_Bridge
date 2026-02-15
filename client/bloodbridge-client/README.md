# 🩸 BloodBridge - Frontend

React-based frontend application for the BloodBridge blood donation management system.

## 🛠️ Tech Stack

- **React 18** - UI library with hooks
- **Vite** - Fast build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Chart.js** - Data visualization
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications

## 📦 Installation

```bash
npm install
```

## 🚀 Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 🧹 Linting

Run ESLint:

```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context (AuthContext)
├── layouts/            # Layout components for different roles
│   ├── AdminLayout.jsx
│   ├── AuthLayout.jsx
│   ├── BloodBankLayout.jsx
│   ├── DonorLayout.jsx
│   ├── HospitalLayout.jsx
│   └── PublicLayout.jsx
├── pages/              # Page components
│   ├── admin/          # Admin dashboard and management
│   ├── bloodbank/      # Blood bank inventory and reports
│   ├── common/         # Shared pages (Profile, Settings)
│   ├── donor/          # Donor requests and history
│   ├── hospital/       # Hospital requests and tracking
│   ├── public/         # Public pages (Home, Login)
│   └── registration/   # Registration forms
├── router/             # Route configuration
│   └── AppRouter.jsx
├── services/           # API service layer
│   └── api.js
├── utils/              # Utility functions
│   ├── bloodCompatibility.js
│   └── calculateDistance.js
├── App.jsx             # Root component
└── main.jsx            # Entry point
```

## 🎨 Key Features

### Multi-Role Dashboards
- **Donor Dashboard**: View requests, track donations
- **Hospital Dashboard**: Create requests, view responses
- **Blood Bank Dashboard**: Manage inventory, fulfill requests
- **Admin Dashboard**: User management, system reports

### Interactive Components
- Real-time blood request notifications
- Interactive maps for donor locations
- Visual charts and analytics
- Document viewer for admin approvals
- Responsive modals and forms

### Authentication & Authorization
- JWT-based authentication
- Role-based route protection
- Automatic token refresh
- Secure password management

### User Experience
- Toast notifications for feedback
- Loading states and skeletons
- Error handling and validation
- Mobile-responsive design
- Smooth transitions and animations

## 🔧 Configuration

### API Base URL

Update the API base URL in `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:5001/api'
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5001/api
```

## 🎯 Available Routes

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/register/donor` - Donor registration
- `/register/hospital` - Hospital registration
- `/register/bloodbank` - Blood bank registration
- `/forgot-password` - Password recovery
- `/reset-password` - Password reset

### Donor Routes
- `/donor/dashboard` - Donor dashboard
- `/donor/requests` - Available blood requests
- `/donor/accepted-requests` - Accepted requests
- `/donor/history` - Donation history
- `/donor/profile` - Donor profile
- `/donor/map` - Map view of requests

### Hospital Routes
- `/hospital/dashboard` - Hospital dashboard
- `/hospital/create-request` - Create blood request
- `/hospital/requests` - View all requests
- `/hospital/history` - Donation history
- `/hospital/profile` - Hospital profile

### Blood Bank Routes
- `/bloodbank/dashboard` - Blood bank dashboard
- `/bloodbank/inventory` - Inventory management
- `/bloodbank/requests` - Pending requests
- `/bloodbank/reports` - Analytics and reports
- `/bloodbank/profile` - Blood bank profile

### Admin Routes
- `/admin/dashboard` - Admin dashboard
- `/admin/pending-approvals` - Approve registrations
- `/admin/users` - User management
- `/admin/create-admin` - Create admin accounts
- `/admin/reports` - System reports
- `/admin/settings` - System settings
- `/admin/disaster-toggle` - Disaster mode

## 🎨 Styling

The project uses Tailwind CSS for styling. Configuration is in `tailwind.config.js`.

### Custom Colors
- Primary: Blue shades for main actions
- Success: Green for positive actions
- Warning: Yellow for alerts
- Danger: Red for critical actions

### Responsive Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## 📊 Charts and Visualizations

Using Chart.js for data visualization:
- Pie charts for distribution
- Bar charts for comparisons
- Line charts for trends
- Doughnut charts for inventory

## 🔐 Security Features

- Protected routes with authentication
- Role-based access control
- Automatic logout on token expiry
- Secure password input with visibility toggle
- XSS protection with input sanitization

## 🐛 Common Issues

### Port Already in Use
Change the port in `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 5174
  }
})
```

### API Connection Issues
- Ensure backend server is running on port 5001
- Check CORS configuration
- Verify API base URL in `api.js`

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 Code Style

- Use functional components with hooks
- Follow React best practices
- Use meaningful variable names
- Add comments for complex logic
- Keep components small and focused

## 🤝 Contributing

1. Follow the existing code structure
2. Use Tailwind CSS for styling
3. Ensure responsive design
4. Test on multiple browsers
5. Add proper error handling

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Built with React + Vite + Tailwind CSS**
