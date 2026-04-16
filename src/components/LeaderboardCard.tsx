import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, RefreshCw, AlertCircle } from 'lucide-react';
import { getTopStudentsByGrade } from '../lib/sheetsApi';
import { LeaderboardEntry, GRADES } from '../types';

interface LeaderboardCardProps {
    grade?: string;
    limit?: number;
    showGradeSelector?: boolean;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
    grade: initialGrade,
    limit = 10,
    showGradeSelector = true
}) => {
    const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade || GRADES[0]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        if (initialGrade) {
            setSelectedGrade(initialGrade);
        }
    }, [initialGrade]);

    useEffect(() => {
        loadLeaderboard(selectedGrade);
    }, [selectedGrade]);

    const loadLeaderboard = async (grade: string) => {
        setLoading(true);
        setError('');
        try {
            const data = await getTopStudentsByGrade(grade, limit);
            setLeaderboard(data);
            setLastUpdated(new Date());
        } catch (err) {
            setError('Failed to load leaderboard');
            console.error('Error loading leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="h-6 w-6 text-yellow-500" />;
            case 2:
                return <Trophy className="h-6 w-6 text-gray-400" />;
            case 3:
                return <Medal className="h-6 w-6 text-amber-600" />;
            default:
                return <Award className="h-6 w-6 text-blue-500" />;
        }
    };

    const getRankBadge = (rank: number) => {
        switch (rank) {
            case 1:
                return '🥇';
            case 2:
                return '🥈';
            case 3:
                return '🥉';
            default:
                return `#${rank}`;
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

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Top {limit} Students</h3>
                        <p className="text-blue-100 text-sm">
                            {selectedGrade} Leaderboard
                        </p>
                    </div>
                    <button
                        onClick={() => loadLeaderboard(selectedGrade)}
                        disabled={loading}
                        className="p-2 rounded-full bg-blue-500 hover:bg-blue-400 transition-colors disabled:opacity-50"
                        title="Refresh leaderboard"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {showGradeSelector && (
                    <div className="mt-3">
                        <select
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            className="block w-full px-3 py-1 text-sm bg-blue-500 border border-blue-400 rounded-md text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                        >
                            {GRADES.map((grade) => (
                                <option key={grade} value={grade} className="text-gray-900">
                                    {grade}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                {error ? (
                    <div className="text-center py-8">
                        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : leaderboard.length === 0 ? (
                    <div className="text-center py-8">
                        <Trophy className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No leaderboard data available</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {leaderboard.map((entry) => (
                            <div
                                key={entry.studentId}
                                className={`flex items-center p-4 rounded-lg border ${getRankStyle(entry.rank)}`}
                            >
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm mr-4">
                                    <span className="text-lg">{getRankBadge(entry.rank)}</span>
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 text-sm">
                                        {entry.studentName}
                                    </h4>
                                    <p className="text-xs text-gray-600">{entry.studentId}</p>
                                </div>

                                <div className="text-right">
                                    <div className="text-lg font-bold text-gray-900">
                                        {entry.totalScore.toFixed(1)}%
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500">
                                        {getRankIcon(entry.rank)}
                                        <span className="ml-1">Rank #{entry.rank}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {lastUpdated && (
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};