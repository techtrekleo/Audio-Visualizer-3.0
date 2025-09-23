// 網站配置檔案
// 當需要更改網域時，只需要修改這裡的配置即可

const CONFIG = {
    // 主要工具連結
    tools: {
        audioVisualizer: '/audio-visualizer/',
        youtubeSEO: '/youtube-seo/',
        fontEffects: '/font-effects/'
    },
    
    // 頻道和社交連結
    social: {
        youtube: 'https://www.youtube.com/@%E9%9F%B3%E6%A8%82%E8%84%88%E5%8B%95SonicPulse',
        paypal: 'https://www.paypal.com/ncp/payment/PK49RJYSTAV6Y',
        email: 'contact@sonicpulse.com'
    },
    
    // 網站資訊
    site: {
        title: '音樂脈動-Sonic Pulse | 音樂創作工具集合',
        description: '音樂脈動-Sonic Pulse 官方網站 - 提供專業的音樂創作工具，包括音頻可視化器、YouTube SEO 優化工具等，幫助音樂創作者提升作品品質',
        domain: 'audio-visualizer-30-production.up.railway.app',
        ogImage: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        networkName: '🐱 口袋裡的貓' // 網路名字
    },
    
    // 統計資料
    stats: {
        subscribers: '100+',
        musicWorks: '50+',
        musicStyles: '18'
    }
};

// 導出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
