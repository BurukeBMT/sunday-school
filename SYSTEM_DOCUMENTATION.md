# ፍሬ ሃይማኖት ሰ/ት/ቤት አቴንዳንስ ስርዓት
# Sunday School Attendance System

## 📖 Full Documentation

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Database Schema](#database-schema)
6. [Installation & Setup](#installation--setup)
7. [Usage Guide](#usage-guide)
8. [API Reference](#api-reference)
9. [Troubleshooting](#troubleshooting)
10. [Development](#development)

---

## 🎯 System Overview

The Sunday School Attendance System is a modern, mobile-first Progressive Web App (PWA) designed for managing attendance in Ethiopian Orthodox Sunday Schools. The system provides secure, efficient attendance tracking through QR code scanning and manual entry, with role-based access control and Ethiopian calendar integration.

### Key Characteristics:
- **Mobile-First Design**: Optimized for smartphones and tablets
- **Progressive Web App**: Installable on mobile devices
- **Offline-Capable**: Core functionality works without internet
- **Multi-language Support**: Amharic and English interfaces
- **Ethiopian Calendar Integration**: Native date display and conversion
- **Real-time Synchronization**: Live data updates across devices

---

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **React 19** - Modern React with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Framer Motion** - Animation library
- **React Router** - Client-side routing

#### Backend & Services
- **Firebase Authentication** - User authentication and authorization
- **Firebase Realtime Database** - Real-time data storage
- **Firebase Hosting** - Web hosting and CDN
- **Firebase Security Rules** - Database access control

#### Libraries & Tools
- **html5-qrcode** - QR code scanning
- **qrcode** - QR code generation
- **jspdf** - PDF generation for ID cards
- **date-fns** - Date manipulation
- **recharts** - Data visualization
- **lucide-react** - Icon library

### System Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Web Browser   │    │   Admin Panel   │
│   (PWA)         │    │   (Responsive)  │    │   (Dashboard)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Firebase      │
                    │   Services      │
                    │                 │
                    │ ┌─────────────┐ │
                    │ │  Auth       │ │
                    │ └─────────────┘ │
                    │ ┌─────────────┐ │
                    │ │  Realtime   │ │
                    │ │  Database   │ │
                    │ └─────────────┘ │
                    │ ┌─────────────┐ │
                    │ │  Hosting    │ │
                    │ └─────────────┘ │
                    └─────────────────┘
```

---

## ✨ Features

### Core Features

#### 🔐 Authentication & Authorization
- Role-based access control (Superadmin, Admin)
- Secure Firebase Authentication
- Password reset functionality
- Session management

#### 👥 Student Management
- Student registration with unique IDs (FHST00001 format)
- QR code generation for each student
- Bulk student import via CSV
- Student ID card generation and download
- Department-based organization

#### 📚 Course Management
- Create courses with multiple departments
- Assign admins to specific courses
- Schedule courses with dates and times
- Set attendance time windows (start/end times)
- Course-based access control

#### 📊 Attendance Tracking
- QR code scanning for attendance
- Manual attendance marking
- Real-time attendance logs
- Duplicate prevention
- Department-based filtering
- Attendance statistics and reports

#### 📱 Progressive Web App (PWA)
- Installable on mobile devices
- Offline functionality
- Push notification ready
- Native app-like experience
- Fast loading with caching

#### 🌍 Ethiopian Integration
- Ethiopian calendar display
- Amharic language support
- Cultural date formatting
- Localized user interface

### Advanced Features

#### 📈 Analytics & Reporting
- Attendance statistics
- Course performance metrics
- Student participation reports
- Department-wise analytics
- Export capabilities

#### 🔧 Admin Tools
- User management (create/edit admins)
- Course assignment
- System configuration
- Data export/import
- Audit logs

#### 📷 QR Code System
- Secure QR token generation
- Real-time scanning validation
- Department-based access control
- Continuous scanning mode
- Camera permission handling

---

## 👤 User Roles & Permissions

### Superadmin
**Highest level of access with full system control**

#### Permissions:
- ✅ Create, edit, delete courses
- ✅ Assign multiple departments to courses
- ✅ Set attendance time windows
- ✅ Create and manage admin accounts
- ✅ Access all student data
- ✅ View all attendance logs
- ✅ System configuration
- ✅ Data export/import

#### Accessible Pages:
- Dashboard (full statistics)
- Course Management
- Admin Management
- Student List (all students)
- Scanner (all courses)
- Manual Attendance (all courses)
- Attendance Logs (all records)

### Admin
**Limited access based on assigned courses**

#### Permissions:
- ✅ Mark attendance for assigned courses only
- ✅ View students in assigned course departments
- ✅ Scan QR codes for assigned courses
- ✅ View attendance logs for assigned courses
- ❌ Cannot create/edit courses
- ❌ Cannot manage other admins
- ❌ Cannot access unassigned courses

#### Accessible Pages:
- Dashboard (limited to assigned courses)
- Scanner (assigned courses only)
- Manual Attendance (assigned courses only)
- Attendance Logs (assigned courses only)

---

## 🗄️ Database Schema

### Firebase Realtime Database Structure

```
firebase-database/
├── users/
│   └── {uid}/
│       ├── uid: string
│       ├── email: string
│       ├── role: "superadmin" | "admin"
│       ├── name?: string
│       └── mustResetPassword?: boolean
│
├── students/
│   └── {studentId}/
│       ├── id: string (FHST00001)
│       ├── fullName: string
│       ├── phone: string
│       ├── email?: string
│       ├── department: string
│       ├── qrToken: string
│       └── createdAt: string
│
├── courses/
│   └── {courseId}/
│       ├── id: string
│       ├── name: string
│       ├── departments: string[]
│       ├── schedule?: string (YYYY-MM-DD HH:mm)
│       ├── adminIds: string[]
│       ├── attendanceStartTime?: string (HH:mm)
│       └── attendanceEndTime?: string (HH:mm)
│
└── attendance_logs/
    └── {logId}/
        ├── id: string
        ├── studentId: string
        ├── studentName?: string
        ├── courseId: string
        ├── department: string
        ├── date: string (YYYY-MM-DD)
        ├── time: string (HH:mm:ss)
        ├── markedBy: string (admin UID)
        ├── method: "qr" | "manual"
        └── createdAt: number (timestamp)
```

### Data Types

#### UserProfile
```typescript
interface UserProfile {
  uid: string;
  email: string;
  role: UserRole; // 'superadmin' | 'admin'
  name?: string;
  mustResetPassword?: boolean;
}
```

#### Student
```typescript
interface Student {
  id: string; // FHST00001 format
  fullName: string;
  phone: string;
  email?: string;
  department: string;
  qrToken: string; // Unique QR token
  createdAt: string;
}
```

#### Course
```typescript
interface Course {
  id: string;
  name: string;
  departments: string[]; // Multiple departments
  schedule?: string; // YYYY-MM-DD HH:mm
  adminIds: string[];
  attendanceStartTime?: string; // HH:mm
  attendanceEndTime?: string; // HH:mm
}
```

#### AttendanceLog
```typescript
interface AttendanceLog {
  id: string;
  studentId: string;
  studentName?: string;
  courseId: string;
  department: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  markedBy: string; // Admin UID
  method: 'qr' | 'manual';
  createdAt?: number;
}
```

### Departments
```typescript
const DEPARTMENTS = [
  'ደቂቀ ሕጻናት',  // Young Children
  'ሕጻናት',       // Children
  'አዳጊ',          // Youth
  'ወጣት',          // Young Adults
  'ሰራተኛ ጉባኤ'     // Workers Assembly
];
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Firebase Project** with Realtime Database enabled
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Firebase Setup

1. **Create Firebase Project**
   ```bash
   # Visit https://console.firebase.google.com/
   # Create a new project
   ```

2. **Enable Services**
   - Authentication (Email/Password)
   - Realtime Database
   - Hosting

3. **Configure Security Rules**
   - Copy `database.rules.json` to Firebase Console > Database > Rules

4. **Generate Config**
   - Go to Project Settings > General > Your apps
   - Add Web App
   - Copy config to `firebase-applet-config.json`

### Local Development Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd sunday-school
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   ```bash
   # Copy and configure firebase config
   cp firebase-applet-config.json.example firebase-applet-config.json
   # Edit with your Firebase config
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   ```
   http://localhost:3000
   ```

### Production Deployment

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy --only hosting
   ```

### PWA Installation

#### Mobile Devices
- **Android**: Open in Chrome → Menu → "Add to Home screen"
- **iOS**: Open in Safari → Share → "Add to Home Screen"

#### Desktop
- **Chrome/Edge**: Click install icon in address bar

---

## 📖 Usage Guide

### Initial Setup (Superadmin)

1. **Create Superadmin Account**
   - First user automatically becomes superadmin
   - Access Admin Management to create additional admins

2. **Configure Departments**
   - System comes pre-configured with standard departments
   - Can be modified in `src/types.ts`

3. **Create Courses**
   - Go to Course Management
   - Select course name and departments
   - Set schedule and attendance times
   - Assign admins

4. **Add Students**
   - Use Student Registration page
   - Generate QR codes automatically
   - Download ID cards

### Daily Operations

#### For Admins

1. **QR Code Scanning**
   - Select course from dropdown
   - Click "Start Scanner"
   - Scan student QR codes
   - System validates department membership

2. **Manual Attendance**
   - Select course
   - Search for students by name/ID
   - Click checkmark to mark attendance
   - System prevents duplicates

#### For Superadmins

1. **Monitor System**
   - View dashboard statistics
   - Check attendance logs
   - Manage courses and admins

2. **Generate Reports**
   - Export attendance data
   - View course performance
   - Analyze department participation

### Student ID Cards

1. **Generate Cards**
   - Go to Student List
   - Select students
   - Click "Generate ID Cards"
   - Download PDF

2. **QR Code Format**
   ```json
   {
     "id": "FHST00001",
     "token": "unique-qr-token"
   }
   ```

---

## 🔧 API Reference

### Firebase Database Operations

#### Authentication
```typescript
import { auth } from './firebase';

// Sign in
await signInWithEmailAndPassword(auth, email, password);

// Sign out
await signOut(auth);

// Get current user
const user = auth.currentUser;
```

#### Database Operations
```typescript
import { database } from './firebase';
import { ref, get, push, set, update, remove } from 'firebase/database';

// Read data
const dataRef = ref(database, 'path/to/data');
const snapshot = await get(dataRef);
const data = snapshot.val();

// Write data
await set(ref(database, 'path/to/data'), data);

// Push new data (auto-generated ID)
const newRef = push(ref(database, 'collection'));
await set(newRef, data);

// Update existing data
await update(ref(database, 'path/to/data'), updates);

// Delete data
await remove(ref(database, 'path/to/data'));
```

### Utility Functions

#### Ethiopian Calendar
```typescript
import { formatEthiopianDate } from './lib/ethiopianCalendar';

const ethiopianDate = formatEthiopianDate(new Date());
```

#### QR Code Generation
```typescript
import { generateQRToken } from './lib/qrUtils';

const qrData = {
  id: 'FHST00001',
  token: generateQRToken()
};
```

#### PDF Generation
```typescript
import { generateStudentIdCard } from './lib/printIdCard';

await generateStudentIdCard(student, qrCodeDataUrl);
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. QR Scanner Not Working
**Symptoms**: Camera doesn't start, scanner fails to initialize

**Solutions**:
- Ensure HTTPS connection (required for camera access)
- Check camera permissions in browser
- Try refreshing the page
- Use a different browser (Chrome recommended)
- Check console for error messages

#### 2. Authentication Issues
**Symptoms**: Can't log in, password reset not working

**Solutions**:
- Verify Firebase Authentication is enabled
- Check email/password format
- Ensure user account exists and is active
- Check browser console for auth errors

#### 3. Database Connection Issues
**Symptoms**: Data not loading, writes failing

**Solutions**:
- Verify Firebase config is correct
- Check database security rules
- Ensure user has proper permissions
- Check network connectivity

#### 4. PWA Installation Issues
**Symptoms**: Can't install app on mobile device

**Solutions**:
- Ensure HTTPS connection
- Check browser compatibility
- Clear browser cache
- Try different browser

#### 5. Offline Functionality Issues
**Symptoms**: App doesn't work offline

**Solutions**:
- Ensure service worker is registered
- Check browser cache settings
- Verify PWA manifest is correct
- Clear app cache and reinstall

### Error Messages

#### "Camera permission denied"
- Grant camera access in browser settings
- Use HTTPS connection
- Try different browser

#### "Invalid QR code format"
- Ensure QR code contains valid JSON with `id` and `token` fields
- Regenerate student QR codes if corrupted

#### "Student not in assigned department"
- Check course department assignments
- Verify student department is correct
- Contact superadmin to update course settings

#### "Attendance already recorded"
- Student has already been marked present for this course today
- Check attendance logs for duplicate entries

### Performance Issues

#### Slow Loading
- Clear browser cache
- Check network connection
- Optimize images and assets
- Enable browser caching

#### High Memory Usage
- Close unused browser tabs
- Clear browser cache regularly
- Update to latest browser version
- Restart browser periodically

---

## 💻 Development

### Project Structure

```
src/
├── components/           # React components
│   ├── AdminManagement.tsx
│   ├── AttendanceLogs.tsx
│   ├── CourseManagement.tsx
│   ├── Dashboard.tsx
│   ├── ManualAttendance.tsx
│   ├── Scanner.tsx
│   ├── Sidebar.tsx
│   └── ...
├── contexts/            # React contexts
│   ├── AuthContext.tsx
│   └── LanguageContext.tsx
├── lib/                 # Utility libraries
│   ├── authGuard.ts
│   ├── ethiopianCalendar.ts
│   ├── printIdCard.ts
│   ├── qrUtils.ts
│   └── utils.ts
├── types.ts            # TypeScript interfaces
├── firebase.ts         # Firebase configuration
├── App.tsx            # Main app component
└── main.tsx           # App entry point
```

### Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run lint

# Clean build files
npm run clean
```

### Code Style Guidelines

#### TypeScript
- Use strict type checking
- Define interfaces for all data structures
- Use union types for enums
- Avoid `any` type when possible

#### React
- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization
- Follow component composition patterns

#### CSS/Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use CSS custom properties for theming
- Implement consistent spacing and typography

### Testing

#### Manual Testing Checklist
- [ ] Authentication flows (login/logout)
- [ ] Role-based access control
- [ ] QR code scanning functionality
- [ ] Manual attendance marking
- [ ] Course management operations
- [ ] Student registration and management
- [ ] PWA installation and offline functionality
- [ ] Mobile responsiveness
- [ ] Ethiopian calendar integration

#### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following code style guidelines
4. Test thoroughly
5. Submit pull request

### Deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] Test production build locally
- [ ] Update Firebase security rules if needed
- [ ] Deploy to Firebase hosting
- [ ] Test live application
- [ ] Verify PWA functionality
- [ ] Check mobile installation

---

## 📞 Support

### Getting Help

1. **Documentation**: Check this documentation first
2. **GitHub Issues**: Report bugs and request features
3. **Community**: Join discussions and share experiences

### System Requirements

#### Minimum Requirements
- **Browser**: Modern web browser with ES2020 support
- **Network**: Stable internet connection for initial load
- **Device**: Smartphone, tablet, or desktop computer

#### Recommended Specifications
- **Browser**: Chrome 100+ or Firefox 100+
- **Network**: 3G or faster connection
- **Device**: Modern smartphone with camera
- **Storage**: 50MB free space for PWA installation

### Version History

#### v1.0.0 (Current)
- Initial release with core functionality
- QR code scanning and manual attendance
- Role-based access control
- PWA support
- Ethiopian calendar integration

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Ethiopian Orthodox Church communities
- Firebase team for excellent services
- Open source community for amazing tools
- All contributors and testers

---

*Last updated: April 15, 2026*
*Documentation Version: 1.0*