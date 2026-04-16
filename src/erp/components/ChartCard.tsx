import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ChartCardProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    children: React.ReactNode;
    className?: string;
    height?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
    title,
    subtitle,
    icon: Icon,
    children,
    className = '',
    height = 'h-80'
}) => {
    return (
        <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    {subtitle && (
                        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                    )}
                </div>
                {Icon && (
                    <div className="bg-blue-50 p-2 rounded-lg">
                        <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                )}
            </div>
            <div className={`${height} w-full`}>
                {children}
            </div>
        </div>
    );
};