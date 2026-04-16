import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Users, AlertCircle } from 'lucide-react';
import { getGradeRanking } from '../lib/sheetsApi';
import { GradeRanking, GRADES } from '../types';

export const GradeRanking: React.FC = () => {
    const [selectedGrade, setSelectedGrade] = useState<string>(GRADES[0]);
    const [rankings, setRankings] = useState<GradeRanking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadGradeRanking(selectedGrade);
    }, [selectedGrade]);

    const loadGradeRanking = async (grade: string) => {
        setLoading(true);
        setError('');
        try {
            const data = await getGradeRanking(grade);
            setRankings(data);
        } catch (err) {
            setError('Failed to load grade ranking');
            console.error('Error loading grade ranking:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="h-6 w-6 text-yellow-500" />;
            case 2:
                return <Medal className="h-6 w-6 text-gray-400" />;
            case 3:
                return <Award className="h-6 w-6 text-amber-600" />;
            default:
                return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
        }
    };

    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
            case 2:
                return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
            case 3:
                return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
            default:
                return 'bg-white border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Rankings</h3>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Grade Rankings</h1>
                <p className="mt-2 text-gray-600">Academic performance rankings by grade level</p>
            </div>

            {/* Grade Selector */}
            <div className="mb-6">
                <label htmlFor="grade-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Grade Level
                </label>
                <select
                    id="grade-select"
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                    {GRADES.map((grade) => (
                        <option key={grade} value={grade}>
                            {grade}
                        </option>
                    ))}
                </select>
            </div>

            {/* Statistics Cards */}
            {rankings.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">{rankings.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Trophy className="h-8 w-8 text-yellow-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Top Score</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {Math.max(...rankings.map(r => r.totalScore)).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <Award className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Average Score</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {(rankings.reduce((sum, r) => sum + r.totalScore, 0) / rankings.length).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rankings Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {selectedGrade} Rankings
                    </h2>
                </div>

                {rankings.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Rankings Available</h3>
                        <p className="text-gray-600">No student data available for this grade yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rank
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Score
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rankings.map((student) => (
                                    <tr key={student.studentId} className={getRankStyle(student.rank)}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getRankIcon(student.rank)}
                                                <span className="ml-2 text-sm font-medium text-gray-900">
                                                    #{student.rank}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {student.studentName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {student.studentId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            {student.totalScore.toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};