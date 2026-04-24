const CONFIG = {
    FIREBASE_URL: '', // Replace with your Firebase project URL, e.g. https://your-project-id.firebaseio.com
    FIREBASE_AUTH: '', // Optional: Firebase auth token or database secret if required for REST access
    SHEET_ID: 'your-google-sheet-id', // Replace with your Google Sheet ID
    SHEETS: {
        roster: 'Roster',
        attendance: 'Attendance',
        marks: 'Marks',
        gradingRules: 'GradingRules',
        results: 'Results'
    }
};

const createJsonResponse = (payload) => {
    const output = ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
    try {
        output.setHeader('Access-Control-Allow-Origin', '*');
        output.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
        output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    } catch (e) {
        // Some Apps Script runtimes may not support setHeader on TextOutput.
    }
    return output;
};

function doOptions() {
    return createJsonResponse({ success: true, message: 'CORS preflight response' });
}

const openSheet = (name) => {
    try {
        return SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(name);
    } catch (err) {
        console.error('Unable to open sheet', err);
        return null;
    }
};

const normalizeHeader = (header) => String(header || '').trim().toLowerCase().replace(/\s+/g, '_');

const getSheetRows = (sheetName) => {
    const sheet = openSheet(sheetName);
    if (!sheet) return [];

    const values = sheet.getDataRange().getValues();
    if (values.length < 2) return [];

    const headers = values[0].map(normalizeHeader);
    return values.slice(1).map((row) => {
        const record = {};
        headers.forEach((header, index) => {
            record[header] = row[index] === undefined ? '' : row[index];
        });
        return record;
    });
};

const getCurrentTimestamps = () => {
    const now = new Date();
    const date = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const time = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss');
    return { now, date, time };
};

const appendSheetRow = (sheetName, row) => {
    const sheet = openSheet(sheetName);
    if (!sheet) return false;

    const normalizedRow = Object.entries(row).reduce((acc, [key, value]) => {
        acc[normalizeHeader(key)] = value;
        return acc;
    }, {});

    const rowKeys = Object.keys(normalizedRow);
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    const headerValues = lastColumn > 0 ? sheet.getRange(1, 1, 1, lastColumn).getValues()[0] : [];
    const normalizedHeaders = headerValues.map(normalizeHeader);

    if (lastRow === 0 || normalizedHeaders.length === 0) {
        const headerRow = rowKeys.map((key) => {
            const originalKey = Object.keys(row).find((rawKey) => normalizeHeader(rawKey) === key);
            return originalKey || key;
        });
        sheet.clearContents();
        sheet.appendRow(headerRow);
        sheet.appendRow(rowKeys.map((key) => normalizedRow[key] || ''));
        return true;
    }

    const missingHeaders = rowKeys.filter((key) => !normalizedHeaders.includes(key));
    if (missingHeaders.length > 0) {
        const additionalHeaderLabels = missingHeaders.map((key) => {
            const originalKey = Object.keys(row).find((rawKey) => normalizeHeader(rawKey) === key);
            return originalKey || key;
        });
        sheet.getRange(1, lastColumn + 1, 1, additionalHeaderLabels.length).setValues([additionalHeaderLabels]);
        normalizedHeaders.push(...missingHeaders);
    }

    const rowValues = normalizedHeaders.map((header) => normalizedRow[header] !== undefined ? normalizedRow[header] : '');
    sheet.appendRow(rowValues);
    return true;
};

const findStudent = (studentId) => {
    const roster = getSheetRows(CONFIG.SHEETS.roster);
    const normalizedId = String(studentId || '').trim();
    return roster.find((row) => String(row.studentid || row.id || '').trim() === normalizedId);
};

const sendFirebaseRecord = (endpoint, data, id) => {
    if (!CONFIG.FIREBASE_URL) return null;

    const baseUrl = String(CONFIG.FIREBASE_URL).replace(/\/+$/, '');
    const cleanEndpoint = String(endpoint || '').replace(/^\/+/, '').replace(/\/+$/, '');
    const url = id
        ? `${baseUrl}/${cleanEndpoint}/${encodeURIComponent(id)}.json${CONFIG.FIREBASE_AUTH ? `?auth=${CONFIG.FIREBASE_AUTH}` : ''}`
        : `${baseUrl}/${cleanEndpoint}.json${CONFIG.FIREBASE_AUTH ? `?auth=${CONFIG.FIREBASE_AUTH}` : ''}`;

    const options = {
        method: id ? 'put' : 'post',
        contentType: 'application/json',
        payload: JSON.stringify(data),
        muteHttpExceptions: true
    };

    try {
        const response = UrlFetchApp.fetch(url, options);
        const code = response.getResponseCode();
        if (code >= 200 && code < 300) {
            return JSON.parse(response.getContentText());
        }
        console.error('Firebase mirror failed:', code, response.getContentText());
    } catch (err) {
        console.error('Firebase mirror failed:', err);
    }
    return null;
};

