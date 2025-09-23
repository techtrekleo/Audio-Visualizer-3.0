// 廣告分析追蹤系統
export interface AdEvent {
    adId: string;
    eventType: 'impression' | 'click' | 'close' | 'conversion';
    timestamp: number;
    userId?: string;
    sessionId: string;
    userAgent: string;
    referrer: string;
}

export interface AdMetrics {
    adId: string;
    impressions: number;
    clicks: number;
    closes: number;
    conversions: number;
    ctr: number; // Click-through rate
    conversionRate: number;
}

class AdAnalytics {
    private sessionId: string;
    private events: AdEvent[] = [];
    private isInitialized = false;

    constructor() {
        this.sessionId = this.generateSessionId();
        this.init();
    }

    private init() {
        if (this.isInitialized) return;
        
        // 從 localStorage 恢復數據
        this.loadEvents();
        
        // 設置頁面卸載時的保存
        window.addEventListener('beforeunload', () => {
            this.saveEvents();
        });
        
        this.isInitialized = true;
    }

    private generateSessionId(): string {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    private generateUserId(): string {
        let userId = localStorage.getItem('ad_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('ad_user_id', userId);
        }
        return userId;
    }

    // 記錄廣告事件
    trackEvent(adId: string, eventType: AdEvent['eventType']) {
        const event: AdEvent = {
            adId,
            eventType,
            timestamp: Date.now(),
            userId: this.generateUserId(),
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            referrer: document.referrer || 'direct'
        };

        this.events.push(event);
        this.saveEvents();

        // 發送到分析服務（如果配置了）
        this.sendToAnalytics(event);

        console.log(`Ad Event: ${eventType} for ${adId}`, event);
    }

    // 記錄廣告展示
    trackImpression(adId: string) {
        this.trackEvent(adId, 'impression');
    }

    // 記錄廣告點擊
    trackClick(adId: string) {
        this.trackEvent(adId, 'click');
    }

    // 記錄廣告關閉
    trackClose(adId: string) {
        this.trackEvent(adId, 'close');
    }

    // 記錄轉換（如購買、註冊等）
    trackConversion(adId: string) {
        this.trackEvent(adId, 'conversion');
    }

    // 獲取廣告指標
    getAdMetrics(adId: string): AdMetrics {
        const adEvents = this.events.filter(event => event.adId === adId);
        
        const impressions = adEvents.filter(e => e.eventType === 'impression').length;
        const clicks = adEvents.filter(e => e.eventType === 'click').length;
        const closes = adEvents.filter(e => e.eventType === 'close').length;
        const conversions = adEvents.filter(e => e.eventType === 'conversion').length;

        return {
            adId,
            impressions,
            clicks,
            closes,
            conversions,
            ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
            conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0
        };
    }

    // 獲取所有廣告指標
    getAllMetrics(): Record<string, AdMetrics> {
        const adIds = [...new Set(this.events.map(e => e.adId))];
        const metrics: Record<string, AdMetrics> = {};
        
        adIds.forEach(adId => {
            metrics[adId] = this.getAdMetrics(adId);
        });
        
        return metrics;
    }

    // 獲取總體指標
    getOverallMetrics() {
        const allMetrics = this.getAllMetrics();
        const totalImpressions = Object.values(allMetrics).reduce((sum, m) => sum + m.impressions, 0);
        const totalClicks = Object.values(allMetrics).reduce((sum, m) => sum + m.clicks, 0);
        const totalConversions = Object.values(allMetrics).reduce((sum, m) => sum + m.conversions, 0);

        return {
            totalAds: Object.keys(allMetrics).length,
            totalImpressions,
            totalClicks,
            totalConversions,
            overallCTR: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
            overallConversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
        };
    }

    // 導出數據
    exportData(): string {
        return JSON.stringify({
            events: this.events,
            metrics: this.getAllMetrics(),
            overall: this.getOverallMetrics(),
            exportTime: new Date().toISOString()
        }, null, 2);
    }

    // 清除數據
    clearData() {
        this.events = [];
        localStorage.removeItem('ad_events');
        localStorage.removeItem('ad_user_id');
        console.log('Ad analytics data cleared');
    }

    // 保存事件到 localStorage
    private saveEvents() {
        try {
            localStorage.setItem('ad_events', JSON.stringify(this.events));
        } catch (error) {
            console.warn('Failed to save ad events to localStorage:', error);
        }
    }

    // 從 localStorage 加載事件
    private loadEvents() {
        try {
            const saved = localStorage.getItem('ad_events');
            if (saved) {
                this.events = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load ad events from localStorage:', error);
        }
    }

    // 發送到外部分析服務
    private sendToAnalytics(event: AdEvent) {
        // 這裡可以集成 Google Analytics、Mixpanel 等服務
        // 例如：
        // if (window.gtag) {
        //     window.gtag('event', 'ad_event', {
        //         ad_id: event.adId,
        //         event_type: event.eventType,
        //         value: 1
        //     });
        // }
    }
}

// 創建單例實例
export const adAnalytics = new AdAnalytics();

// 導出便捷函數
export const trackAdImpression = (adId: string) => adAnalytics.trackImpression(adId);
export const trackAdClick = (adId: string) => adAnalytics.trackClick(adId);
export const trackAdClose = (adId: string) => adAnalytics.trackClose(adId);
export const trackAdConversion = (adId: string) => adAnalytics.trackConversion(adId);
export const getAdMetrics = (adId: string) => adAnalytics.getAdMetrics(adId);
export const getAllAdMetrics = () => adAnalytics.getAllMetrics();
export const getOverallAdMetrics = () => adAnalytics.getOverallMetrics();
export const exportAdData = () => adAnalytics.exportData();
export const clearAdData = () => adAnalytics.clearData();

