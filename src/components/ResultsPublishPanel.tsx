import React, { useState, useEffect } from 'react';
import { Lock, Unlock, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toggleResultsPublication, getAllResultsPublicationStatus } from '../lib/resultsControl';
import { GRADES, ResultsControl } from '../types';

export const ResultsPublishPanel: React.FC = () => {
    const [publicationStatus, setPublicationStatus] = useState<Record<string, ResultsControl>>({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadPublicationStatus();
    }, []);

    const loadPublicationStatus = async () => {
        setLoading(true);
        try {
            const status = await getAllResultsPublicationStatus();
            setPublicationStatus(status);
        } catch (err) {
            setError('Failed to load publication status');
            console.error('Error loading publication status:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePublication = async (grade: string, publish: boolean) => {
        setUpdating(grade);
        setError('');
        setSuccess('');

        try {
            await toggleResultsPublication(grade, publish);
            setPublicationStatus(prev => ({
                ...prev,
                [grade]: {
                    isPublished: publish,
                    publishedAt: publish ? Date.now() : undefined
                }
            }));

            setSuccess(`Results ${publish ? 'published' : 'locked'} for ${grade}`);
        } catch (err) {
            setError(`Failed to ${publish ? 'publish' : 'lock'} results for ${grade}`);
            console.error('Error toggling publication:', err);
        } finally {
            setUpdating(null);
        }
    };

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return 'Never';
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Results Publication Control</h1>
                <p className="mt-2 text-gray-600">
                    Control when students can view their academic results by grade level
                </p>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {success && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <div className="ml-3">
                            <p className="text-sm text-green-800">{success}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Publication Controls */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Grade Publication Status</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Toggle publication to control student access to results
                    </p>
                </div>

                <div className="divide-y divide-gray-200">
                    {GRADES.map((grade) => {
                        const status = publicationStatus[grade] || { isPublished: false };
                        const isUpdating = updating === grade;

                        return (
                            <div key={grade} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        {status.isPublished ? (
                                            <Unlock className="h-5 w-5 text-green-500 mr-3" />
                                        ) : (
                                            <Lock className="h-5 w-5 text-red-500 mr-3" />
                                        )}
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">{grade}</h3>
                                            <div className="flex items-center mt-1">
                                                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                                                <span className="text-xs text-gray-500">
                                                    Published: {formatDate(status.publishedAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.isPublished
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {status.isPublished ? 'Published' : 'Locked'}
                                        </span>

                                        <button
                                            onClick={() => handleTogglePublication(grade, !status.isPublished)}
                                            disabled={isUpdating}
                                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${status.isPublished
                                                    ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500'
                                                    : 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500'
                                                } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50`}
                                        >
                                            {isUpdating ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                            ) : null}
                                            {status.isPublished ? 'Lock Results' : 'Publish Results'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Information Panel */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-400" />
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Publication Rules</h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <ul className="list-disc list-inside space-y-1">
                                <li>When results are <strong>locked</strong>, students cannot view their academic results</li>
                                <li>When results are <strong>published</strong>, students can access their results in the Student Results page</li>
                                <li>Publication status is controlled per grade level independently</li>
                                <li>Changes take effect immediately for all students in the affected grade</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};