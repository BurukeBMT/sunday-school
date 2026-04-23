import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BackupService } from '../lib/productionServices';
import { BackupMetadata } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Download, Upload, Database, Clock, CheckCircle, XCircle, AlertTriangle, HardDrive } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const BackupRestorePanel: React.FC = () => {
    const { user } = useAuth();
    const [backups, setBackups] = useState<BackupMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [creatingBackup, setCreatingBackup] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [backupProgress, setBackupProgress] = useState(0);

    useEffect(() => {
        loadBackups();
    }, []);

    const loadBackups = async () => {
        try {
            setLoading(true);
            const backupsData = await BackupService.getBackups();
            setBackups(backupsData);
        } catch (error) {
            console.error('Error loading backups:', error);
            toast.error('Failed to load backups');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBackup = async (type: 'auto' | 'manual') => {
        if (!user) return;

        try {
            setCreatingBackup(true);
            setBackupProgress(0);

            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setBackupProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 500);

            const backup = await BackupService.createBackup(type, user.uid);

            clearInterval(progressInterval);
            setBackupProgress(100);

            toast.success('Backup created successfully');
            setShowCreateDialog(false);
            loadBackups();

            // Reset progress after a delay
            setTimeout(() => {
                setBackupProgress(0);
                setCreatingBackup(false);
            }, 1000);

        } catch (error) {
            console.error('Error creating backup:', error);
            toast.error('Failed to create backup');
            setCreatingBackup(false);
            setBackupProgress(0);
        }
    };

    const handleDownloadBackup = async (backup: BackupMetadata) => {
        try {
            // In a real implementation, this would download the backup file
            // For now, we'll create a JSON representation
            const backupData = {
                metadata: backup,
                note: 'This is a placeholder. Actual backup download would be implemented with Firebase Storage.'
            };

            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-${backup.backupId}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Backup download started');
        } catch (error) {
            console.error('Error downloading backup:', error);
            toast.error('Failed to download backup');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'in_progress':
                return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
            default:
                return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'completed':
                return 'default';
            case 'failed':
                return 'destructive';
            case 'in_progress':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading backups...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Backup & Restore System</h2>
                    <p className="text-gray-600">Manage system backups and data restoration</p>
                </div>

                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                        <Button disabled={creatingBackup}>
                            <Database className="w-4 h-4 mr-2" />
                            Create Backup
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create System Backup</DialogTitle>
                        </DialogHeader>

                        {creatingBackup ? (
                            <div className="space-y-4">
                                <div className="text-center">
                                    <Database className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
                                    <h3 className="text-lg font-medium mb-2">Creating Backup...</h3>
                                    <Progress value={backupProgress} className="w-full" />
                                    <p className="text-sm text-gray-600 mt-2">{backupProgress}% complete</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Alert>
                                    <HardDrive className="h-4 w-4" />
                                    <AlertDescription>
                                        This will create a complete backup of all system data including students,
                                        attendance records, courses, and user information.
                                    </AlertDescription>
                                </Alert>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleCreateBackup('manual')}
                                        className="flex-1"
                                    >
                                        Create Manual Backup
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowCreateDialog(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Database className="w-8 h-8 text-blue-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Backups</p>
                                <p className="text-2xl font-bold text-blue-600">{backups.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Successful</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {backups.filter(b => b.status === 'completed').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <Clock className="w-8 h-8 text-yellow-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {backups.filter(b => b.status === 'in_progress').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <HardDrive className="w-8 h-8 text-purple-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Size</p>
                                <p className="text-lg font-bold text-purple-600">
                                    {formatFileSize(backups.reduce((sum, b) => sum + b.size, 0))}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Backups List */}
            <Card>
                <CardHeader>
                    <CardTitle>System Backups</CardTitle>
                </CardHeader>
                <CardContent>
                    {backups.length === 0 ? (
                        <div className="text-center py-8">
                            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No backups found</p>
                            <p className="text-sm text-gray-500 mt-2">Create your first backup to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {backups.map((backup) => (
                                <div key={backup.backupId} className="border rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(backup.status)}
                                            <div>
                                                <h3 className="font-medium">Backup {backup.backupId.slice(-8)}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(backup.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Badge variant={getStatusBadgeVariant(backup.status)}>
                                                {backup.status.toUpperCase()}
                                            </Badge>
                                            <Badge variant="outline">
                                                {backup.type}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                        <div>
                                            <span className="text-sm text-gray-600">Students:</span>
                                            <div className="font-medium">{backup.recordCount.students}</div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Attendance:</span>
                                            <div className="font-medium">{backup.recordCount.attendance_logs}</div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Courses:</span>
                                            <div className="font-medium">{backup.recordCount.courses}</div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Size:</span>
                                            <div className="font-medium">{formatFileSize(backup.size)}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-600">
                                            Created by: {backup.createdBy}
                                        </div>

                                        {backup.status === 'completed' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDownloadBackup(backup)}
                                            >
                                                <Download className="w-4 h-4 mr-1" />
                                                Download
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Backup Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Backup Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-2">What Gets Backed Up?</h4>
                            <ul className="text-sm text-gray-600 space-y-1 ml-4">
                                <li>• Student records and profiles</li>
                                <li>• Attendance logs and history</li>
                                <li>• Course configurations and assignments</li>
                                <li>• User accounts and permissions</li>
                                <li>• Parent account information</li>
                                <li>• Academic results and grades</li>
                                <li>• System configuration settings</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">Backup Types</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <h5 className="font-medium text-blue-800">Manual Backup</h5>
                                    <p className="text-sm text-blue-600">Created on-demand by administrators</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <h5 className="font-medium text-green-800">Auto Backup</h5>
                                    <p className="text-sm text-green-600">Scheduled automatic backups (daily/weekly)</p>
                                </div>
                            </div>
                        </div>

                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Important:</strong> Backups contain sensitive student and personal information.
                                Store backup files securely and follow your organization's data retention policies.
                            </AlertDescription>
                        </Alert>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};