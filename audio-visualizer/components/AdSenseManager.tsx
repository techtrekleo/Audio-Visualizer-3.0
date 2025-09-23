import React from 'react';
import GoogleAdSense from './GoogleAdSense';
import { getAdsByPosition, isAdSenseConfigured } from '../constants/adsenseConfig';

interface AdSenseManagerProps {
    position: 'top' | 'sidebar' | 'bottom' | 'content';
    className?: string;
}

const AdSenseManager: React.FC<AdSenseManagerProps> = ({ position, className = '' }) => {
    // 檢查是否已配置 AdSense
    if (!isAdSenseConfigured()) {
        return (
            <div className={`adsense-placeholder ${className}`}>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-gray-400 text-sm mb-2">
                        📢 Google AdSense 廣告位
                    </div>
                    <div className="text-gray-500 text-xs">
                        請在 adsenseConfig.ts 中配置你的廣告單元
                    </div>
                </div>
            </div>
        );
    }

    const ads = getAdsByPosition(position);

    if (ads.length === 0) {
        return null;
    }

    return (
        <div className={`adsense-manager ${className}`}>
            {ads.map(ad => (
                <GoogleAdSense
                    key={ad.id}
                    adSlot={ad.adSlot}
                    adFormat={ad.adFormat}
                    responsive={ad.responsive}
                    className="mb-4"
                />
            ))}
        </div>
    );
};

export default AdSenseManager;

