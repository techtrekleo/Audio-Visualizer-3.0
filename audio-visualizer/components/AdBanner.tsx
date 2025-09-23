import React, { useState, useEffect } from 'react';
import { trackAdImpression, trackAdClick, trackAdClose } from '../utils/adAnalytics';

export interface AdConfig {
    id: string;
    type: 'banner' | 'sidebar' | 'popup' | 'footer';
    title: string;
    description: string;
    imageUrl?: string;
    linkUrl: string;
    buttonText: string;
    backgroundColor?: string;
    textColor?: string;
    showCloseButton?: boolean;
    autoHide?: boolean;
    autoHideDelay?: number;
}

interface AdBannerProps {
    config: AdConfig;
    onClose?: (id: string) => void;
    className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ config, onClose, className = '' }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        // 記錄廣告展示
        trackAdImpression(config.id);
        
        if (config.autoHide && config.autoHideDelay) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose?.(config.id);
            }, config.autoHideDelay);
            return () => clearTimeout(timer);
        }
    }, [config.autoHide, config.autoHideDelay, config.id, onClose]);

    const handleClose = () => {
        // 記錄廣告關閉
        trackAdClose(config.id);
        setIsVisible(false);
        onClose?.(config.id);
    };

    const handleClick = () => {
        // 記錄廣告點擊
        trackAdClick(config.id);
        
        // 在新標籤頁中打開廣告連結
        window.open(config.linkUrl, '_blank', 'noopener,noreferrer');
    };

    if (!isVisible) return null;

    const baseClasses = 'relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl';
    const sizeClasses = {
        banner: 'w-full h-24',
        sidebar: 'w-64 h-48',
        popup: 'w-80 h-60',
        footer: 'w-full h-20'
    };

    return (
        <div 
            className={`${baseClasses} ${sizeClasses[config.type]} ${className}`}
            style={{
                backgroundColor: config.backgroundColor || '#1f2937',
                color: config.textColor || '#ffffff'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 背景圖片 */}
            {config.imageUrl && (
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url(${config.imageUrl})` }}
                />
            )}
            
            {/* 內容 */}
            <div className="relative z-10 p-4 h-full flex flex-col justify-between">
                <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{config.title}</h3>
                    <p className="text-sm opacity-90">{config.description}</p>
                </div>
                
                <button
                    onClick={handleClick}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 transform hover:scale-105"
                >
                    {config.buttonText}
                </button>
            </div>

            {/* 關閉按鈕 */}
            {config.showCloseButton && (
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                >
                    ×
                </button>
            )}

            {/* 懸停效果 */}
            {isHovered && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
            )}
        </div>
    );
};

export default AdBanner;
