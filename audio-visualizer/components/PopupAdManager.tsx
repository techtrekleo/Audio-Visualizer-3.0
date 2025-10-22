import React, { useState, useEffect, useCallback } from 'react';
import PopupAd from './PopupAd';
import { getPopupAdsByTrigger, AD_DISPLAY_STRATEGY } from '../constants/adConfigs';
import { AdConfig } from './AdBanner';

interface PopupAdManagerProps {
    triggerCondition: 'recording-complete' | 'first-visit' | 'after-usage' | 'manual';
    onClose?: () => void;
}

const PopupAdManager: React.FC<PopupAdManagerProps> = ({ 
    triggerCondition, 
    onClose 
}) => {
    const [currentAd, setCurrentAd] = useState<AdConfig | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [lastPopupTime, setLastPopupTime] = useState<number>(0);

    // 根據觸發條件獲取對應的彈出廣告
    const getAdForTrigger = useCallback(() => {
        const ads = getPopupAdsByTrigger(triggerCondition);
        if (ads.length === 0) return null;
        
        // 隨機選擇一個廣告
        const randomIndex = Math.floor(Math.random() * ads.length);
        return ads[randomIndex];
    }, [triggerCondition]);

    // 檢查是否可以顯示彈出廣告
    const canShowPopup = useCallback(() => {
        const now = Date.now();
        const timeSinceLastPopup = now - lastPopupTime;
        
        // 檢查冷卻時間
        if (timeSinceLastPopup < AD_DISPLAY_STRATEGY.popup.cooldown) {
            return false;
        }
        
        return true;
    }, [lastPopupTime]);

    // 顯示彈出廣告
    const showPopup = useCallback(() => {
        if (!canShowPopup()) return;
        
        const ad = getAdForTrigger();
        if (ad) {
            setCurrentAd(ad);
            setIsVisible(true);
            setLastPopupTime(Date.now());
        }
    }, [canShowPopup, getAdForTrigger]);

    // 隱藏彈出廣告
    const hidePopup = useCallback(() => {
        setIsVisible(false);
        onClose?.();
    }, [onClose]);

    // 根據觸發條件自動顯示廣告
    useEffect(() => {
        if (triggerCondition === 'first-visit') {
            // 檢查是否是第一次訪問
            const hasVisited = localStorage.getItem('hasVisited');
            if (!hasVisited) {
                localStorage.setItem('hasVisited', 'true');
                // 延遲顯示，讓用戶先看到頁面
                const timer = setTimeout(() => {
                    showPopup();
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [triggerCondition, showPopup]);

    // 手動觸發彈出廣告（供外部調用）
    const triggerPopup = useCallback(() => {
        showPopup();
    }, [showPopup]);

    // 暴露給父組件的方法
    // React.useImperativeHandle(React.useRef(), () => ({
    //     triggerPopup
    // }));

    if (!currentAd || !isVisible) return null;

    return (
        <PopupAd
            config={currentAd}
            isVisible={isVisible}
            onClose={hidePopup}
            triggerCondition={triggerCondition}
        />
    );
};

export default PopupAdManager;

