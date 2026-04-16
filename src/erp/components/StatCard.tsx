import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    className = ''
}) => {
    return (
        <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${className}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                            <span className={`mr-1 ${trend.isPositive ? 'rotate-0' : 'rotate-180'}`}>
                                ▲
                            </span>
                            {Math.abs(trend.value)}% from last month
                        </div>
                    )}
                </div>
                <div className="bg-blue-50 p-3 rounded-xl">
                    <Icon className="h-6 w-6 text-blue-600" />
                </div>
            </div>
        </div>
    );
};