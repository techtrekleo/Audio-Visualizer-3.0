import React, { useState } from 'react';
import Icon from './Icon';
import { ICON_PATHS } from '../constants';

interface CollapsibleControlSectionProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    defaultExpanded?: boolean;
    icon?: string;
    badge?: string;
    priority?: 'high' | 'medium' | 'low';
}

const CollapsibleControlSection: React.FC<CollapsibleControlSectionProps> = ({
    title,
    children,
    className = '',
    defaultExpanded = false,
    icon,
    badge,
    priority = 'medium'
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const priorityStyles = {
        high: { borderLeft: '4px solid #8B9DC3', background: 'linear-gradient(to right, rgba(139, 157, 195, 0.1), transparent)' },
        medium: { borderLeft: '4px solid #9CA3AF', background: 'linear-gradient(to right, rgba(156, 163, 175, 0.1), transparent)' },
        low: { borderLeft: '4px solid #A8B5C4', background: 'linear-gradient(to right, rgba(168, 181, 196, 0.1), transparent)' }
    };

    const priorityIcons = {
        high: ICON_PATHS.STAR,
        medium: ICON_PATHS.SETTINGS,
        low: ICON_PATHS.ADVANCED
    };

    return (
        <div className={`backdrop-blur-sm rounded-xl border ${className}`} style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(139, 157, 195, 0.3)', ...priorityStyles[priority] }}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between transition-colors duration-200 rounded-t-xl"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(139, 157, 195, 0.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                }}
            >
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        {icon && <Icon path={icon} className="w-5 h-5" style={{ color: '#8B9DC3' }} />}
                        {!icon && <Icon path={priorityIcons[priority]} className="w-5 h-5" style={{ color: '#8B9DC3' }} />}
                        <h3 className="text-lg font-semibold" style={{ color: '#4A4A4A' }}>{title}</h3>
                        {badge && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: 'rgba(139, 157, 195, 0.2)', color: '#4A4A4A' }}>
                                {badge}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Icon 
                        path={isExpanded ? ICON_PATHS.CHEVRON_UP : ICON_PATHS.CHEVRON_DOWN} 
                        className="w-5 h-5 transition-transform duration-200"
                        style={{ color: '#6B7280' }}
                    />
                </div>
            </button>
            
            <div className={`collapsible-content ${
                isExpanded ? 'expanded' : 'collapsed'
            }`}>
                <div className="p-4 pt-0">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default CollapsibleControlSection;
