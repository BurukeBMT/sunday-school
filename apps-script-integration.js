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
    return SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(name);
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

const writeSheetRows = (sheetName, rows) => {
    const sheet = openSheet(sheetName);
    if (!sheet) return false;

    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
    sheet.clearContents();
    if (headers.length === 0) return true;

    sheet.appendRow(headers);
    rows.forEach((row) => {
        sheet.appendRow(headers.map((key) => row[key] || ''));
    });
    return true;
};

const appendSheetRow = (sheetName, row) => {
    const sheet = openSheet(sheetName);
    if (!sheet) return false;

    const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(normalizeHeader);
    if (headerRow.length === 0 || sheet.getLastRow() === 0) {
        const headers = Object.keys(row);
        sheet.clearContents();
        sheet.appendRow(headers);
        sheet.appendRow(headers.map((key) => row[key] || ''));
        return true;
    }

    const values = headerRow.map((header) => row[header] || '');
    sheet.appendRow(values);
    return true;
};

const findStudent = (studentId) => {
    const roster = getSheetRows(CONFIG.SHEETS.roster);
    return roster.find((row) => String(row.studentid || row.id || '').trim() === String(studentId).trim());
};

const sendFirebaseRecord = (endpoint, data) => {
    if (!CONFIG.FIREBASE_URL) return null;

    const url = `${CONFIG.FIREBASE_URL}${endpoint}.json` + (CONFIG.FIREBASE_AUTH ? `?auth=${CONFIG.FIREBASE_AUTH}` : '');
    const options = {
        method: 'post',
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
    } catch (err) {
        console.error('Firebase mirror failed:', err);
    }
    return null;
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
            studentName: student ? String(student.fullname || student.name || '') : '',
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

const hasDuplicateAttendance = (studentId, course, date) => {
    const attendanceRows = getSheetRows(CONFIG.SHEETS.attendance);
    return attendanceRows.some((row) => {
        return String(row.studentid || row.studentId || '').trim() === String(studentId).trim() &&
            String(row.course || '').trim() === String(course).trim() &&
            String(row.date || '').trim() === String(date).trim();
    });
};

const processScan = (payload) => {
    const studentId = String(payload.id || payload.studentId || '').trim();
    const token = String(payload.token || payload.qrToken || '').trim();
    const course = String(payload.course || 'General').trim();
    const markedBy = String(payload.markedBy || '').trim() || 'system';

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

    const now = new Date();
    const date = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const time = Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH:mm:ss');

    if (hasDuplicateAttendance(studentId, course, date)) {
        return { success: false, error: 'Attendance already recorded for this student today.' };
    }

    const attendanceRow = {
        studentId,
        studentName: String(student.fullname || student.name || ''),
        grade: String(student.grade || ''),
        department: String(student.department || ''),
        course,
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
        message: `Attendance recorded for ${attendanceRow.studentName}.`,
        data: attendanceRow
    };
};

const processMarks = (payload) => {
    const marks = Array.isArray(payload) ? payload : payload.marks;
    if (!Array.isArray(marks) || marks.length === 0) {
        return { success: false, error: 'No marks were provided.' };
    }

    marks.forEach((mark) => {
        appendSheetRow(CONFIG.SHEETS.marks, {
            studentId: String(mark.studentId || ''),
            course: String(mark.course || ''),
            assessmentType: String(mark.assessmentType || mark.type || ''),
            score: Number(mark.score || 0),
            maxScore: mark.maxScore ?? 100,
            date: String(mark.date || new Date().toISOString()),
            teacherId: String(mark.teacherId || '')
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
        course: String(rule.course || ''),
        type: String(rule.type || ''),
        weight: Number(rule.weight || 0)
    }));

    writeSheetRows(CONFIG.SHEETS.gradingRules, normalizedRules);
    buildResults();

    return { success: true, message: 'Grading rules saved and results updated.' };
};

const getGradeRanking = (grade) => {
    const results = getSheetRows(CONFIG.SHEETS.results).filter((row) => String(row.grade || '').trim() === String(grade).trim());
    const studentTotals = {};

    results.forEach((row) => {
        const id = String(row.studentid || row.studentId || '').trim();
        if (!id) return;
        studentTotals[id] = studentTotals[id] || { studentName: String(row.studentname || row.studentName || ''), grade: String(row.grade || ''), total: 0, count: 0 };
        studentTotals[id].total += Number(row.total || row.totalScore || 0);
        studentTotals[id].count += 1;
    });

    const ranked = Object.entries(studentTotals)
        .map(([studentId, entry]) => ({
            studentId,
            studentName: entry.studentName,
            grade: entry.grade,
            totalScore: entry.count ? Number((entry.total / entry.count).toFixed(1)) : 0
        }))
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

    return ranked;
};

const getTopStudentsByGrade = (grade, limit = 10) => {
    return getGradeRanking(grade).slice(0, limit);
};

const getTranscriptData = (studentId) => {
    const results = getSheetRows(CONFIG.SHEETS.results).filter((row) => String(row.studentid || row.studentId || '').trim() === String(studentId).trim());
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
    const overallRank = gradeRanking.find((entry) => entry.studentId === String(studentId).trim())?.rank || 0;

    return {
        studentId: String(studentId).trim(),
        studentName: String(results[0]?.studentname || results[0]?.studentName || ''),
        grade,
        courses,
        totalAverage,
        overallRank
    };
};

function doGet(e) {
    const type = String(e.parameter.type || '');
    const grade = String(e.parameter.grade || '');
    const studentId = String(e.parameter.studentId || e.parameter.id || '');
    const course = String(e.parameter.course || '');

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
    const payload = body.payload || body;

    switch (type) {
        case 'scan':
            return createJsonResponse(processScan(payload));
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
