import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AttendanceStatsCardProps {
    title: string;
    value: number | string;
    subtitle?: string;
    icon: LucideIcon;
    color: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export const AttendanceStatsCard: React.FC<AttendanceStatsCardProps> = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    trend
}) => {
    return (
        <div className={`relative overflow-hidden rounded-xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md ${color}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-gray-500">{subtitle}</p>
                    )}
                    {trend && (
                        <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                            <span className={`font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {trend.isPositive ? '+' : ''}{trend.value}%
                            </span>
                            <span className="text-gray-500 ml-1">vs yesterday</span>
                        </div>
                    )}
                </div>
                <div className="ml-4">
                    <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm">
                        <Icon className="h-6 w-6 text-current" />
                    </div>
                </div>
            </div>

            {/* Decorative background element */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full"></div>
        </div>
    );
};