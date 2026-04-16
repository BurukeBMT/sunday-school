# ፍሬ ሃይማኖት ሰ/ት/ቤት አቴንዳንስ - Sunday School Attendance System

A modern, mobile-first Progressive Web App (PWA) for managing Sunday School attendance with Ethiopian calendar integration, real-time analytics, and comprehensive academic assessment features.

## 🚀 Features

### Core Features
- **Progressive Web App (PWA)**: Installable on mobile devices with offline support
- **Role-based Authentication**: Superadmin, Admin, Teacher, and Student roles with secure access control
- **Real-time Attendance Analytics**: Live dashboard with attendance statistics, course performance, and grade analytics
- **Ethiopian Calendar Integration**: Native Ethiopian date display and conversion
- **Mobile-Optimized UI**: Beautiful responsive design for mobile devices
- **QR Code Attendance System**: Secure attendance marking with duplicate prevention
- **Academic Assessment System**: Google Sheets integration for grading, results, and transcripts

### Advanced Features
- **Multi-Role Access Control**: Granular permissions based on user roles
- **Course Management**: Create courses with multiple departments and time windows
- **Student Management**: Unique ID generation (FHST00001 format) with QR code ID cards
- **Real-time Analytics Dashboard**: Live attendance monitoring with charts and statistics
- **Academic Results System**: Grading rules, results publishing, and PDF transcript generation
- **Teacher Dashboard**: Marks entry, grading rules configuration, and course management
- **Bulk Operations**: CSV import for student registration and data management

## 📱 Install as Mobile App

This app is a Progressive Web App (PWA) that can be installed on your mobile device:

### Android (Chrome)
1. Open the app in Chrome browser
2. Tap the menu (⋮) button
3. Select "Add to Home screen" or "Install app"
4. Follow the prompts to install

### iOS (Safari)
1. Open the app in Safari browser
2. Tap the share button (⬆️)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm

### Desktop (Chrome/Edge)
1. Click the install icon in the address bar
2. Or click the menu button and select "Install [App Name]"

## 🏃‍♂️ Run Locally

**Prerequisites:** Node.js v18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🚀 Deploy to Production

```bash
npm run build
firebase deploy --only hosting
```

## 👤 User Roles & Permissions

### 🔴 Superadmin
- Full system access and configuration
- Create/manage courses, admins, and students
- Access all attendance records and analytics
- Publish academic results and manage grading rules
- System administration and data export/import

### 🟡 Admin/Teacher
- Access to assigned courses only
- Mark attendance via QR scanning or manual entry
- Enter academic marks and configure grading rules
- View attendance logs for assigned courses
- Limited analytics access

### 🟢 Student
- View personal attendance records
- Access published academic results
- Download personal transcripts
- View personal profile and dashboard

## 📊 Real-Time Analytics Dashboard

Access live attendance insights at `/analytics` (Superadmin, Admin, Teacher roles):

### Overall Statistics
- Total students enrolled
- Present/absent counts for today
- Attendance percentage with trends

### Course-wise Analytics
- Attendance rates for each course
- Highest and lowest performing courses
- Student counts and participation metrics

### Grade-wise Analytics (ክፍል 1–12)
- Attendance percentages by grade level
- Visual progress bars and comparisons
- Student enrollment and attendance data

### Teacher Activity Monitoring
- Attendance records taken by each teacher
- Most active teacher identification
- Last activity timestamps

## 📚 Academic Assessment System

### Google Sheets Integration
- External grading data management
- Configurable assessment weights (assignments, quizzes, exams)
- Automated result calculations and rankings

### Features
- **Grading Rules**: Configure assessment types and weights
- **Results Publishing**: Controlled release of academic results
- **Transcript Generation**: PDF downloads with complete academic records
- **Grade Rankings**: Performance comparisons and leaderboards

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4.1.14
- **Backend**: Firebase (Auth, Realtime Database, Hosting)
- **PWA**: Vite PWA Plugin with service worker
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React icon library
- **Build Tool**: Vite with React plugin
- **PDF Generation**: jsPDF for transcripts and ID cards
- **QR Codes**: qrcode library for generation and html5-qrcode for scanning
- **Date Handling**: date-fns with Ethiopian calendar support

