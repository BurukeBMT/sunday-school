import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { ASSESSMENT_TYPES, Course, GradingRule } from '../types';
import { fetchGradingRules, saveGradingRules } from '../lib/firebaseService';

interface GradingRulesFormProps {
    assignedCourses: Course[];
}

export const GradingRulesForm: React.FC<GradingRulesFormProps> = ({ assignedCourses }) => {
    const [selectedCourse, setSelectedCourse] = useState('');
    const [rules, setRules] = useState<GradingRule[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (selectedCourse) {
            loadGradingRules();
        }
    }, [selectedCourse]);

    const loadGradingRules = async () => {
        setLoading(true);
        setError('');
        try {
            const courseRules = await fetchGradingRules(selectedCourse);
            setRules(courseRules);
        } catch (err) {
            setError('Failed to load grading rules');
            console.error('Error loading grading rules:', err);
            // Initialize with empty rules if fetch fails
            setRules([]);
        } finally {
            setLoading(false);
        }
    };

    const addRule = () => {
        if (!selectedCourse) return;

        const newRule: GradingRule = {
            course: selectedCourse,
            type: 'assignment',
            weight: 0,
        };
        setRules([...rules, newRule]);
    };

    const updateRule = (index: number, field: keyof GradingRule, value: string | number) => {
        const updatedRules = [...rules];
        updatedRules[index] = { ...updatedRules[index], [field]: value };
        setRules(updatedRules);
    };

    const removeRule = (index: number) => {
        setRules(rules.filter((_, i) => i !== index));
    };

    const validateRules = (): string | null => {
        const totalWeight = rules.reduce((sum, rule) => sum + rule.weight, 0);
        if (totalWeight !== 100) {
            return `Total weight must be 100%. Current total: ${totalWeight}%`;
        }

        const types = rules.map(rule => rule.type);
        const duplicates = types.filter((type, index) => types.indexOf(type) !== index);
        if (duplicates.length > 0) {
            return `Duplicate assessment types found: ${duplicates.join(', ')}`;
        }

        return null;
    };

    const saveRules = async () => {
        if (!selectedCourse) return;

        const validationError = validateRules();
        if (validationError) {
            setError(validationError);
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await saveGradingRules(rules);
            setSuccess('Grading rules saved successfully!');
        } catch (err) {
            setError('Failed to save grading rules');
            console.error('Error saving grading rules:', err);
        } finally {
            setSaving(false);
        }
    };

    const totalWeight = rules.reduce((sum, rule) => sum + rule.weight, 0);
    const isValid = totalWeight === 100;

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Grading Rules</h2>

            {/* Course Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Course
                </label>
                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Select Course</option>
                    {assignedCourses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedCourse && (
                <>
                    {/* Rules Table */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                                Grading Components for {assignedCourses.find(c => c.id === selectedCourse)?.name}
                            </h3>
                            <button
                                onClick={addRule}
                                className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Component
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Assessment Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Weight (%)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {rules.map((rule, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={rule.type}
                                                        onChange={(e) => updateRule(index, 'type', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        {ASSESSMENT_TYPES.map((type) => (
                                                            <option key={type} value={type}>
                                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        value={rule.weight}
                                                        onChange={(e) => updateRule(index, 'weight', Number(e.target.value))}
                                                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        min="0"
                                                        max="100"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => removeRule(index)}
                                                        className="text-red-600 hover:text-red-900 p-1"
                                                        disabled={rules.length === 1}
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Total Weight Display */}
                    <div className="mb-6">
                        <div className={`p-4 rounded-lg flex items-center ${isValid
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-yellow-50 border border-yellow-200'
                            }`}>
                            {isValid ? (
                                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                            )}
                            <div>
                                <p className={`text-sm font-medium ${isValid ? 'text-green-800' : 'text-yellow-800'
                                    }`}>
                                    Total Weight: {totalWeight}%
                                </p>
                                <p className={`text-xs ${isValid ? 'text-green-600' : 'text-yellow-600'
                                    }`}>
                                    {isValid
                                        ? 'Grading rules are valid and ready to save.'
                                        : 'Total weight must equal 100% to save.'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                            {success}
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={saveRules}
                            disabled={saving || !isValid || rules.length === 0}
                            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5 mr-2" />
                                    Save Grading Rules
                                </>
                            )}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};