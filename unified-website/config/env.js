// 統一環境變數管理
// Railway 會自動注入這些環境變數

const ENV_CONFIG = {
    // YouTube Title SEO 工具
    VITE_GEMINI_API_KEY_SEO: process.env.VITE_GEMINI_API_KEY_SEO || '',
    
    // Audio Visualizer 工具  
    VITE_GEMINI_API_KEY_VISUALIZER: process.env.VITE_GEMINI_API_KEY_VISUALIZER || '',
    
    // 網站配置
    SITE_TITLE: '音樂脈動-Sonic Pulse | 三合一完整版',
    SITE_DESCRIPTION: '專業的音樂創作工具平台，提供音頻可視化、YouTube SEO 優化、字體效果生成等服務',
    
    // 工具連結配置
    TOOLS: {
        visualizer: '/tools/visualizer/',
        seo: '/tools/seo/',
        fontEffects: '/tools/font-effects/'
    }
};

// 導出配置（使用 CommonJS 語法）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ENV_CONFIG;
} else {
    window.ENV_CONFIG = ENV_CONFIG;
}
