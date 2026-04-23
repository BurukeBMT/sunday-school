import React, { useState } from 'react';
import { RegistrationService, RegistrationResult } from '../lib/registrationService';
import { PDFGenerator } from '../lib/PDFGenerator';
import { QRGenerator } from '../lib/QRGenerator';
import { Loader2, Download, QrCode, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

export const StudentRegistration: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        grade: '',
        parentPhone: '',
        parentEmail: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await RegistrationService.registerStudent(
                formData.fullName,
                formData.grade,
                formData.parentPhone,
                formData.parentEmail || undefined
            );

            setRegistrationResult(result);
        } catch (err) {
            console.error('Registration failed:', err);
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadStudentPDF = () => {
        if (registrationResult) {
            PDFGenerator.downloadBlob(
                registrationResult.studentPDF,
                `student_${registrationResult.student.id}.pdf`
            );
        }
    };

    const downloadParentPDF = () => {
        if (registrationResult) {
            PDFGenerator.downloadBlob(
                registrationResult.parentPDF,
                `parent_${registrationResult.parent.parentId}.pdf`
            );
        }
    };

    const downloadStudentQR = () => {
        if (registrationResult) {
            QRGenerator.downloadQRImage(
                registrationResult.studentQR,
                `student_qr_${registrationResult.student.id}.png`
            );
        }
    };

    const downloadParentQR = () => {
        if (registrationResult) {
            QRGenerator.downloadQRImage(
                registrationResult.parentQR,
                `parent_qr_${registrationResult.parent.parentId}.png`
            );
        }
    };

    const resetForm = () => {
        setFormData({
            fullName: '',
            grade: '',
            parentPhone: '',
            parentEmail: ''
        });
        setRegistrationResult(null);
        setError(null);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Student Registration</CardTitle>
                    <CardDescription>
                        Register a new student and automatically create/link parent account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!registrationResult ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter student's full name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="grade">Grade</Label>
                                    <Input
                                        id="grade"
                                        name="grade"
                                        type="text"
                                        value={formData.grade}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., Grade 1, Grade 2"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="parentPhone">Parent Phone</Label>
                                    <Input
                                        id="parentPhone"
                                        name="parentPhone"
                                        type="tel"
                                        value={formData.parentPhone}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Parent's phone number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="parentEmail">Parent Email (Optional)</Label>
                                    <Input
                                        id="parentEmail"
                                        name="parentEmail"
                                        type="email"
                                        value={formData.parentEmail}
                                        onChange={handleInputChange}
                                        placeholder="Parent's email address"
                                    />
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Registering Student...
                                    </>
                                ) : (
                                    'Register Student'
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <Alert>
                                <AlertDescription>
                                    Student registration completed successfully! Download the credentials below.
                                </AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Student Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Student Credentials</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <p><strong>Name:</strong> {registrationResult.student.fullName}</p>
                                            <p><strong>Student ID:</strong> {registrationResult.student.id}</p>
                                            <p><strong>Grade:</strong> {registrationResult.student.grade}</p>
                                            <p><strong>Username:</strong> {registrationResult.studentCredentials.username}</p>
                                            <p><strong>Temporary Password:</strong> {registrationResult.studentCredentials.password}</p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Button onClick={downloadStudentPDF} variant="outline" size="sm">
                                                <FileText className="mr-2 h-4 w-4" />
                                                Download Student PDF
                                            </Button>
                                            <Button onClick={downloadStudentQR} variant="outline" size="sm">
                                                <QrCode className="mr-2 h-4 w-4" />
                                                Download Student QR
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Parent Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Parent Credentials</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <p><strong>Parent ID:</strong> {registrationResult.parent.parentId}</p>
                                            <p><strong>Phone:</strong> {registrationResult.parent.phone}</p>
                                            {registrationResult.parent.email && (
                                                <p><strong>Email:</strong> {registrationResult.parent.email}</p>
                                            )}
                                            <p><strong>Username:</strong> {registrationResult.parentCredentials.username}</p>
                                            <p><strong>Temporary Password:</strong> {registrationResult.parentCredentials.password}</p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Button onClick={downloadParentPDF} variant="outline" size="sm">
                                                <FileText className="mr-2 h-4 w-4" />
                                                Download Parent PDF
                                            </Button>
                                            <Button onClick={downloadParentQR} variant="outline" size="sm">
                                                <QrCode className="mr-2 h-4 w-4" />
                                                Download Parent QR
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex justify-center">
                                <Button onClick={resetForm} variant="outline">
                                    Register Another Student
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};