import React from 'react';
import { motion } from 'framer-motion';
import { type LucideIcon, ChevronRight } from 'lucide-react';

interface ResourceCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    onClick: () => void;
    isExpanded?: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
    icon: Icon,
    title,
    description,
    onClick,
    isExpanded = false
}) => {
    return (
        <div className="resource-card-container">
            <button
                onClick={onClick}
                className="resource-card w-100 border-0 text-start cursor-pointer"
            >
                <div className="icon-box-primary">
                    <Icon size={20} />
                </div>
                <div className="flex-grow-1">
                    <div className="fw-bold text-primary">{title}</div>
                    <div className="text-secondary small">{description}</div>
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronRight size={16} className="text-secondary rotate-90" />
                </motion.div>
            </button>
        </div>
    );
};

export default ResourceCard;
