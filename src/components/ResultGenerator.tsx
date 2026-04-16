import React, { useState } from 'react';
import { Calculator, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { generateResultsForGrade } from '../lib/gradingUtils';
import { GRADES } from '../types';

interface ResultGeneratorProps {
    onResultsGenerated?: () => void;
}

export const ResultGenerator: React.FC<ResultGeneratorProps> = ({ onResultsGenerated }) => {
    const [selectedGrade, setSelectedGrade] = useState('');
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleGenerateResults = async () => {
        if (!selectedGrade) return;

        setGenerating(true);
        setResult(null);

        try {
            await generateResultsForGrade(selectedGrade);
            setResult({
                success: true,
                message: `Results generated successfully for ${selectedGrade}`,
            });
            onResultsGenerated?.();
        } catch (error) {
            console.error('Error generating results:', error);
            setResult({
                success: false,
                message: 'Failed to generate results. Please try again.',
            });
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
                <Calculator className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Generate Student Results</h3>
            </div>

            <p className="text-sm text-gray-600 mb-4">
                Generate final results for a grade. This will calculate totals, averages, and rankings for all students in the selected grade.
            </p>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Grade
                    </label>
                    <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select Grade</option>
                        {GRADES.map((grade) => (
                            <option key={grade} value={grade}>
                                {grade}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleGenerateResults}
                    disabled={!selectedGrade || generating}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {generating ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Generating Results...
                        </>
                    ) : (
                        <>
                            <Calculator className="h-5 w-5 mr-2" />
                            Generate Results for {selectedGrade || 'Selected Grade'}
                        </>
                    )}
                </button>

                {result && (
                    <div className={`p-4 rounded-lg flex items-center ${result.success
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                        }`}>
                        {result.success ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                        )}
                        <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'
                            }`}>
                            {result.message}
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-1">What happens when you generate results?</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Calculates total marks for each student across all courses</li>
                    <li>• Computes average score per student</li>
                    <li>• Ranks students within the grade (1st, 2nd, 3rd, etc.)</li>
                    <li>• Saves results to the database for student viewing</li>
                </ul>
            </div>
        </div>
    );
};