const processStudentRegistration = (payload) => {
    const studentId = String(payload.studentId || payload.id || '').trim();
    const fullName = String(payload.fullName || payload.name || '').trim();
    const course = String(payload.course || payload.grade || 'General').trim() || 'General';
    const grade = String(payload.grade || '').trim();
    const qrToken = String(payload.qrToken || payload.token || '').trim();

    if (!studentId || !fullName || !grade || !qrToken) {
        return { success: false, error: 'Missing required student registration fields.' };
    }

    const existingStudent = getSheetRows(CONFIG.SHEETS.roster).find((row) => {
        return String(row.studentid || row.id || '').trim() === studentId ||
            String(row.qrtoken || row.qr_token || '').trim() === qrToken;
    });

    if (existingStudent) {
        return { success: false, error: 'Student already exists or QR token already in use.' };
    }

    const { date, time } = getCurrentTimestamps();
    const rosterRow = {
        studentId,
        fullName,
        course,
        grade,
        qrToken,
        date,
        time
    };

    const appended = appendSheetRow(CONFIG.SHEETS.roster, rosterRow);
    if (!appended) {
        return { success: false, error: 'Unable to write student roster to Google Sheets.' };
    }

    sendFirebaseRecord('/students', rosterRow, studentId);

    return {
        success: true,
        message: 'Student registered and roster entry created.',
        data: rosterRow
    };
};

const hasDuplicateAttendance = (studentId, course, date) => {
    const normalizedStudentId = String(studentId || '').trim();
    const normalizedCourse = String(course || '').trim();
    const normalizedDate = String(date || '').trim();

    if (!normalizedStudentId || !normalizedCourse || !normalizedDate) {
        return false;
    }

    return getSheetRows(CONFIG.SHEETS.attendance).some((row) => {
        return String(row.studentid || row.studentId || '').trim() === normalizedStudentId &&
            String(row.course || '').trim() === normalizedCourse &&
            String(row.date || '').trim() === normalizedDate;
    });
};

const processScan = (payload) => {
    const studentId = String(payload.id || payload.studentId || '').trim();
    const token = String(payload.token || payload.qrToken || payload.token || '').trim();
    const course = String(payload.course || 'General').trim() || 'General';
    const markedBy = String(payload.markedBy || 'system').trim() || 'system';

    if (!studentId || !token) {
        return { success: false, error: 'Student ID and QR token are required.' };
    }

    const student = findStudent(studentId);
    if (!student) {
        return { success: false, error: 'Student not found.' };
    }

    if (String(student.qrtoken || student.qr_token || '').trim() !== token) {
        return { success: false, error: 'Invalid QR code token.' };
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
        const { now, date, time } = getCurrentTimestamps();

        if (hasDuplicateAttendance(studentId, course, date)) {
            return { success: false, error: 'Attendance already recorded for this student today.' };
        }

        const attendanceRow = {
            studentId,
            fullName: String(student.fullname || student.fullName || student.name || ''),
            course,
            grade: String(student.grade || ''),
            qrToken: token,
            date,
            time,
            markedBy,
            method: 'qr',
            createdAt: now.toISOString()
        };

        const appended = appendSheetRow(CONFIG.SHEETS.attendance, attendanceRow);
        if (!appended) {
            return { success: false, error: 'Unable to write attendance to Google Sheets.' };
        }

        sendFirebaseRecord('/attendance_logs', attendanceRow);

        return {
            success: true,
            message: `Attendance recorded for ${attendanceRow.fullName}.`,
            data: attendanceRow
        };
    } finally {
        lock.releaseLock();
    }
};

