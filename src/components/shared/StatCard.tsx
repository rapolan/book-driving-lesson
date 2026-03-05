import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    value: string | number;
    label: string;
    onClick?: () => void;
    iconColorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    icon: Icon,
    value,
    label,
    onClick,
    iconColorClass = ""
}) => {
    return (
        <div
            className={`stat-card-modern ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <div className={`icon-box-primary icon-box-lg mb-2 ${iconColorClass}`}>
                <Icon size={24} />
            </div>
            <div className="h1 m-0">{value}</div>
            <p className="text-secondary small m-0 fw-bold text-uppercase opacity-75">{label}</p>
        </div>
    );
};

export default StatCard;
