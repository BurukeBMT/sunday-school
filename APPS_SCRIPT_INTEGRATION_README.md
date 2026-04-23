# Google Apps Script + Firebase + React Real-Time Attendance Integration

This guide shows how to set up a complete real-time attendance system where QR scans instantly update your React dashboard.

## 🏗️ System Architecture

```
QR Scan → Google Apps Script → Firebase Realtime DB → React Dashboard
     ↓              ↓              ↓              ↓
  Student      Validates &     Stores data    Updates in
  scans QR     sends to FB     instantly      real-time
```

## 📋 Prerequisites

- Google Apps Script project
- Firebase project with Realtime Database enabled
- React app with Firebase SDK
- Google Sheets for student data

## 🔧 Setup Instructions

### 1. Firebase Configuration

1. **Enable Realtime Database** in your Firebase project
2. **Update security rules** in `database.rules.json`:

```json
{
  "rules": {
    "attendance_logs": {
      ".read": "auth != null",
      ".write": false,
      ".indexOn": ["date", "courseId", "studentId"]
    }
  }
}
```

3. **Get your Firebase URL**: `https://your-project-id.firebaseio.com`

### 2. Google Apps Script Setup

1. **Create new Apps Script project**
2. **Copy the code** from `apps-script-integration.js`
3. **Update configuration**:

```javascript
const CONFIG = {
  FIREBASE_URL: 'https://your-project-id.firebaseio.com', // ← Update this
  SHEET_ID: 'your-google-sheet-id', // ← Update this
  STUDENT_SHEET: 'Students',
  ATTENDANCE_SHEET: 'Attendance'
};
```

4. **Enable Firebase API access**:
   - Go to Apps Script → Resources → Advanced Google services
   - Enable "URL Fetch API"

5. **Deploy as web app**:
   - Publish → Deploy as web app
   - Execute as: Me
   - Access: Anyone (no auth required for QR scanning)

6. **Get the web app URL** - this is your `SCRIPT_URL`

### 3. Google Sheets Setup

Create two sheets:

**Students sheet:**
| Student ID | Name | Department | Grade | QR Token |
|------------|------|------------|-------|----------|
| FHST00001 | Abel | ደቂቀ ሕጻናት | ክፍል 1 | abc123... |

**Attendance sheet:**
| Student ID | Name | Course | Date | Time | Timestamp | Method |
|------------|------|--------|------|------|-----------|--------|

### 4. React App Integration

The React components are already created and integrated:

- `AttendanceDashboard.tsx` - Overview stats
- `LiveAttendanceTable.tsx` - Real-time attendance table
- `CourseStats.tsx` - Course-wise statistics
- `RealTimeAttendanceDashboard.tsx` - Complete dashboard

They use custom hooks in `useAttendance.ts` for Firebase integration.

### 5. Update Scanner

Update your scanner's `SCRIPT_URL`:

```javascript
const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

## 🔄 Data Flow

1. **Student scans QR** → `{"id":"FHST00001","course":"Bible Study"}`
2. **Apps Script receives** → Validates student in Google Sheets
3. **Checks duplicates** → Prevents double attendance
4. **Sends to Firebase** → POST to `/attendance_logs.json`
5. **React dashboard updates** → Real-time listener triggers UI refresh

## 🛠️ API Endpoints

### Apps Script Web App
```
GET https://script.google.com/macros/s/SCRIPT_ID/exec?id=FHST00001&course=Bible%20Study
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance recorded for Abel in Bible Study.",
  "status": "success",
  "student": { "id": "FHST00001", "name": "Abel", ... }
}
```

### Firebase REST API
```
POST https://your-project.firebaseio.com/attendance_logs.json
```

**Payload:**
```json
{
  "studentId": "FHST00001",
  "studentName": "Abel",
  "course": "Bible Study",
  "date": "2026-04-23",
  "time": "10:30:00",
  "method": "qr",
  "createdAt": 1713871800000
}
```

## 🧪 Testing

1. **Test Apps Script**:
   - Run `testAttendance()` in Apps Script editor
   - Check Firebase database for new records

2. **Test React Dashboard**:
   - Open `/erp` route
   - Should show live attendance data
   - Add test records to Firebase to see updates

3. **Test Full Flow**:
   - Use the standalone scanner at `public/scanner.html`
   - Scan QR codes
   - Watch dashboard update instantly

## 🔐 Security Notes

- Apps Script uses REST API (no Firebase auth required)
- React app requires Firebase authentication
- Attendance logs are read-only for authenticated users
- Apps Script handles validation and duplicate prevention

## 🚨 Error Handling

- **Firebase fails** → Falls back to Google Sheets logging
- **Network issues** → Scanner shows "Network error. Please try again."
- **Invalid QR** → Shows validation error
- **Duplicate scan** → Shows "Attendance already recorded"

## 📊 Real-Time Features

- **Live updates** - No page refresh needed
- **Instant feedback** - See scans as they happen
- **Course filtering** - View attendance by subject
- **Date selection** - Historical data viewing
- **Statistics** - Real-time calculations

## 🎯 Performance

- **Firebase indexing** on date, courseId, studentId
- **Limited queries** - Only recent records loaded
- **Efficient listeners** - Targeted data subscriptions
- **Fallback logging** - Never lose attendance data

This creates a robust, real-time attendance system that scales to thousands of students while maintaining data integrity and providing instant feedback to administrators.