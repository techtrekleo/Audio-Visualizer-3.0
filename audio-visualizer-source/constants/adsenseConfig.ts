// Google AdSense 配置
export interface AdSenseConfig {
    id: string;
    name: string;
    adSlot: string;
    adFormat: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
    position: 'top' | 'sidebar' | 'bottom' | 'content';
    responsive: boolean;
    enabled: boolean;
}

// 廣告單元配置
export const ADSENSE_CONFIGS: AdSenseConfig[] = [
    // 頂部橫幅廣告
    {
        id: 'top-banner',
        name: '頂部橫幅廣告',
        adSlot: 'YOUR_TOP_BANNER_SLOT', // 替換為你的廣告單元 ID
        adFormat: 'horizontal',
        position: 'top',
        responsive: true,
        enabled: true
    },
    
    // 側邊欄廣告
    {
        id: 'sidebar-ad',
        name: '側邊欄廣告',
        adSlot: 'YOUR_SIDEBAR_SLOT', // 替換為你的廣告單元 ID
        adFormat: 'vertical',
        position: 'sidebar',
        responsive: false,
        enabled: true
    },
    
    // 底部橫幅廣告
    {
        id: 'bottom-banner',
        name: '底部橫幅廣告',
        adSlot: 'YOUR_BOTTOM_BANNER_SLOT', // 替換為你的廣告單元 ID
        adFormat: 'horizontal',
        position: 'bottom',
        responsive: true,
        enabled: true
    },
    
    // 內容區域廣告
    {
        id: 'content-ad',
        name: '內容區域廣告',
        adSlot: 'YOUR_CONTENT_SLOT', // 替換為你的廣告單元 ID
        adFormat: 'rectangle',
        position: 'content',
        responsive: true,
        enabled: true
    }
];

// 根據位置獲取廣告配置
export const getAdsByPosition = (position: AdSenseConfig['position']): AdSenseConfig[] => {
    return ADSENSE_CONFIGS.filter(ad => ad.position === position && ad.enabled);
};

// 獲取所有啟用的廣告
export const getEnabledAds = (): AdSenseConfig[] => {
    return ADSENSE_CONFIGS.filter(ad => ad.enabled);
};

// 檢查是否已配置 AdSense
export const isAdSenseConfigured = (): boolean => {
    return ADSENSE_CONFIGS.some(ad => 
        ad.enabled && 
        ad.adSlot !== 'YOUR_TOP_BANNER_SLOT' && 
        ad.adSlot !== 'YOUR_SIDEBAR_SLOT' &&
        ad.adSlot !== 'YOUR_BOTTOM_BANNER_SLOT' &&
        ad.adSlot !== 'YOUR_CONTENT_SLOT'
    );
};

