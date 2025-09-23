import React, { useState, useEffect } from 'react';
import { getAllAdMetrics, getOverallAdMetrics, exportAdData, clearAdData } from '../utils/adAnalytics';

interface AdDashboardProps {
    isVisible: boolean;
    onClose: () => void;
}

const AdDashboard: React.FC<AdDashboardProps> = ({ isVisible, onClose }) => {
    const [metrics, setMetrics] = useState<Record<string, any>>({});
    const [overall, setOverall] = useState<any>({});
    const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'export'>('overview');

    useEffect(() => {
        if (isVisible) {
            loadMetrics();
        }
    }, [isVisible]);

    const loadMetrics = () => {
        const allMetrics = getAllAdMetrics();
        const overallMetrics = getOverallAdMetrics();
        setMetrics(allMetrics);
        setOverall(overallMetrics);
    };

    const handleExport = () => {
        const data = exportAdData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ad-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClearData = () => {
        if (window.confirm('確定要清除所有廣告數據嗎？此操作無法撤銷。')) {
            clearAdData();
            loadMetrics();
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* 標題欄 */}
                <div className="bg-gray-700 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">📊 廣告效果儀表板</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 標籤頁 */}
                <div className="border-b border-gray-600">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'overview', label: '總覽', icon: '📈' },
                            { id: 'details', label: '詳細數據', icon: '📊' },
                            { id: 'export', label: '匯出', icon: '💾' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-cyan-500 text-cyan-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-300'
                                }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* 內容區域 */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* 總體指標 */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-gray-700 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-cyan-400">{overall.totalAds || 0}</div>
                                    <div className="text-sm text-gray-400">總廣告數</div>
                                </div>
                                <div className="bg-gray-700 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-400">{overall.totalImpressions || 0}</div>
                                    <div className="text-sm text-gray-400">總展示次數</div>
                                </div>
                                <div className="bg-gray-700 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-400">{overall.totalClicks || 0}</div>
                                    <div className="text-sm text-gray-400">總點擊次數</div>
                                </div>
                                <div className="bg-gray-700 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-purple-400">{overall.totalConversions || 0}</div>
                                    <div className="text-sm text-gray-400">總轉換次數</div>
                                </div>
                            </div>

                            {/* 轉換率 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-700 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-white mb-2">點擊率 (CTR)</h3>
                                    <div className="text-3xl font-bold text-cyan-400">
                                        {(overall.overallCTR || 0).toFixed(2)}%
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">
                                        點擊次數 / 展示次數
                                    </div>
                                </div>
                                <div className="bg-gray-700 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-white mb-2">轉換率</h3>
                                    <div className="text-3xl font-bold text-green-400">
                                        {(overall.overallConversionRate || 0).toFixed(2)}%
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">
                                        轉換次數 / 點擊次數
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white mb-4">各廣告詳細數據</h3>
                            {Object.entries(metrics).map(([adId, adMetrics]) => (
                                <div key={adId} className="bg-gray-700 rounded-lg p-4">
                                    <h4 className="font-semibold text-white mb-3">{adId}</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <div className="text-gray-400">展示次數</div>
                                            <div className="text-white font-semibold">{adMetrics.impressions}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400">點擊次數</div>
                                            <div className="text-white font-semibold">{adMetrics.clicks}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400">關閉次數</div>
                                            <div className="text-white font-semibold">{adMetrics.closes}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400">轉換次數</div>
                                            <div className="text-white font-semibold">{adMetrics.conversions}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                                        <div>
                                            <div className="text-gray-400">點擊率</div>
                                            <div className="text-cyan-400 font-semibold">{adMetrics.ctr.toFixed(2)}%</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400">轉換率</div>
                                            <div className="text-green-400 font-semibold">{adMetrics.conversionRate.toFixed(2)}%</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'export' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-white mb-4">數據匯出與管理</h3>
                                <p className="text-gray-400 mb-6">
                                    匯出廣告數據進行進一步分析，或清除所有數據重新開始
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={handleExport}
                                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                                >
                                    <span>💾</span>
                                    <span>匯出數據</span>
                                </button>
                                
                                <button
                                    onClick={handleClearData}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                                >
                                    <span>🗑️</span>
                                    <span>清除數據</span>
                                </button>
                            </div>
                            
                            <div className="bg-yellow-500/10 border border-yellow-400 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <span className="text-yellow-400 text-lg">⚠️</span>
                                    <div className="text-yellow-200 text-sm">
                                        <p className="font-semibold mb-1">注意事項：</p>
                                        <ul className="space-y-1">
                                            <li>• 匯出的數據包含所有廣告互動記錄</li>
                                            <li>• 清除數據後無法恢復</li>
                                            <li>• 建議定期匯出數據進行備份</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdDashboard;

