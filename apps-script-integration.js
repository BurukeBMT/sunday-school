// Google Apps Script - QR Attendance Scanner with Firebase Integration
// Copy this code to your Google Apps Script project
// Make sure to enable Firebase REST API access

// Configuration
const CONFIG = {
    FIREBASE_URL: 'https://your-project-id.firebaseio.com', // Replace with your Firebase project URL
    SHEET_ID: 'your-google-sheet-id', // Replace with your Google Sheet ID
    STUDENT_SHEET: 'Students',
    ATTENDANCE_SHEET: 'Attendance'
};

// Firebase REST API helper
function firebaseRequest(endpoint, method = 'GET', data = null) {
    const url = `${CONFIG.FIREBASE_URL}${endpoint}.json`;

    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        muteHttpExceptions: true
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.payload = JSON.stringify(data);
    }

    try {
        const response = UrlFetchApp.fetch(url, options);
        const responseCode = response.getResponseCode();

        if (responseCode >= 200 && responseCode < 300) {
            const responseText = response.getContentText();
            return responseText ? JSON.parse(responseText) : null;
        } else {
            console.error(`Firebase API error: ${responseCode} - ${response.getContentText()}`);
            return null;
        }
    } catch (error) {
        console.error('Firebase request failed:', error);
        return null;
    }
}

// Get student data from Google Sheets
function getStudentData(studentId) {
    try {
        const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.STUDENT_SHEET);
        const data = sheet.getDataRange().getValues();

        // Skip header row
        for (let i = 1; i < data.length; i++) {
            if (data[i][0] == studentId) { // Assuming ID is in column A
                return {
                    id: data[i][0],
                    name: data[i][1], // Assuming name is in column B
                    department: data[i][2], // Assuming department is in column C
                    grade: data[i][3], // Assuming grade is in column D
                    qrToken: data[i][4] // Assuming QR token is in column E
                };
            }
        }
        return null;
    } catch (error) {
        console.error('Error getting student data:', error);
        return null;
    }
}

// Check for duplicate attendance
function checkDuplicateAttendance(studentId, course, date) {
    try {
        // First check Firebase
        const attendanceData = firebaseRequest('/attendance_logs');
        if (attendanceData) {
            for (const [key, record] of Object.entries(attendanceData)) {
                if (record.studentId === studentId &&
                    record.course === course &&
                    record.date === date) {
                    return true; // Duplicate found
                }
            }
        }

        // Fallback: Check Google Sheets
        const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.ATTENDANCE_SHEET);
        const data = sheet.getDataRange().getValues();

        for (let i = 1; i < data.length; i++) {
            if (data[i][0] == studentId && // Student ID
                data[i][2] == course &&   // Course
                data[i][3] == date) {     // Date
                return true; // Duplicate found
            }
        }

        return false;
    } catch (error) {
        console.error('Error checking duplicate attendance:', error);
        return false; // Allow attendance if check fails
    }
}

// Log attendance to Google Sheets (fallback)
function logToSheets(studentId, studentName, course, date, time) {
    try {
        const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.ATTENDANCE_SHEET);
        const timestamp = new Date();

        // Check if headers exist, add if not
        if (sheet.getLastRow() === 0) {
            sheet.appendRow(['Student ID', 'Student Name', 'Course', 'Date', 'Time', 'Timestamp', 'Method']);
        }

        sheet.appendRow([studentId, studentName, course, date, time, timestamp, 'qr']);
        return true;
    } catch (error) {
        console.error('Error logging to sheets:', error);
        return false;
    }
}

// Main attendance processing function
function processAttendance(studentId, course) {
    const now = new Date();
    const date = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const time = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss');
    const timestamp = now.getTime();

    try {
        // 1. Get student data
        const student = getStudentData(studentId);
        if (!student) {
            return {
                success: false,
                message: 'Student not found. Please check the student ID.',
                status: 'error'
            };
        }

        // 2. Check for duplicate attendance
        const isDuplicate = checkDuplicateAttendance(studentId, course, date);
        if (isDuplicate) {
            return {
                success: false,
                message: 'Attendance already recorded for this student today.',
                status: 'already'
            };
        }

        // 3. Prepare attendance data for Firebase
        const attendanceData = {
            studentId: studentId,
            studentName: student.name,
            course: course,
            date: date,
            time: time,
            method: 'qr',
            createdAt: timestamp
        };

        // 4. Send to Firebase
        const firebaseResult = firebaseRequest('/attendance_logs', 'POST', attendanceData);

        if (firebaseResult) {
            // Success - Firebase accepted the data
            // Also log to Google Sheets as backup
            logToSheets(studentId, student.name, course, date, time);

            return {
                success: true,
                message: `Attendance recorded for ${student.name} in ${course}.`,
                status: 'success',
                student: student
            };
        } else {
            // Firebase failed - log to Google Sheets only
            console.warn('Firebase failed, falling back to Google Sheets');
            const sheetsSuccess = logToSheets(studentId, student.name, course, date, time);

            if (sheetsSuccess) {
                return {
                    success: true,
                    message: `Attendance recorded for ${student.name} in ${course} (Sheets backup).`,
                    status: 'success',
                    student: student
                };
            } else {
                return {
                    success: false,
                    message: 'Failed to record attendance. Please try again.',
                    status: 'error'
                };
            }
        }

    } catch (error) {
        console.error('Attendance processing error:', error);
        return {
            success: false,
            message: 'An error occurred while processing attendance. Please try again.',
            status: 'error'
        };
    }
}

// Web App endpoint - handles QR code scans
function doGet(e) {
    const studentId = e.parameter.id;
    const course = e.parameter.course || 'General';

    if (!studentId) {
        return ContentService
            .createTextOutput(JSON.stringify({
                success: false,
                message: 'Student ID is required.',
                status: 'error'
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    const result = processAttendance(studentId, course);

    return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
}

// Test function (run this in Apps Script editor to test)
function testAttendance() {
    const testResult = processAttendance('FHST00001', 'Bible Study');
    console.log('Test result:', testResult);
}