import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { ICON_PATHS } from '../constants';
import { SettingsManager, SavedSettings } from '../utils/settingsManager';

interface SettingsManagerComponentProps {
    onLoadSettings: (settings: Partial<SavedSettings>) => void;
    currentSettings: Partial<SavedSettings>;
}

const SettingsManagerComponent: React.FC<SettingsManagerComponentProps> = ({
    onLoadSettings,
    currentSettings
}) => {
    const [presetName, setPresetName] = useState('');
    const [presetNames, setPresetNames] = useState<string[]>([]);
    const [showImportExport, setShowImportExport] = useState(false);
    const [importText, setImportText] = useState('');
    const [exportText, setExportText] = useState('');

    useEffect(() => {
        setPresetNames(SettingsManager.getPresetNames());
    }, []);

    const handleSavePreset = () => {
        if (!presetName.trim()) {
            alert('請輸入預設名稱');
            return;
        }
        
        SettingsManager.savePreset(presetName, currentSettings);
        setPresetNames(SettingsManager.getPresetNames());
        setPresetName('');
        alert(`預設 "${presetName}" 已保存`);
    };

    const handleLoadPreset = (name: string) => {
        const preset = SettingsManager.loadPreset(name);
        if (preset) {
            onLoadSettings(preset);
            alert(`預設 "${name}" 已載入`);
        }
    };

    const handleDeletePreset = (name: string) => {
        if (confirm(`確定要刪除預設 "${name}" 嗎？`)) {
            SettingsManager.deletePreset(name);
            setPresetNames(SettingsManager.getPresetNames());
        }
    };

    const handleSaveCurrentSettings = () => {
        SettingsManager.saveSettings(currentSettings);
        alert('當前設置已保存');
    };

    const handleLoadSavedSettings = () => {
        const saved = SettingsManager.loadSettings();
        onLoadSettings(saved);
        alert('已載入保存的設置');
    };

    const handleClearSettings = () => {
        if (confirm('確定要清除所有保存的設置嗎？')) {
            SettingsManager.clearSettings();
            alert('所有設置已清除');
        }
    };

    const handleExportSettings = () => {
        const exported = SettingsManager.exportSettings(currentSettings);
        setExportText(exported);
        setShowImportExport(true);
    };

    const handleImportSettings = () => {
        const imported = SettingsManager.importSettings(importText);
        if (imported) {
            onLoadSettings(imported);
            setImportText('');
            setShowImportExport(false);
            alert('設置已導入');
        } else {
            alert('導入失敗，請檢查JSON格式');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('已複製到剪貼板');
        });
    };

    return (
        <div className="settings-manager-panel bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center space-x-2 mb-4">
                <Icon path={ICON_PATHS.SETTINGS} className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-gray-200">設置管理</h3>
            </div>

            <div className="space-y-4">
                {/* 保存/載入當前設置 */}
                <div className="flex space-x-2">
                    <button
                        onClick={handleSaveCurrentSettings}
                        className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        保存設置
                    </button>
                    <button
                        onClick={handleLoadSavedSettings}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        載入設置
                    </button>
                    <button
                        onClick={handleClearSettings}
                        className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        清除設置
                    </button>
                </div>

                {/* 預設管理 */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">預設管理</h4>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                            placeholder="預設名稱"
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm"
                        />
                        <button
                            onClick={handleSavePreset}
                            className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            保存預設
                        </button>
                    </div>
                    
                    {presetNames.length > 0 && (
                        <div className="space-y-1">
                            <p className="text-xs text-gray-400">已保存的預設：</p>
                            {presetNames.map((name) => (
                                <div key={name} className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleLoadPreset(name)}
                                        className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs transition-colors"
                                    >
                                        載入
                                    </button>
                                    <span className="text-sm text-gray-300 flex-1">{name}</span>
                                    <button
                                        onClick={() => handleDeletePreset(name)}
                                        className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs transition-colors"
                                    >
                                        刪除
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 導入/導出 */}
                <div className="space-y-2">
                    <div className="flex space-x-2">
                        <button
                            onClick={handleExportSettings}
                            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            導出設置
                        </button>
                        <button
                            onClick={() => setShowImportExport(!showImportExport)}
                            className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            {showImportExport ? '隱藏' : '導入/導出'}
                        </button>
                    </div>

                    {showImportExport && (
                        <div className="space-y-3">
                            {/* 導出區域 */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">導出設置 (JSON)</label>
                                <div className="relative">
                                    <textarea
                                        value={exportText}
                                        readOnly
                                        rows={4}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 text-xs font-mono"
                                        placeholder="點擊「導出設置」按鈕生成JSON"
                                    />
                                    {exportText && (
                                        <button
                                            onClick={() => copyToClipboard(exportText)}
                                            className="absolute top-2 right-2 px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs transition-colors"
                                        >
                                            複製
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* 導入區域 */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">導入設置 (JSON)</label>
                                <textarea
                                    value={importText}
                                    onChange={(e) => setImportText(e.target.value)}
                                    rows={4}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                                    placeholder="貼上JSON格式的設置..."
                                />
                                <button
                                    onClick={handleImportSettings}
                                    disabled={!importText.trim()}
                                    className="px-3 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    導入設置
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsManagerComponent;
