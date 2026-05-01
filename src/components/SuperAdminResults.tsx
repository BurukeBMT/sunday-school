import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, AlertCircle, CheckCircle, Users, BookOpen } from 'lucide-react';
import { fetchResults } from '../lib/firebaseService';
import { generateResultsForGrade } from '../lib/gradingUtils';
import { StudentResult } from '../types';

export const SuperAdminResults: React.FC = () => {
    const [results, setResults] = useState<StudentResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [recalculating, setRecalculating] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const getFinalScore = (result: StudentResult) => Number(result.total ?? 0);
    const getLetterGrade = (score: number) =>
        score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
    const getStatus = (score: number) => (score >= 60 ? 'Passed' : 'Failed');

    useEffect(() => {
        loadAllResults();
    }, []);

    const loadAllResults = async () => {
        setLoading(true);
        setError('');
        try {
            const allResults = await fetchResults();
            setResults(allResults);
        } catch (err) {
            setError('Failed to load results');
            console.error('Error loading results:', err);
        } finally {
            setLoading(false);
        }
    };

    const triggerRecalculation = async () => {
        setRecalculating(true);
        setError('');
        setSuccess('');

        try {
            const grades = Array.from(new Set((results || []).map((r) => r.grade))).filter((grade): grade is string => Boolean(grade));
            if (selectedGrade) {
                await generateResultsForGrade(selectedGrade);
            } else {
                await Promise.all(grades.map((grade) => generateResultsForGrade(grade)));
            }
            setSuccess('Recalculation completed successfully');
            // Reload results after recalculation
            await loadAllResults();
        } catch (err) {
            setError('Failed to trigger recalculation');
            console.error('Error triggering recalculation:', err);
        } finally {
            setRecalculating(false);
        }
    };

    const exportResults = () => {
        // Create CSV content
        const csvContent = [
            ['Student ID', 'Course', 'Grade', 'Final Score', 'Letter Grade', 'Status'],
            ...((results || []).map((result) => {
                const finalScore = getFinalScore(result);
                return [
                    result.studentId,
                    result.course,
                    result.grade,
                    finalScore.toFixed(2),
                    getLetterGrade(finalScore),
                    getStatus(finalScore)
                ];
            }))
        ].map((row) => row.join(',')).join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student_results.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const getGradeStats = () => {
        const safeResults = results || [];
        const stats = {
            total: safeResults.length,
            excellent: safeResults.filter((r) => getLetterGrade(getFinalScore(r)) === 'A').length,
            good: safeResults.filter((r) => getLetterGrade(getFinalScore(r)) === 'B').length,
            satisfactory: safeResults.filter((r) => getLetterGrade(getFinalScore(r)) === 'C').length,
            needsImprovement: safeResults.filter((r) => ['D', 'F'].includes(getLetterGrade(getFinalScore(r)))).length,
        };
        return stats;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const stats = getGradeStats();

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Student Results Overview</h1>
                <div className="flex gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                            <select
                                value={selectedGrade}
                                onChange={(e) => setSelectedGrade(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Grades</option>
                                {Array.from(new Set((results || []).map((r) => r.grade))).map((grade) => (
                                    <option key={grade} value={grade}>
                                        {grade}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={triggerRecalculation}
                            disabled={recalculating}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${recalculating ? 'animate-spin' : ''}`} />
                            {recalculating ? 'Recalculating...' : 'Recalculate Grades'}
                        </button>
                        <button
                            onClick={exportResults}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <span className="text-red-700">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-green-700">{success}</span>
                    </div>
                )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">Total Students</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-600">Excellent (A)</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{stats.excellent}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">Good (B)</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{stats.good}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-600">Satisfactory (C)</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{stats.satisfactory}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium text-gray-600">Needs Improvement</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{stats.needsImprovement}</p>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Detailed Results</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Course
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Grade
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Final Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Letter Grade
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(results || []).map((result, index) => (
                                <tr key={`${result.studentId}-${result.course}-${index}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {result.studentId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {result.course}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {result.grade}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {getFinalScore(result).toFixed(2)}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${result.letterGrade === 'A' ? 'bg-green-100 text-green-800' :
                                            result.letterGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                                                result.letterGrade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {result.letterGrade || getLetterGrade(getFinalScore(result))}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {result.status || getStatus(getFinalScore(result))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};