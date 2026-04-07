import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'am';

export interface Translations {
    // Navigation
    dashboard: string;
    registration: string;
    students: string;
    courses: string;
    admins: string;
    scanner: string;
    logs: string;

    // Common
    fullName: string;
    phoneNumber: string;
    email: string;
    department: string;
    studentId: string;
    actions: string;
    name: string;
    idNumber: string;
    phone: string;
    loading: string;
    noStudentsFound: string;
    downloadQr: string;
    deleteStudent: string;
    searchByNameIdPhone: string;
    allDepartments: string;
    downloadBulkIds: string;
    manageStudents: string;

    // Registration
    studentRegistration: string;
    registerNewStudents: string;
    individual: string;
    bulkUpload: string;
    registrationSuccessful: string;
    registered: string;
    registerStudent: string;
    chooseCsvFile: string;
    makeSureCsvFormat: string;
    downloadTemplate: string;
    uploadMore: string;
    total: string;
    success: string;
    errors: string;

    // Scanner
    attendanceScanner: string;
    scanStudentQrs: string;
    selectCourse: string;
    noCoursesFound: string;
    createCourseFirst: string;
    attendanceRecorded: string;
    invalidQrCode: string;
    attendanceAlreadyRecorded: string;

    // Landing
    freHaymanot: string;
    sundaySchool: string;
    managementSystem: string;
    startNow: string;
    learnAboutUs: string;
    services: string;
    aboutFreHaymanot: string;
    visionMission: string;
    qrAttendance: string;
    qrAttendanceDesc: string;
    studentManagement: string;
    studentManagementDesc: string;
    departmentManagement: string;
    departmentManagementDesc: string;
    attendanceReports: string;
    attendanceReportsDesc: string;

    // Footer
    allRightsReserved: string;

    // Dashboard
    dashboardOverview: string;
    welcomeBack: string;
    totalStudents: string;
    todayAttendance: string;
    activeCourses: string;
    absenceAlerts: string;
    attendanceTrends: string;
    thisWeek: string;
    departmentDistribution: string;
    recentAttendance: string;
    student: string;
    course: string;
    time: string;

    // Attendance Logs
    attendanceLogs: string;
    viewAndExportAttendance: string;
    exportCsv: string;
    date: string;
    allCourses: string;
}

