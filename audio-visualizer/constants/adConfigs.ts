import { AdConfig } from '../components/AdBanner';

// 廣告配置集合
export const AD_CONFIGS: Record<string, AdConfig> = {
    // 頂部橫幅廣告
    'top-banner-premium': {
        id: 'top-banner-premium',
        type: 'banner',
        title: '🎵 升級到專業版',
        description: '解鎖更多視覺化效果和無限制錄製功能',
        linkUrl: '#premium',
        buttonText: '立即升級',
        backgroundColor: '#1e40af',
        textColor: '#ffffff',
        showCloseButton: true,
        autoHide: false
    },

    'top-banner-new-features': {
        id: 'top-banner-new-features',
        type: 'banner',
        title: '🚀 新功能上線',
        description: '體驗全新的水波紋和金屬花特效',
        linkUrl: '#features',
        buttonText: '立即體驗',
        backgroundColor: '#7c3aed',
        textColor: '#ffffff',
        showCloseButton: true,
        autoHide: false
    },

    // 側邊欄廣告
    'sidebar-premium-pack': {
        id: 'sidebar-premium-pack',
        type: 'sidebar',
        title: '🌟 專業特效包',
        description: '包含金屬花、水波紋等獨家視覺化效果',
        linkUrl: '#premium-pack',
        buttonText: '了解更多',
        backgroundColor: '#7c3aed',
        textColor: '#ffffff',
        showCloseButton: true,
        autoHide: false
    },

    'sidebar-tutorial': {
        id: 'sidebar-tutorial',
        type: 'sidebar',
        title: '📚 使用教學',
        description: '學習如何創建專業的音樂視覺化影片',
        linkUrl: '#tutorial',
        buttonText: '觀看教學',
        backgroundColor: '#059669',
        textColor: '#ffffff',
        showCloseButton: true,
        autoHide: false
    },

    // 底部廣告
    'footer-support': {
        id: 'footer-support',
        type: 'footer',
        title: '💝 支持我們',
        description: '喜歡這個工具？請給我們一個星星或贊助',
        linkUrl: 'https://github.com',
        buttonText: '支持項目',
        backgroundColor: '#059669',
        textColor: '#ffffff',
        showCloseButton: false,
        autoHide: false
    },

    'footer-community': {
        id: 'footer-community',
        type: 'footer',
        title: '👥 加入社群',
        description: '與其他創作者交流，分享你的作品',
        linkUrl: '#community',
        buttonText: '加入社群',
        backgroundColor: '#dc2626',
        textColor: '#ffffff',
        showCloseButton: false,
        autoHide: false
    },

    // 彈出式廣告
    'popup-recording-complete': {
        id: 'popup-recording-complete',
        type: 'popup',
        title: '🎉 錄製完成！',
        description: '你的音樂視覺化影片已準備就緒，想要更多特效嗎？',
        linkUrl: '#premium',
        buttonText: '解鎖更多特效',
        backgroundColor: '#1e40af',
        textColor: '#ffffff',
        showCloseButton: true,
        autoHide: true,
        autoHideDelay: 8000
    },

    'popup-first-visit': {
        id: 'popup-first-visit',
        type: 'popup',
        title: '👋 歡迎使用！',
        description: '這是你的第一次訪問，讓我們帶你了解所有功能',
        linkUrl: '#tutorial',
        buttonText: '開始導覽',
        backgroundColor: '#059669',
        textColor: '#ffffff',
        showCloseButton: true,
        autoHide: true,
        autoHideDelay: 10000
    },

    'popup-usage-reminder': {
        id: 'popup-usage-reminder',
        type: 'popup',
        title: '💡 使用提醒',
        description: '記得保存你的作品，升級到專業版可獲得無限儲存空間',
        linkUrl: '#premium',
        buttonText: '升級專業版',
        backgroundColor: '#7c3aed',
        textColor: '#ffffff',
        showCloseButton: true,
        autoHide: true,
        autoHideDelay: 6000
    }
};

// 根據位置獲取廣告配置
export const getAdsByType = (type: AdConfig['type']): AdConfig[] => {
    return Object.values(AD_CONFIGS).filter(ad => ad.type === type);
};

// 根據觸發條件獲取彈出廣告
export const getPopupAdsByTrigger = (trigger: string): AdConfig[] => {
    const popupAds = getAdsByType('popup');
    return popupAds.filter(ad => ad.id.includes(trigger));
};

// 隨機選擇廣告
export const getRandomAd = (type: AdConfig['type']): AdConfig | null => {
    const ads = getAdsByType(type);
    if (ads.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * ads.length);
    return ads[randomIndex];
};

// 廣告顯示策略
export const AD_DISPLAY_STRATEGY = {
    // 頂部橫幅：最多顯示1個
    banner: {
        maxCount: 1,
        rotation: true, // 是否輪播
        rotationInterval: 30000 // 輪播間隔（毫秒）
    },
    
    // 側邊欄：最多顯示2個
    sidebar: {
        maxCount: 2,
        rotation: false
    },
    
    // 底部：最多顯示1個
    footer: {
        maxCount: 1,
        rotation: true,
        rotationInterval: 45000
    },
    
    // 彈出式：根據觸發條件顯示
    popup: {
        maxCount: 1,
        cooldown: 300000 // 彈出間隔（5分鐘）
    }
};

