import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Phone, Mail, Eye, Edit, UserPlus } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import { useAuth } from '../../contexts/AuthContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

interface Parent {
    id: string;
    uid: string;
    fullName: string;
    email: string;
    phone: string;
    children: {
        id: string;
        name: string;
        grade: string;
        attendanceRate: number;
        averageGrade: number;
    }[];
    totalChildren: number;
    activeChildren: number;
    lastLogin: string;
    createdAt: string;
}

// Mock data - replace with real Firebase data
const mockParents: Parent[] = [
    {
        id: 'PAR001',
        uid: 'parent1',
        fullName: 'አቶ አብረሃም ተስፋዬ',
        email: 'parent1@school.local',
        phone: '+251911111111',
        children: [
            {
                id: 'STU001',
                name: 'አብረሃም ተስፋዬ',
                grade: 'ክፍል 1',
                attendanceRate: 95,
                averageGrade: 87.5
            },
            {
                id: 'STU002',
                name: 'ማሪያም ተስፋዬ',
                grade: 'ክፍል 2',
                attendanceRate: 92,
                averageGrade: 82.3
            }
        ],
        totalChildren: 2,
        activeChildren: 2,
        lastLogin: '2024-01-15',
        createdAt: '2024-01-01'
    },
    {
        id: 'PAR002',
        uid: 'parent2',
        fullName: 'እናት ሰላም አብረሃም',
        email: 'parent2@school.local',
        phone: '+251922222222',
        children: [
            {
                id: 'STU003',
                name: 'አብረሃም ሰላም',
                grade: 'ክፍል 3',
                attendanceRate: 88,
                averageGrade: 79.8
            }
        ],
        totalChildren: 1,
        activeChildren: 1,
        lastLogin: '2024-01-14',
        createdAt: '2024-01-02'
    }
];

const childrenDistributionData = [
    { grade: 'ክፍል 1', count: 45 },
    { grade: 'ክፍል 2', count: 38 },
    { grade: 'ክፍል 3', count: 52 },
    { grade: 'ክፍል 4', count: 28 }
];

const engagementData = [
    { name: 'Highly Engaged', value: 40, color: '#10B981' },
    { name: 'Moderately Engaged', value: 35, color: '#3B82F6' },
    { name: 'Low Engagement', value: 20, color: '#F59E0B' },
    { name: 'Inactive', value: 5, color: '#EF4444' }
];