const translations: Record<Language, Translations> = {
    en: {
        // Navigation
        dashboard: 'Dashboard',
        registration: 'Registration',
        students: 'Students',
        courses: 'Courses',
        admins: 'Admin Management',
        scanner: 'Scanner',
        logs: 'Attendance Logs',

        // Common
        fullName: 'Full Name',
        phoneNumber: 'Phone Number',
        email: 'Email',
        department: 'Department',
        studentId: 'Student ID',
        actions: 'Actions',
        name: 'Name',
        idNumber: 'ID Number',
        phone: 'Phone',
        loading: 'Loading students...',
        noStudentsFound: 'No students found matching your criteria.',
        downloadQr: 'Download QR',
        deleteStudent: 'Delete Student',
        searchByNameIdPhone: 'Search by name, ID, or phone...',
        allDepartments: 'All Departments',
        downloadBulkIds: 'Download Bulk IDs',
        manageStudents: 'Manage and view all registered students',

        // Registration
        studentRegistration: 'Student Registration',
        registerNewStudents: 'Register new students individually or in bulk',
        individual: 'Individual',
        bulkUpload: 'Bulk Upload',
        registrationSuccessful: 'Registration Successful!',
        registered: 'has been registered.',
        registerStudent: 'Register Student',
        chooseCsvFile: 'Choose CSV File',
        makeSureCsvFormat: 'Make sure your CSV follows the required format.',
        downloadTemplate: 'Download Template',
        uploadMore: 'Upload More',
        total: 'Total',
        success: 'Success',
        errors: 'Errors',

        // Scanner
        attendanceScanner: 'Attendance Scanner',
        scanStudentQrs: 'Scan student QR codes to record attendance',
        selectCourse: 'Select Course',
        noCoursesFound: 'No courses found.',
        createCourseFirst: 'Please create a course in "Course Management" first.',
        attendanceRecorded: 'Attendance recorded successfully',
        invalidQrCode: 'Invalid QR Code or Student ID',
        attendanceAlreadyRecorded: 'Attendance already recorded for today',

        // Landing
        freHaymanot: 'Fre-Haymanot',
        sundaySchool: 'Sunday School',
        managementSystem: 'Management System',
        startNow: 'Start Now',
        learnAboutUs: 'Learn About Us',
        services: 'Services',
        aboutFreHaymanot: 'About Fre-Haymanot',
        visionMission: 'Vision & Mission',
        qrAttendance: 'QR Attendance',
        qrAttendanceDesc: 'Fast and secure attendance tracking.',
        studentManagement: 'Student Management',
        studentManagementDesc: 'Manage all Sunday School students and departments.',
        departmentManagement: 'Department Management',
        departmentManagementDesc: 'Easily manage departments, schedules, and administrators.',
        attendanceReports: 'Attendance Reports',
        attendanceReportsDesc: 'Get attendance history and detailed reports.',

        // Footer
        allRightsReserved: 'All rights reserved.',

        // Dashboard
        dashboardOverview: 'Dashboard Overview',
        welcomeBack: 'Welcome back to Fre Haimanot Attendance System',
        totalStudents: 'Total Students',
        todayAttendance: 'Today Attendance',
        activeCourses: 'Active Courses',
        absenceAlerts: 'Absence Alerts',
        attendanceTrends: 'Attendance Trends',
        thisWeek: '+12% this week',
        departmentDistribution: 'Department Distribution',
        recentAttendance: 'Recent Attendance',
        student: 'Student',
        course: 'Course',
        time: 'Time',

        // Attendance Logs
        attendanceLogs: 'Attendance Logs',
        viewAndExportAttendance: 'View and export attendance history',
        exportCsv: 'Export CSV',
        date: 'Date',
        allCourses: 'All Courses',
    },
    am: {
        // Navigation
        dashboard: 'ዳሽቦርድ',
        registration: 'ምዝገባ',
        students: 'ተማሪዎች',
        courses: 'ኮርሶች',
        admins: 'አድሚን አስተያየት',
        scanner: 'ስካነር',
        logs: 'የመገኘት ምዝግብ ማስታወሻዎች',

        // Common
        fullName: 'ሙሉ ስም',
        phoneNumber: 'ስልክ ቁጥር',
        email: 'ኢሜይል',
        department: 'ክፍል',
        studentId: 'የተማሪ መታወቂያ',
        actions: 'ተግባራት',
        name: 'ስም',
        idNumber: 'መታወቂያ ቁጥር',
        phone: 'ስልክ',
        loading: 'ተማሪዎች እየተለጠፉ ነው...',
        noStudentsFound: 'ከተለመዱ መስፈርቶች ጋር የሚስማማ ተማሪ አልተገኘም።',
        downloadQr: 'እቃ እንደቀል',
        deleteStudent: 'ተማሪ ሰርዝ',
        searchByNameIdPhone: 'በስም፣ መታወቂያ ወይም ስልክ ይፈልጉ...',
        allDepartments: 'ሁሉም ክፍሎች',
        downloadBulkIds: 'በብዛት መታወቂያ እንደቀል',
        manageStudents: 'ሁሉንም የተመዘገቡ ተማሪዎች ያስተያዩ እና ያስተያዩ',

        // Registration
        studentRegistration: 'የተማሪ ምዝገባ',
        registerNewStudents: 'አንድ በአንድ ወይም በብዛት አዲስ ተማሪዎችን ይመዝግቡ',
        individual: 'ነጠላ',
        bulkUpload: 'በብዛት መስቀል',
        registrationSuccessful: 'ምዝገባ ተሳካ!',
        registered: 'ተመዝግቧል።',
        registerStudent: 'ተማሪ ይመዝግቡ',
        chooseCsvFile: 'ሲኤስቪ ፋይል ይምረጡ',
        makeSureCsvFormat: 'ሲኤስቪ ፋይልዎ የሚለምደውን ቅርጸት መከተሉን ያረጋግጡ።',
        downloadTemplate: 'አብነት እንደቀል',
        uploadMore: 'ተጨማሪ መስቀል',
        total: 'አጠቃላይ',
        success: 'ተሳካ',
        errors: 'ስህተቶች',

        // Scanner
        attendanceScanner: 'የመገኘት ስካነር',
        scanStudentQrs: 'የተማሪ እቃ ኮዶችን ለመገኘት መዝግብ ያንብቡ',
        selectCourse: 'ኮርስ ይምረጡ',
        noCoursesFound: 'ኮርሶች አልተገኙም።',
        createCourseFirst: 'እባክዎ በ"ኮርስ አስተያየት" ውስጥ ኮርስ ይፍጠሩ።',
        attendanceRecorded: 'መገኘት ተሳካ ተመዝግቧል',
        invalidQrCode: 'ልክ ያልሆነ እቃ ኮድ ወይም የተማሪ መታወቂያ',
        attendanceAlreadyRecorded: 'መገኘት ለዛሬ አስቀድሞ ተመዝግቧል',

        // Landing
        freHaymanot: 'ፍሬ ሃይማኖት',
        sundaySchool: 'ሰንበት ትምህርት ቤት',
        managementSystem: 'የአስተያየት ስርዓት',
        startNow: 'አሁን ይጀምሩ',
        learnAboutUs: 'ስለ እኛ ይውቁ',
        services: 'አገልግሎቶች',
        aboutFreHaymanot: 'ስለ ፍሬ ሃይማኖት',
        visionMission: 'ራዕይ እና ተልዕኮ',
        qrAttendance: 'እቃ መገኘት',
        qrAttendanceDesc: 'ፈጣን እና ደህንነቱ የተጠበቀ መገኘት መከታተያ።',
        studentManagement: 'የተማሪ አስተያየት',
        studentManagementDesc: 'ሁሉም ሰንበት ትምህርት ቤት ተማሪዎችና ክፍሎችን መቆጣጠር።',
        departmentManagement: 'የክፍል መቆጣጠር',
        departmentManagementDesc: 'ክፍሎችን፣ የጊዜ ሰነዶችን እና አስተዳዳሪዎችን በቀላሉ ያደራግጡ።',
        attendanceReports: 'የመገኘት ሪፖርቶች',
        attendanceReportsDesc: 'መገኘት ታሪክ እና ዝርዝር ሪፖርቶችን ያግኙ።',

        // Footer
        allRightsReserved: 'ሁሉም መብቶች የተጠበቀው።',

        // Dashboard
        dashboardOverview: 'የዳሽቦርድ አጠቃላይ እይታ',
        welcomeBack: 'ወደ ፍሬ ሃይማኖት መገኘት ስርዓት እንኳን ደህና መጡ',
        totalStudents: 'አጠቃላይ ተማሪዎች',
        todayAttendance: 'የዛሬ መገኘት',
        activeCourses: 'ንቁ ኮርሶች',
        absenceAlerts: 'የማትለፊያ ማስታወሻዎች',
        attendanceTrends: 'የመገኘት አቅጣጫዎች',
        thisWeek: 'በዚህ ሳምንት +12%',
        departmentDistribution: 'የክፍል ስርጭት',
        recentAttendance: 'የቅርቡ መገኘት',
        student: 'ተማሪ',
        course: 'ኮርስ',
        time: 'ሰዓት',

        // Attendance Logs
        attendanceLogs: 'የመገኘት ምዝግብ ማስታወሻዎች',
        viewAndExportAttendance: 'የመገኘት ታሪክን ያስተያዩ እና ያስቀምጡ',
        exportCsv: 'ኤክሰል ያስቀምጡ',
        date: 'ቀን',
        allCourses: 'ሁሉም ኮርሶች',
    },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');

    const t = translations[language];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};