## 📋 PWA Features

- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Core functionality works offline with cached data
- **Fast Loading**: Cached assets for quick startup
- **Native Feel**: Standalone app experience with smooth animations
- **Push Notifications Ready**: Infrastructure for future notifications
- **Responsive Design**: Optimized for all screen sizes

## 🌐 Live Demo

[https://ai-studio-applet-webapp-90c5e.web.app](https://ai-studio-applet-webapp-90c5e.web.app)

## 📖 System Architecture

### Database Structure
```
Firebase Realtime Database:
├── users/           # User accounts and roles
├── students/        # Student profiles and QR tokens
├── courses/         # Course configurations and assignments
├── teachers/        # Teacher profiles and assignments
├── attendance_logs/ # Real-time attendance records
└── results_control/ # Academic results publishing controls

Google Sheets Integration:
├── Grading Rules    # Assessment configurations
├── Student Marks    # Individual assessment scores
├── Results Data     # Calculated grades and rankings
└── Transcript Data  # Complete academic records
```

### Component Architecture
```
src/
├── components/      # React components (40+ components)
├── contexts/        # AuthContext, LanguageContext
├── lib/            # Utilities: analytics, sheetsApi, qrUtils, etc.
├── routes/         # AppRoutes, ProtectedRoute, RoleRoutes
├── pages/          # Page components
└── types.ts        # TypeScript definitions
```

## 🔧 Key Components

### Core Components
- `AttendanceAnalyticsDashboard.tsx` - Real-time analytics with live updates
- `Scanner.tsx` - QR code attendance scanning
- `TeacherDashboard.tsx` - Academic marks entry and grading
- `StudentResults.tsx` - Academic results viewer with PDF download
- `CourseManagement.tsx` - Course creation and department assignment

### Analytics Components
- `GradeAttendanceChart.tsx` - Visual grade-wise attendance
- `CourseAttendanceTable.tsx` - Course performance data
- `AttendanceStatsCard.tsx` - Statistics display cards

### Utility Components
- `ProtectedRoute.tsx` - Role-based route protection
- `Sidebar.tsx` - Navigation with role-based menu items
- `InstallPrompt.tsx` - PWA installation prompts

## 🔐 Security Features

- **Firebase Authentication**: Secure email/password authentication
- **Role-based Access Control**: Granular permissions per user role
- **Database Security Rules**: Firebase rules for data access control
- **QR Token Security**: Unique, secure QR codes per student
- **Session Management**: Automatic logout and session handling

## 📈 Performance & Scalability

- **Optimized for 10,000+ students**: Efficient database queries and caching
- **Real-time Updates**: Firebase listeners for live data synchronization
- **Lazy Loading**: Route-based code splitting for faster initial loads
- **PWA Caching**: Service worker for offline functionality
- **Mobile-First**: Optimized for mobile devices and slow connections

## 🌍 Ethiopian Localization

- **Amharic Language Support**: Full interface in Amharic
- **Ethiopian Calendar**: Native date display and conversion
- **Cultural Formatting**: Localized number and date formatting
- **Department Names**: Traditional Ethiopian Orthodox department names

## 📝 Development

### Prerequisites
- Node.js v18+
- npm or yarn
- Firebase project with enabled services

### Development Commands
```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Production build
npm run preview     # Preview production build
npm run clean       # Clean build artifacts
npm run lint        # TypeScript type checking
```

### Firebase Setup
1. Create Firebase project at https://console.firebase.google.com/
2. Enable Authentication, Realtime Database, and Hosting
3. Copy config to `firebase-applet-config.json`
4. Deploy security rules: `firebase deploy --only database`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Test on multiple devices and browsers
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built for the Ethiopian Orthodox ፍሬ ሃይማኖት Sunday School community
- Special thanks to the Sunday School administration team
- Powered by Firebase and modern web technologies

---

**© 2026 ፍሬ ሃይማኖት ሰ/ት/ቤት - Sunday School Attendance System**  
*Built with ❤️ for the Ethiopian Orthodox Community*
