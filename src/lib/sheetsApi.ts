const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbyytm8cMtva9FuLmBA80FTgp0IJko5LfrAMrkhLdikXWUzP5i2J-PMaC3BeGD3tElyG/exec';

export interface GradingRule {
    course: string;
    type: string;
    weight: number;
}

export interface MarkEntry {
    studentId: string;
    course: string;
    type: string;
    score: number;
}

export interface StudentResult {
    studentId: string;
    course: string;
    total: number;
    rank: number;
}

export interface SheetsApiResponse {
    success: boolean;
    data?: any;
    error?: string;
}

/**
 * Fetch all results from Google Sheets
 */
export const fetchResults = async (): Promise<StudentResult[]> => {
    try {
        const response = await fetch(SHEETS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'fetchResults'
            })
        });

        const data: SheetsApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch results');
        }

        return data.data || [];
    } catch (error) {
        console.error('Error fetching results from Google Sheets:', error);
        throw error;
    }
};

/**
 * Fetch results for a specific student
 */
export const fetchStudentResults = async (studentId: string): Promise<StudentResult[]> => {
    try {
        const allResults = await fetchResults();
        return allResults.filter(result => result.studentId === studentId);
    } catch (error) {
        console.error('Error fetching student results:', error);
        throw error;
    }
};

/**
 * Send marks to Google Sheets
 */
export const sendMarks = async (marks: MarkEntry[]): Promise<SheetsApiResponse> => {
    try {
        const response = await fetch(SHEETS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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

/**
 * Send grading rules to Google Sheets
 */
export const sendGradingRules = async (rules: GradingRule[]): Promise<SheetsApiResponse> => {
    try {
        const response = await fetch(SHEETS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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

/**
 * Fetch grading rules from Google Sheets
 */
export const fetchGradingRules = async (course?: string): Promise<GradingRule[]> => {
    try {
        const payload: any = { type: 'fetchGradingRules' };
        if (course) {
            payload.course = course;
        }

        const response = await fetch(SHEETS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const data: SheetsApiResponse = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch grading rules');
        }

        return data.data || [];
    } catch (error) {
        console.error('Error fetching grading rules from Google Sheets:', error);
        throw error;
    }
};

/**
 * Get grade-wise ranking for a specific grade
 */
export const getGradeRanking = async (grade: string): Promise<GradeRanking[]> => {
    try {
        const response = await fetch(SHEETS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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

/**
 * Get top students by grade for leaderboard
 */
export const getTopStudentsByGrade = async (grade: string, limit = 10): Promise<LeaderboardEntry[]> => {
    try {
        const response = await fetch(SHEETS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
            throw new Error(data.error || 'Failed to fetch top students');
        }

        return data.data || [];
    } catch (error) {
        console.error('Error fetching top students by grade:', error);
        throw error;
    }
};

/**
 * Get transcript data for a student
 */
export const getTranscriptData = async (studentId: string): Promise<TranscriptData> => {
    try {
        const response = await fetch(SHEETS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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