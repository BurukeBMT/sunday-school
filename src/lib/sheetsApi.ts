import type { GradeRanking, LeaderboardEntry, TranscriptData } from '../types';

export const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbyytm8cMtva9FuLmBA80FTgp0IJko5LfrAMrkhLdikXWUzP5i2J-PMaC3BeGD3tElyG/exec';

export interface GradingRule {
    course: string;
    type: string;
    weight: number;
}

export interface MarkEntry {
    studentId: string;
    course: string;
    assessmentType: string;
    score: number;
    maxScore?: number;
    date?: string;
    teacherId?: string;
}

export interface StudentResult {
    studentId: string;
    course: string;
    total: number;
    rank: number;
}

export interface SheetsApiResponse {
    success: boolean;
    message?: string;
    data?: any;
    error?: string;
}

const handleResponse = async <T = any>(response: Response): Promise<T> => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    if (!data.success) {
        throw new Error(data.error || 'Google Sheets API request failed');
    }
    return data.data as T;
};

const buildUrl = (params: Record<string, string | number | undefined>) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            queryParams.set(key, String(value));
        }
    });
    return `${SHEETS_API_URL}?${queryParams.toString()}`;
};

const normalizeResultRows = (rows: any[]): StudentResult[] => {
    return rows.map((row) => ({
        studentId: String(row.studentId || row.studentid || row.id || ''),
        studentName: String(row.studentName || row.studentname || ''),
        grade: String(row.grade || ''),
        course: String(row.course || row.courseName || ''),
        total: Number(row.total ?? row.totalScore ?? 0),
        rank: Number(row.rank ?? 0),
        letterGrade: String(row.letterGrade || row.lettergrade || ''),
        status: String(row.status || '')
    }));
};

export const fetchStudentResults = async (studentId: string, grade: string): Promise<StudentResult[]> => {
    if (!studentId || !grade) {
        throw new Error('studentId and grade are required to fetch student results');
    }

    try {
        const url = buildUrl({ type: 'studentResults', studentId, grade });
        const response = await fetch(url, { method: 'GET' });
        const data = await handleResponse<any[]>(response);
        return normalizeResultRows(data);
    } catch (error) {
        console.error('Error fetching student results from Google Sheets:', error);
        throw error;
    }
};

export const fetchStudents = async (): Promise<any[]> => {
    try {
        const url = buildUrl({ type: 'students' });
        const response = await fetch(url, { method: 'GET' });
        return await handleResponse<any[]>(response);
    } catch (error) {
        console.error('Error fetching students from Google Sheets:', error);
        throw error;
    }
};

export const fetchAttendanceLogs = async (): Promise<any[]> => {
    try {
        const url = buildUrl({ type: 'attendance' });
        const response = await fetch(url, { method: 'GET' });
        return await handleResponse<any[]>(response);
    } catch (error) {
        console.error('Error fetching attendance logs from Google Sheets:', error);
        throw error;
    }
};

export const fetchResults = async (): Promise<StudentResult[]> => {
    try {
        const url = buildUrl({ type: 'results' });
        const response = await fetch(url, { method: 'GET' });
        const data = await handleResponse<any[]>(response);
        return normalizeResultRows(data);
    } catch (error) {
        console.error('Error fetching results from Google Sheets:', error);
        throw error;
    }
};

export const registerStudent = async (student: {
    studentId: string;
    fullName: string;
    course: string;
    grade: string;
    qrToken: string;
    date: string;
    time: string;
}): Promise<SheetsApiResponse> => {
    try {
        const response = await fetch(SHEETS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'registerStudent',
                payload: student
            })
        });

        const data: SheetsApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        if (!data.success) {
            throw new Error(data.error || 'Google Sheets registration request failed');
        }
        return data;
    } catch (error) {
        console.error('Error registering student with Google Sheets:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export const sendScan = async (scanPayload: {
    id: string;
    token: string;
    course: string;
    markedBy?: string | null;
}): Promise<SheetsApiResponse> => {
    try {
        const response = await fetch(SHEETS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'scan',
                payload: scanPayload
            })
        });

        const data: SheetsApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        return data;
    } catch (error) {
        console.error('Error sending scan payload to Google Sheets:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export const sendMarks = async (marks: MarkEntry[]): Promise<SheetsApiResponse> => {
    try {
        const response = await fetch(SHEETS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'marks',
                payload: marks
            })
        });

        const data: SheetsApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        return data;
    } catch (error) {
        console.error('Error sending marks to Google Sheets:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export const sendGradingRules = async (rules: GradingRule[]): Promise<SheetsApiResponse> => {
    try {
        const response = await fetch(SHEETS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'rules',
                payload: rules
            })
        });

        const data: SheetsApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        return data;
    } catch (error) {
        console.error('Error sending grading rules to Google Sheets:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export const fetchGradingRules = async (course?: string): Promise<GradingRule[]> => {
    try {
        const url = buildUrl({ type: 'gradingRules', course });
        const response = await fetch(url, { method: 'GET' });
        return await handleResponse<GradingRule[]>(response);
    } catch (error) {
        console.error('Error fetching grading rules from Google Sheets:', error);
        throw error;
    }
};

export const getGradeRanking = async (grade: string): Promise<GradeRanking[]> => {
    try {
        const response = await fetch(SHEETS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'getGradeRanking',
                payload: { grade }
            })
        });

        const data: SheetsApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch grade ranking');
        }
        return data.data || [];
    } catch (error) {
        console.error('Error fetching grade ranking:', error);
        throw error;
    }
};

export const getTopStudentsByGrade = async (grade: string, limit = 10): Promise<LeaderboardEntry[]> => {
    try {
        const response = await fetch(SHEETS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'getTopStudentsByGrade',
                payload: { grade, limit }
            })
        });

        const data: SheetsApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch top students by grade');
        }
        return data.data || [];
    } catch (error) {
        console.error('Error fetching top students by grade:', error);
        throw error;
    }
};

export const getTranscriptData = async (studentId: string): Promise<TranscriptData> => {
    try {
        const response = await fetch(SHEETS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'getTranscriptData',
                payload: { studentId }
            })
        });

        const data: SheetsApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch transcript data');
        }
        return data.data;
    } catch (error) {
        console.error('Error fetching transcript data:', error);
        throw error;
    }
};
