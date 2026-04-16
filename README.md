# ፍሬ ሃይማኖት ሰ/ት/ቤት አቴንዳንስ - Sunday School Attendance System

A modern, mobile-first Progressive Web App (PWA) for managing Sunday School attendance with Ethiopian calendar integration, real-time analytics, and comprehensive academic assessment features. Now includes a professional ERP-style admin dashboard for advanced school management.

## 🚀 Features

### Core Features
- **Progressive Web App (PWA)**: Installable on mobile devices with offline support
- **Role-based Authentication**: Superadmin, Admin, Teacher, and Student roles with secure access control
- **Real-time Attendance Analytics**: Live dashboard with attendance statistics, course performance, and grade analytics
- **Ethiopian Calendar Integration**: Native Ethiopian date display and conversion
- **Mobile-Optimized UI**: Beautiful responsive design for mobile devices
- **QR Code Attendance System**: Secure attendance marking with duplicate prevention
- **Academic Assessment System**: Google Sheets integration for grading, results, and transcripts
- **🏢 Professional ERP Dashboard**: Complete admin interface with advanced analytics, student/teacher/parent management, and comprehensive reporting

### Advanced Features
- **Multi-Role Access Control**: Granular permissions based on user roles
- **Course Management**: Create courses with multiple departments and time windows
- **Student Management**: Unique ID generation (FHST00001 format) with QR code ID cards
- **Real-time Analytics Dashboard**: Live attendance monitoring with charts and statistics
- **Academic Results System**: Grading rules, results publishing, and PDF transcript generation
- **Teacher Dashboard**: Marks entry, grading rules configuration, and course management
- **Bulk Operations**: CSV import for student registration and data management
- **ERP Admin Interface**: Professional dashboard with modular components, advanced filtering, and comprehensive data management

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
- **🏢 Complete ERP Dashboard Access**: Professional admin interface with all modules
- **📊 Advanced Analytics**: Correlation analysis and predictive insights
- **📋 Activity Monitoring**: Complete audit trail and security monitoring

### 🟡 Admin/Teacher
- Access to assigned courses only
- Mark attendance via QR scanning or manual entry
- Enter academic marks and configure grading rules
- View attendance logs for assigned courses
- Limited analytics access
- **🏢 Restricted ERP Access**: Read-only access to relevant modules

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

## 🏢 ERP Admin Dashboard

Access the professional ERP dashboard at `/erp` (Superadmin, Admin roles):

### Unified Dashboard
- **Key Performance Indicators**: Comprehensive stats cards with trend indicators
- **Interactive Charts**: Real-time data visualization with multiple chart types
- **Quick Actions**: Fast access to common administrative tasks
- **System Overview**: Complete school management at a glance

### Student Management Module
- **Advanced Data Table**: Search, filter, sort, and paginate student records
- **Student Profiles**: Detailed drawer views with performance metrics
- **Grade Distribution**: Visual breakdown of student performance
- **Enrollment Analytics**: Student growth and participation trends

### Teacher Management Module
- **Teacher Assignments**: Course and grade assignments overview
- **Performance Metrics**: Student performance by teacher
- **Workload Analysis**: Course load distribution and balance
- **Activity Monitoring**: Teaching activity and engagement tracking

### Parent Management Module
- **Family Overview**: Parent accounts with linked children
- **Engagement Tracking**: Parent interaction and involvement metrics
- **Communication Tools**: Parent-teacher communication features
- **Family Analytics**: Multi-child family performance insights

### Attendance Analytics Module (Read-Only)
- **Real-Time Monitoring**: Live attendance statistics and trends
- **Grade-wise Analysis**: Attendance patterns by grade level
- **Course Performance**: Attendance rates across different courses
- **Historical Trends**: Long-term attendance pattern analysis

### Grading Analytics Module (Read-Only)
- **Grade Distribution**: Visual breakdown of academic performance
- **Course Performance**: Subject-wise performance analysis
- **Trend Analysis**: Academic progress over time
- **Ranking Systems**: Performance rankings and comparisons

### Advanced Analytics Module
- **Correlation Analysis**: Attendance vs academic performance correlations
- **Predictive Insights**: Performance trend predictions
- **Custom Reports**: Advanced filtering and reporting capabilities
- **Data Export**: Comprehensive data export functionality

### Activity Logs & Audit Trail
- **Complete Audit System**: All user actions and system events
- **Security Monitoring**: Login attempts, permission changes, data access
- **Compliance Tracking**: Regulatory compliance and data governance
- **System Health**: Performance monitoring and error tracking

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
├── results_control/ # Academic results publishing controls
└── activity_logs/   # ERP audit trail and system events

ERP Dashboard Structure:
├── src/erp/
│   ├── components/     # Reusable ERP components (StatCard, DataTable, ChartCard)
│   ├── layout/         # ERP layout system (Sidebar, Topbar, ERPLayout)
│   └── pages/          # ERP pages (Dashboard, Students, Teachers, etc.)
└── routes/             # Updated routing with ERP nested routes
```

### Component Architecture
```
src/
├── components/      # React components (40+ components)
├── contexts/        # AuthContext, LanguageContext
├── lib/            # Utilities: analytics, sheetsApi, qrUtils, etc.
├── routes/         # AppRoutes, ProtectedRoute, RoleRoutes
├── pages/          # Page components
├── erp/            # ERP Dashboard System
│   ├── components/ # Reusable ERP components
│   │   ├── StatCard.tsx     # Statistics display with trends
│   │   ├── DataTable.tsx    # Advanced table with search/filter
│   │   └── ChartCard.tsx    # Chart containers
│   ├── layout/     # ERP layout system
│   │   ├── Sidebar.tsx      # Role-based navigation
│   │   ├── Topbar.tsx       # Header with search/notifications
│   │   └── ERPLayout.tsx    # Main layout wrapper
│   └── pages/      # ERP dashboard pages
│       ├── UnifiedDashboard.tsx  # Main dashboard
│       ├── Students.tsx          # Student management
│       ├── Teachers.tsx          # Teacher management
│       ├── Parents.tsx           # Parent management
│       ├── Attendance.tsx        # Attendance analytics
│       ├── Grading.tsx           # Grading analytics
│       ├── Analytics.tsx         # Advanced analytics
│       └── ActivityLogs.tsx      # Audit trail
└── types.ts        # TypeScript definitions
```

## 🔧 Key Components

### Core Components
- `AttendanceAnalyticsDashboard.tsx` - Real-time analytics with live updates
- `Scanner.tsx` - QR code attendance scanning
- `TeacherDashboard.tsx` - Academic marks entry and grading
- `StudentResults.tsx` - Academic results viewer with PDF download
- `CourseManagement.tsx` - Course creation and department assignment

### ERP Dashboard Components
- `ERPLayout.tsx` - Main ERP layout with sidebar and topbar
- `UnifiedDashboard.tsx` - Professional dashboard with KPIs and charts
- `DataTable.tsx` - Advanced data table with search, filter, and pagination
- `StatCard.tsx` - Statistics cards with trend indicators
- `ChartCard.tsx` - Reusable chart containers
- `Students.tsx` - Complete student management module
- `Teachers.tsx` - Teacher performance and assignment management
- `Parents.tsx` - Parent account and family management
- `Attendance.tsx` - Read-only attendance analytics
- `Grading.tsx` - Read-only grading analytics
- `Analytics.tsx` - Advanced correlation analysis
- `ActivityLogs.tsx` - Complete audit trail system

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
