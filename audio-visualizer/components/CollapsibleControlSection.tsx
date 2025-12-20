import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [contentMaxHeight, setContentMaxHeight] = useState<number>(0);

    const measureHeight = () => {
        const el = contentRef.current;
        if (!el) return;
        setContentMaxHeight(el.scrollHeight);
    };

    useLayoutEffect(() => {
        if (!isExpanded) {
            setContentMaxHeight(0);
            return;
        }
        measureHeight();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isExpanded, children]);

    useEffect(() => {
        if (!isExpanded) return;
        const el = contentRef.current;
        if (!el) return;

        if (typeof ResizeObserver === 'undefined') return;

        const ro = new ResizeObserver(() => measureHeight());
        ro.observe(el);
        return () => ro.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isExpanded]);

    const priorityStyles = {
        high: 'border-l-4 border-l-cyan-400 bg-gradient-to-r from-cyan-500/10 to-transparent',
        medium: 'border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-500/10 to-transparent',
        low: 'border-l-4 border-l-gray-400 bg-gradient-to-r from-gray-500/10 to-transparent'
    };

    const priorityIcons = {
        high: ICON_PATHS.STAR,
        medium: ICON_PATHS.SETTINGS,
        low: ICON_PATHS.ADVANCED
    };

    return (
        <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 ${priorityStyles[priority]} ${className}`}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors duration-200 rounded-t-xl"
            >
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        {icon && <Icon path={icon} className="w-5 h-5 text-gray-300" />}
                        {!icon && <Icon path={priorityIcons[priority]} className="w-5 h-5 text-gray-300" />}
                        <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
                        {badge && (
                            <span className="px-2 py-1 text-xs font-medium bg-cyan-500/20 text-cyan-300 rounded-full">
                                {badge}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Icon 
                        path={isExpanded ? ICON_PATHS.CHEVRON_UP : ICON_PATHS.CHEVRON_DOWN} 
                        className="w-5 h-5 text-gray-400 transition-transform duration-200" 
                    />
                </div>
            </button>
            
            <div
                className={`collapsible-content ${isExpanded ? 'expanded' : 'collapsed'}`}
                style={{
                    maxHeight: isExpanded ? `${contentMaxHeight}px` : '0px',
                }}
            >
                <div ref={contentRef} className="p-4 pt-0">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default CollapsibleControlSection;