const processMarks = (payload) => {
    const marks = Array.isArray(payload) ? payload : payload.marks;
    if (!Array.isArray(marks) || marks.length === 0) {
        return { success: false, error: 'No marks were provided.' };
    }

    marks.forEach((mark) => {
        appendSheetRow(CONFIG.SHEETS.marks, {
            studentId: String(mark.studentId || '').trim(),
            course: String(mark.course || '').trim(),
            assessmentType: String(mark.assessmentType || mark.type || '').trim(),
            score: Number(mark.score || 0),
            maxScore: Number(mark.maxScore || 100),
            date: String(mark.date || new Date().toISOString()).trim(),
            teacherId: String(mark.teacherId || '').trim()
        });
    });

    buildResults();
    return { success: true, message: 'Marks saved and results updated.' };
};

const processRules = (payload) => {
    const rules = Array.isArray(payload) ? payload : payload.rules || payload;
    if (!Array.isArray(rules) || rules.length === 0) {
        return { success: false, error: 'No grading rules were provided.' };
    }

    const normalizedRules = rules.map((rule) => ({
        course: String(rule.course || '').trim(),
        type: String(rule.type || '').trim(),
        weight: Number(rule.weight || 0)
    }));

    writeSheetRows(CONFIG.SHEETS.gradingRules, normalizedRules);
    buildResults();

    return { success: true, message: 'Grading rules saved and results updated.' };
};

const buildResults = () => {
    const roster = getSheetRows(CONFIG.SHEETS.roster);
    const marks = getSheetRows(CONFIG.SHEETS.marks);
    const rules = getSheetRows(CONFIG.SHEETS.gradingRules);

    const ruleWeightByCourse = {};
    rules.forEach((rule) => {
        const course = String(rule.course || '').trim();
        if (!course) return;
        ruleWeightByCourse[course] = ruleWeightByCourse[course] || {};
        ruleWeightByCourse[course][String(rule.type || '').trim()] = Number(rule.weight || 0);
    });

    const groupedMarks = {};
    marks.forEach((mark) => {
        const studentId = String(mark.studentid || mark.studentId || '').trim();
        const course = String(mark.course || '').trim();
        const assessmentType = String(mark.assessmenttype || mark.assessmentType || '').trim();
        const score = Number(mark.score || 0);
        if (!studentId || !course || !assessmentType) return;

        const key = `${studentId}::${course}`;
        groupedMarks[key] = groupedMarks[key] || {};
        groupedMarks[key][assessmentType] = groupedMarks[key][assessmentType] || [];
        groupedMarks[key][assessmentType].push(score);
    });

    const results = [];
    Object.entries(groupedMarks).forEach(([key, assessmentMap]) => {
        const [studentId, course] = key.split('::');
        const student = roster.find((row) => String(row.studentid || row.id || '').trim() === studentId);
        const weights = ruleWeightByCourse[course] || {};
        const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0);

        const weightedScore = Object.entries(weights).reduce((total, [type, weight]) => {
            const scores = assessmentMap[type] || [];
            const average = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : 0;
            return total + average * (weight / 100);
        }, 0);

        const normalized = totalWeight > 0 ? Math.min(100, (weightedScore * 100) / totalWeight) : 0;

        results.push({
            studentId,
            studentName: student ? String(student.fullname || student.fullName || student.name || '') : '',
            grade: student ? String(student.grade || '') : '',
            course,
            total: Number(normalized.toFixed(1)),
            updatedAt: new Date().toISOString()
        });
    });

    const resultsByCourse = {};
    results.forEach((item) => {
        resultsByCourse[item.course] = resultsByCourse[item.course] || [];
        resultsByCourse[item.course].push(item);
    });

    Object.values(resultsByCourse).forEach((items) => {
        items.sort((a, b) => b.total - a.total);
        items.forEach((item, index) => {
            item.rank = index + 1;
        });
    });

    const flattened = Object.values(resultsByCourse).flat();
    writeSheetRows(CONFIG.SHEETS.results, flattened.map((item) => ({
        studentId: item.studentId,
        studentName: item.studentName,
        grade: item.grade,
        course: item.course,
        total: item.total,
        rank: item.rank,
        updatedAt: item.updatedAt
    })));
    return flattened;
};

const getGradeRanking = (grade) => {
    const results = getSheetRows(CONFIG.SHEETS.results).filter((row) => String(row.grade || '').trim() === String(grade).trim());
    const studentTotals = {};

    results.forEach((row) => {
        const id = String(row.studentid || row.studentId || '').trim();
        if (!id) return;
        studentTotals[id] = studentTotals[id] || {
            studentName: String(row.studentname || row.studentName || ''),
            grade: String(row.grade || ''),
            total: 0,
            count: 0
        };
        studentTotals[id].total += Number(row.total || row.totalScore || 0);
        studentTotals[id].count += 1;
    });

    return Object.entries(studentTotals)
        .map(([studentId, entry]) => ({
            studentId,
            studentName: entry.studentName,
            grade: entry.grade,
            totalScore: entry.count ? Number((entry.total / entry.count).toFixed(1)) : 0
        }))
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));
};

