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

const STUDENT_ID_REGEX = /^FHST\d{5}$/;
const QR_TOKEN_REGEX = /^[A-Za-z0-9_-]{12,64}$/;

const isValidStudentId = (id) => STUDENT_ID_REGEX.test(String(id || '').trim());
const isValidQrToken = (token) => QR_TOKEN_REGEX.test(String(token || '').trim());

const fetchFirebaseJson = (path) => {
    if (!CONFIG.FIREBASE_URL) return null;
    const baseUrl = String(CONFIG.FIREBASE_URL).replace(/\/+$/, '');
    const cleanPath = String(path || '').replace(/^\/+/, '');
    const url = `${baseUrl}/${cleanPath}${CONFIG.FIREBASE_AUTH ? `?auth=${CONFIG.FIREBASE_AUTH}` : ''}`;

    try {
        const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
        const code = response.getResponseCode();
        if (code >= 200 && code < 300) {
            return JSON.parse(response.getContentText());
        }
    } catch (err) {
        console.error('Firebase fetch failed:', err);
    }
    return null;
};

const isResultsPublished = (grade) => {
    const normalizedGrade = String(grade || '').trim();
    if (!normalizedGrade) return false;
    if (!CONFIG.FIREBASE_URL) return true;

    const publishedState = fetchFirebaseJson(`resultsControl/${encodeURIComponent(normalizedGrade)}.json`);
    return Boolean(publishedState && publishedState.isPublished === true);
};

const getStudentResults = (studentId) => {
    const normalizedId = String(studentId || '').trim();
    if (!normalizedId) return [];
    return getSheetRows(CONFIG.SHEETS.results).filter((row) => String(row.studentid || row.studentId || '').trim() === normalizedId);
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

const writeSheetRows = (sheetName, rows) => {
    const sheet = openSheet(sheetName);
    if (!sheet) return false;
    sheet.clearContents();

    if (!Array.isArray(rows) || rows.length === 0) {
        return true;
    }

    const headers = Object.keys(rows[0]).map((header) => String(header || '').trim());
    sheet.appendRow(headers);

    const rowValues = rows.map((row) => headers.map((header) => row[header] !== undefined ? row[header] : ''));
    sheet.getRange(2, 1, rowValues.length, headers.length).setValues(rowValues);
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

    if (!isValidStudentId(studentId)) {
        return { success: false, error: 'Student ID must follow the FHST00001 format.' };
    }

    if (!isValidQrToken(qrToken)) {
        return { success: false, error: 'QR token must be 12-64 characters with only letters, numbers, underscore, or hyphen.' };
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
    const token = String(payload.token || payload.qrToken || '').trim();
    const course = String(payload.course || 'General').trim() || 'General';
    const markedBy = String(payload.markedBy || 'system').trim() || 'system';

    if (!studentId || !token) {
        return { success: false, error: 'Student ID and QR token are required.' };
    }

    if (!isValidStudentId(studentId)) {
        return { success: false, error: 'Student ID is malformed. Expected FHST00001 format.' };
    }

    if (!isValidQrToken(token)) {
        return { success: false, error: 'Invalid QR token format.' };
    }

    const student = findStudent(studentId);
    if (!student) {
        return { success: false, error: 'Student not found.' };
    }

    if (String(student.qrtoken || student.qr_token || '').trim() !== token) {
        return { success: false, error: 'Invalid QR code token.' };
    }

    const lock = LockService.getScriptLock();
    let lockAcquired = false;
    try {
        lock.waitLock(10000);
        lockAcquired = true;
    } catch (err) {
        return { success: false, error: 'System busy. Please retry the scan in a moment.' };
    }

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
        if (lockAcquired) {
            lock.releaseLock();
        }
    }
};

const processMarks = (payload) => {
    const marks = Array.isArray(payload) ? payload : payload.marks;
    if (!Array.isArray(marks) || marks.length === 0) {
        return { success: false, error: 'No marks were provided.' };
    }

    const validMarks = [];
    const errors = [];

    marks.forEach((mark, index) => {
        const studentId = String(mark.studentId || '').trim();
        const course = String(mark.course || '').trim();
        const assessmentType = String(mark.assessmentType || mark.type || '').trim();
        const score = Number(mark.score);
        const maxScore = Number(mark.maxScore || 100);
        const date = String(mark.date || new Date().toISOString()).trim();
        const teacherId = String(mark.teacherId || '').trim();

        if (!studentId || !course || !assessmentType || Number.isNaN(score)) {
            errors.push(`Invalid mark entry at index ${index}. Required fields: studentId, course, assessmentType, score.`);
            return;
        }

        validMarks.push({
            studentId,
            course,
            assessmentType,
            score,
            maxScore: Number.isFinite(maxScore) ? maxScore : 100,
            date,
            teacherId
        });
    });

    if (validMarks.length === 0) {
        return { success: false, error: `No valid marks to save. ${errors.join(' ')}` };
    }

    validMarks.forEach((mark) => appendSheetRow(CONFIG.SHEETS.marks, mark));
    buildResults();

    return {
        success: true,
        message: `Saved ${validMarks.length} mark${validMarks.length === 1 ? '' : 's'} and updated results.`,
        errors: errors.length ? errors : undefined
    };
};

const processRules = (payload) => {
    const rules = Array.isArray(payload) ? payload : payload.rules || payload;
    if (!Array.isArray(rules) || rules.length === 0) {
        return { success: false, error: 'No grading rules were provided.' };
    }

    const normalizedRules = [];
    const errors = [];

    rules.forEach((rule, index) => {
        const course = String(rule.course || '').trim();
        const type = String(rule.type || '').trim();
        const weight = Number(rule.weight);

        if (!course || !type || Number.isNaN(weight) || weight < 0) {
            errors.push(`Invalid grading rule at index ${index}. Required fields: course, type, weight >= 0.`);
            return;
        }

        normalizedRules.push({ course, type, weight });
    });

    if (normalizedRules.length === 0) {
        return { success: false, error: `No valid grading rules to save. ${errors.join(' ')}` };
    }

    writeSheetRows(CONFIG.SHEETS.gradingRules, normalizedRules);
    buildResults();

    return {
        success: true,
        message: 'Grading rules saved and results updated.',
        errors: errors.length ? errors : undefined
    };
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
        const score = Number(normalized.toFixed(1));
        const letterGrade = score >= 90 ? 'A'
            : score >= 80 ? 'B'
                : score >= 70 ? 'C'
                    : score >= 60 ? 'D'
                        : 'F';
        const status = score >= 60 ? 'Passed' : 'Failed';

        results.push({
            studentId,
            studentName: student ? String(student.fullname || student.fullName || student.name || '') : '',
            grade: student ? String(student.grade || '') : '',
            course,
            total: score,
            letterGrade,
            status,
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
        letterGrade: item.letterGrade,
        status: item.status,
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
        case 'studentResults':
            if (!studentId || !grade) {
                return createJsonResponse({ success: false, error: 'studentId and grade are required for student results.' });
            }
            if (!isResultsPublished(grade)) {
                return createJsonResponse({ success: false, error: 'Results are not published for this grade.' });
            }
            return createJsonResponse({ success: true, data: getStudentResults(studentId) });
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
        case 'recalculate':
            buildResults();
            return createJsonResponse({ success: true, message: 'Recalculation completed.' });
        default:
            return createJsonResponse({ success: false, error: 'Invalid action type' });
    }
}
