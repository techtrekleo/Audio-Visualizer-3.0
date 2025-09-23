import React, { useState, useEffect } from 'react';
import AdBanner, { AdConfig } from './AdBanner';

interface PopupAdProps {
    config: AdConfig;
    isVisible: boolean;
    onClose: () => void;
    triggerCondition?: 'recording-complete' | 'first-visit' | 'after-usage' | 'manual';
    className?: string;
}

const PopupAd: React.FC<PopupAdProps> = ({ 
    config, 
    isVisible, 
    onClose, 
    triggerCondition = 'manual',
    className = '' 
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setIsAnimating(true);
            // 自動關閉計時器（如果配置了）
            if (config.autoHide && config.autoHideDelay) {
                const timer = setTimeout(() => {
                    onClose();
                }, config.autoHideDelay);
                return () => clearTimeout(timer);
            }
        }
    }, [isVisible, config.autoHide, config.autoHideDelay, onClose]);

    if (!isVisible) return null;

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            onClose();
        }, 300); // 動畫完成後關閉
    };

    return (
        <>
            {/* 背景遮罩 */}
            <div 
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
                    isAnimating ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={handleClose}
            />
            
            {/* 彈出廣告 */}
            <div 
                className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${
                    isAnimating 
                        ? 'scale-100 opacity-100' 
                        : 'scale-95 opacity-0'
                } ${className}`}
            >
                <AdBanner
                    config={{
                        ...config,
                        type: 'popup',
                        showCloseButton: true
                    }}
                    onClose={handleClose}
                />
            </div>
        </>
    );
};

export default PopupAd;