const getTopStudentsByGrade = (grade, limit = 10) => {
    return getGradeRanking(grade).slice(0, limit);
};

const getTranscriptData = (studentId) => {
    const normalizedId = String(studentId || '').trim();
    if (!normalizedId) return { studentId: '', studentName: '', grade: '', courses: [], totalAverage: 0, overallRank: 0 };

    const results = getSheetRows(CONFIG.SHEETS.results).filter((row) => String(row.studentid || row.studentId || '').trim() === normalizedId);
    const grade = results[0] ? String(results[0].grade || '') : '';
    const courses = results.map((row) => ({
        courseName: String(row.course || ''),
        score: Number(row.total || row.totalScore || 0),
        rank: Number(row.rank || 0)
    }));

    const totalAverage = courses.length
        ? Number((courses.reduce((sum, course) => sum + course.score, 0) / courses.length).toFixed(1))
        : 0;

    const gradeRanking = getGradeRanking(grade);
    const overallRank = gradeRanking.find((entry) => entry.studentId === normalizedId)?.rank || 0;

    return {
        studentId: normalizedId,
        studentName: String(results[0]?.studentname || results[0]?.studentName || ''),
        grade,
        courses,
        totalAverage,
        overallRank
    };
};

function doGet(e) {
    const type = String(e.parameter.type || '').trim();
    const grade = String(e.parameter.grade || '').trim();
    const studentId = String(e.parameter.studentId || e.parameter.id || '').trim();
    const course = String(e.parameter.course || '').trim();

    switch (type) {
        case 'students':
            return createJsonResponse({ success: true, data: getSheetRows(CONFIG.SHEETS.roster) });
        case 'attendance':
            return createJsonResponse({ success: true, data: getSheetRows(CONFIG.SHEETS.attendance) });
        case 'results':
            return createJsonResponse({ success: true, data: getSheetRows(CONFIG.SHEETS.results) });
        case 'gradingRules':
            return createJsonResponse({ success: true, data: getSheetRows(CONFIG.SHEETS.gradingRules).filter((row) => !course || String(row.course || '').trim() === course) });
        case 'gradeRanking':
            return createJsonResponse({ success: true, data: getGradeRanking(grade) });
        case 'topStudentsByGrade':
            return createJsonResponse({ success: true, data: getTopStudentsByGrade(grade, Number(e.parameter.limit) || 10) });
        case 'transcript':
            if (!studentId) {
                return createJsonResponse({ success: false, error: 'studentId is required' });
            }
            return createJsonResponse({ success: true, data: getTranscriptData(studentId) });
        default:
            return createJsonResponse({ success: false, error: 'Invalid request type' });
    }
}

function doPost(e) {
    let body = {};
    try {
        body = JSON.parse(e.postData.contents || '{}');
    } catch (err) {
        return createJsonResponse({ success: false, error: 'Unable to parse JSON body.' });
    }

    const type = String(body.type || '').trim();
    const payload = body.payload !== undefined ? body.payload : body;

    switch (type) {
        case 'scan':
            return createJsonResponse(processScan(payload));
        case 'registerStudent':
            return createJsonResponse(processStudentRegistration(payload));
        case 'marks':
            return createJsonResponse(processMarks(payload));
        case 'rules':
            return createJsonResponse(processRules(payload));
        case 'fetchResults':
            return createJsonResponse({ success: true, data: getSheetRows(CONFIG.SHEETS.results) });
        case 'fetchGradingRules':
            return createJsonResponse({ success: true, data: getSheetRows(CONFIG.SHEETS.gradingRules).filter((row) => !payload.course || String(row.course || '').trim() === String(payload.course || '')) });
        case 'getGradeRanking':
            return createJsonResponse({ success: true, data: getGradeRanking(String(payload.grade || '')) });
        case 'getTopStudentsByGrade':
            return createJsonResponse({ success: true, data: getTopStudentsByGrade(String(payload.grade || ''), Number(payload.limit) || 10) });
        case 'getTranscriptData':
            return createJsonResponse({ success: true, data: getTranscriptData(String(payload.studentId || payload.id || '')) });
        default:
            return createJsonResponse({ success: false, error: 'Invalid action type' });
    }
}
