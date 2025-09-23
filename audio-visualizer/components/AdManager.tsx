import React, { useState, useEffect } from 'react';
import AdBanner, { AdConfig } from './AdBanner';
import { AD_CONFIGS, getAdsByType, getRandomAd, AD_DISPLAY_STRATEGY } from '../constants/adConfigs';

interface AdManagerProps {
    className?: string;
}

const AdManager: React.FC<AdManagerProps> = ({ className = '' }) => {
    const [ads, setAds] = useState<AdConfig[]>([]);
    const [closedAds, setClosedAds] = useState<Set<string>>(new Set());
    const [currentBannerAd, setCurrentBannerAd] = useState<AdConfig | null>(null);
    const [currentFooterAd, setCurrentFooterAd] = useState<AdConfig | null>(null);

    useEffect(() => {
        // 初始化廣告
        initializeAds();
    }, []);

    const initializeAds = () => {
        // 設置初始橫幅廣告
        const bannerAd = getRandomAd('banner');
        setCurrentBannerAd(bannerAd);
        
        // 設置初始底部廣告
        const footerAd = getRandomAd('footer');
        setCurrentFooterAd(footerAd);
        
        // 如果啟用輪播，設置定時器
        if (AD_DISPLAY_STRATEGY.banner.rotation) {
            const bannerTimer = setInterval(() => {
                const newBannerAd = getRandomAd('banner');
                if (newBannerAd && newBannerAd.id !== currentBannerAd?.id) {
                    setCurrentBannerAd(newBannerAd);
                }
            }, AD_DISPLAY_STRATEGY.banner.rotationInterval);
            
            return () => clearInterval(bannerTimer);
        }
    };

    const handleAdClose = (adId: string) => {
        setClosedAds(prev => new Set(prev).add(adId));
    };

    const handleAdClick = (adId: string) => {
        // 這裡可以添加點擊追蹤邏輯
        console.log(`Ad clicked: ${adId}`);
        
        // 可以發送到分析服務
        // analytics.track('ad_click', { adId, timestamp: Date.now() });
    };



    const renderTopBanner = () => {
        if (!currentBannerAd || closedAds.has(currentBannerAd.id)) return null;

        return (
            <div className="w-full mb-4">
                <AdBanner
                    key={currentBannerAd.id}
                    config={currentBannerAd}
                    onClose={handleAdClose}
                    className="mb-2"
                />
            </div>
        );
    };

    const renderSidebar = () => {
        const sidebarAds = getAdsByType('sidebar').filter(ad => !closedAds.has(ad.id));
        if (sidebarAds.length === 0) return null;

        // 限制顯示數量
        const visibleSidebarAds = sidebarAds.slice(0, AD_DISPLAY_STRATEGY.sidebar.maxCount);

        return (
            <div className="w-64 ml-4 space-y-4">
                {visibleSidebarAds.map(ad => (
                    <AdBanner
                        key={ad.id}
                        config={ad}
                        onClose={handleAdClose}
                    />
                ))}
            </div>
        );
    };

    const renderFooter = () => {
        if (!currentFooterAd || closedAds.has(currentFooterAd.id)) return null;

        return (
            <div className="w-full mb-4">
                <AdBanner
                    key={currentFooterAd.id}
                    config={currentFooterAd}
                    onClose={handleAdClose}
                />
            </div>
        );
    };

    return (
        <>
            {/* 頂部橫幅廣告 */}
            {renderTopBanner()}
            
            {/* 底部廣告 */}
            {renderFooter()}
        </>
    );
};

export default AdManager;