export const Parents: React.FC = () => {
    const { profile } = useAuth();
    const [parents, setParents] = useState<Parent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
    const [showProfileDrawer, setShowProfileDrawer] = useState(false);

    useEffect(() => {
        // TODO: Fetch real data from Firebase
        setTimeout(() => {
            setParents(mockParents);
            setLoading(false);
        }, 1000);
    }, []);

    const columns = [
        {
            key: 'id',
            header: 'Parent ID',
            sortable: true,
            render: (value: string) => (
                <span className="font-mono text-sm font-medium text-green-600">{value}</span>
            )
        },
        {
            key: 'fullName',
            header: 'Full Name',
            sortable: true
        },
        {
            key: 'totalChildren',
            header: 'Children',
            sortable: true,
            render: (value: number, parent: Parent) => (
                <div className="text-center">
                    <span className="font-medium text-gray-900">{value}</span>
                    <div className="text-xs text-gray-500">
                        {parent.activeChildren} active
                    </div>
                </div>
            )
        },
        {
            key: 'email',
            header: 'Email',
            render: (value: string) => (
                <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{value}</span>
                </div>
            )
        },
        {
            key: 'phone',
            header: 'Phone',
            render: (value: string) => (
                <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{value}</span>
                </div>
            )
        },
        {
            key: 'lastLogin',
            header: 'Last Login',
            sortable: true,
            render: (value: string) => (
                <span className="text-sm text-gray-600">
                    {new Date(value).toLocaleDateString()}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (_: any, parent: Parent) => (
                <div className="flex items-center space-x-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedParent(parent);
                            setShowProfileDrawer(true);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // Handle edit
                        }}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                </div>
            )
        }
    ];

    const stats = {
        totalParents: parents.length,
        totalChildren: parents.reduce((acc, parent) => acc + parent.totalChildren, 0),
        activeChildren: parents.reduce((acc, parent) => acc + parent.activeChildren, 0),
        averageChildrenPerParent: parents.reduce((acc, parent) => acc + parent.totalChildren, 0) / parents.length
    };

    const isSuperAdmin = profile?.role === 'superadmin';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Parents</h1>
                    <p className="text-gray-600 mt-1">
                        Manage parent accounts and monitor family engagement
                    </p>
                </div>
                {isSuperAdmin && (
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                        <UserPlus className="h-4 w-4" />
                        <span>Add Parent</span>
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Parents"
                    value={stats.totalParents}
                    icon={Users}
                />
                <StatCard
                    title="Total Children"
                    value={stats.totalChildren}
                    icon={UserCheck}
                />
                <StatCard
                    title="Active Children"
                    value={stats.activeChildren}
                    icon={UserCheck}
                />
                <StatCard
                    title="Avg Children/Family"
                    value={stats.averageChildrenPerParent.toFixed(1)}
                    icon={Users}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                    title="Children Distribution by Grade"
                    subtitle="Number of children enrolled in each grade"
                    icon={UserCheck}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={childrenDistributionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="grade" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#3B82F6" name="Children" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                    title="Parent Engagement"
                    subtitle="Distribution of parent engagement levels"
                    icon={Users}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={engagementData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {engagementData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}%`, 'Engagement']} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Parents Table */}
            <DataTable
                data={parents}
                columns={columns}
                searchable={true}
                searchPlaceholder="Search parents by name, ID, or email..."
                itemsPerPage={10}
                onRowClick={(parent) => {
                    setSelectedParent(parent);
                    setShowProfileDrawer(true);
                }}
            />

            {/* Parent Profile Drawer */}
            {showProfileDrawer && selectedParent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
                    <div className="bg-white w-full max-w-md h-full overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Parent Profile</h2>
                                <button
                                    onClick={() => setShowProfileDrawer(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                                    <div className="space-y-2">
                                        <p><strong>Name:</strong> {selectedParent.fullName}</p>
                                        <p><strong>Parent ID:</strong> {selectedParent.id}</p>
                                        <p><strong>Email:</strong> {selectedParent.email}</p>
                                        <p><strong>Phone:</strong> {selectedParent.phone}</p>
                                        <p><strong>Last Login:</strong> {new Date(selectedParent.lastLogin).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* Children */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Children</h3>
                                    <div className="space-y-3">
                                        {selectedParent.children.map((child, index) => (
                                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900">{child.name}</h4>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {child.grade}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">Attendance:</span>
                                                        <span className={`ml-2 font-medium ${child.attendanceRate >= 90 ? 'text-green-600' :
                                                                child.attendanceRate >= 80 ? 'text-yellow-600' :
                                                                    'text-red-600'
                                                            }`}>
                                                            {child.attendanceRate}%
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Avg Grade:</span>
                                                        <span className={`ml-2 font-medium ${child.averageGrade >= 85 ? 'text-green-600' :
                                                                child.averageGrade >= 75 ? 'text-yellow-600' :
                                                                    'text-red-600'
                                                            }`}>
                                                            {child.averageGrade}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Family Stats */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Family Statistics</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-blue-600 font-medium">Total Children</p>
                                            <p className="text-2xl font-bold text-blue-900">{selectedParent.totalChildren}</p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <p className="text-sm text-green-600 font-medium">Active Children</p>
                                            <p className="text-2xl font-bold text-green-900">{selectedParent.activeChildren}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-3">
                                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                        View Full Profile
                                    </button>
                                    <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                                        Send Message
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};