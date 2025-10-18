import React, { useState, useEffect } from 'react';
import type { SavedPreset, TextBlock, CanvasSizeId, ChineseFrameId } from '../types';

interface PresetManagerProps {
  textBlocks: TextBlock[];
  backgroundImage: string | null;
  canvasSizeId: CanvasSizeId;
  selectedTextBlockId: string | null;
  chineseFrameId: ChineseFrameId;
  onLoadPreset: (preset: SavedPreset) => void;
}

export const PresetManager: React.FC<PresetManagerProps> = ({
  textBlocks,
  backgroundImage,
  canvasSizeId,
  selectedTextBlockId,
  chineseFrameId,
  onLoadPreset
}) => {
  const [presets, setPresets] = useState<SavedPreset[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  // 載入已保存的預設
  useEffect(() => {
    const savedPresets = localStorage.getItem('font-effects-presets');
    if (savedPresets) {
      try {
        setPresets(JSON.parse(savedPresets));
      } catch (error) {
        console.error('載入預設失敗:', error);
      }
    }
  }, []);

  // 保存預設到 localStorage
  const savePresets = (newPresets: SavedPreset[]) => {
    try {
      const dataString = JSON.stringify(newPresets);
      localStorage.setItem('font-effects-presets', dataString);
      setPresets(newPresets);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // 存儲空間不足，清理舊數據
        console.warn('存儲空間不足，正在清理舊預設...');
        
        // 按創建時間排序，保留最新的10個預設
        const sortedPresets = newPresets.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const limitedPresets = sortedPresets.slice(0, 10);
        
        try {
          localStorage.setItem('font-effects-presets', JSON.stringify(limitedPresets));
          setPresets(limitedPresets);
          alert('存儲空間不足，已自動清理舊預設，保留最新10個預設。');
        } catch (secondError) {
          console.error('清理後仍無法保存:', secondError);
          alert('存儲空間嚴重不足，無法保存預設。請清理瀏覽器數據或使用其他瀏覽器。');
        }
      } else {
        console.error('保存預設失敗:', error);
        alert('保存預設失敗，請重試。');
      }
    }
  };

  // 保存當前設定
  const handleSavePreset = () => {
    if (!presetName.trim()) {
      alert('請輸入預設名稱');
      return;
    }

    const newPreset: SavedPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      createdAt: new Date().toISOString(),
      canvasSizeId,
      backgroundImage,
      textBlocks: [...textBlocks],
      selectedTextBlockId,
      chineseFrameId
    };

    const updatedPresets = [...presets, newPreset];
    savePresets(updatedPresets);
    
    setPresetName('');
    setShowSaveDialog(false);
    alert('預設已保存！');
  };

  // 載入預設
  const handleLoadPreset = (preset: SavedPreset) => {
    onLoadPreset(preset);
    setShowLoadDialog(false);
  };

  // 刪除預設
  const handleDeletePreset = (presetId: string) => {
    if (confirm('確定要刪除這個預設嗎？')) {
      const updatedPresets = presets.filter(p => p.id !== presetId);
      savePresets(updatedPresets);
    }
  };

  // 清理所有預設
  const handleClearAllPresets = () => {
    if (confirm('確定要刪除所有預設嗎？此操作無法復原。')) {
      localStorage.removeItem('font-effects-presets');
      setPresets([]);
      alert('所有預設已清除！');
    }
  };

  // 獲取存儲使用情況
  const getStorageUsage = () => {
    try {
      const data = localStorage.getItem('font-effects-presets');
      if (data) {
        const sizeInBytes = new Blob([data]).size;
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);
        return `${sizeInKB} KB`;
      }
      return '0 KB';
    } catch (error) {
      return '無法計算';
    }
  };

  return (
    <div className="space-y-4">
      {/* 保存和載入按鈕 */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          💾 保存預設
        </button>
        <button
          onClick={() => setShowLoadDialog(true)}
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          📂 載入預設
        </button>
      </div>

      {/* 存儲管理 */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">存儲使用情況</span>
          <span className="text-sm font-mono text-yellow-400">{getStorageUsage()}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClearAllPresets}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-3 rounded transition"
          >
            🗑️ 清理所有預設
          </button>
          <button
            onClick={() => {
              // 自動清理舊預設，保留最新5個
              const sortedPresets = presets.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              const limitedPresets = sortedPresets.slice(0, 5);
              savePresets(limitedPresets);
            }}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold py-2 px-3 rounded transition"
          >
            🔄 自動清理
          </button>
        </div>
      </div>

      {/* 保存對話框 */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]" style={{ zIndex: 99999 }}>
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4 relative" style={{ zIndex: 99999 }}>
            <h3 className="text-xl font-bold text-white mb-4">保存預設</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  預設名稱
                </label>
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="輸入預設名稱..."
                  className="w-full p-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSavePreset}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setPresetName('');
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 載入對話框 */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]" style={{ zIndex: 99999 }}>
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden relative" style={{ zIndex: 99999 }}>
            <h3 className="text-xl font-bold text-white mb-4">載入預設</h3>
            
            {presets.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-lg">還沒有保存的預設</p>
                <p className="text-sm mt-2">請先保存一個預設</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto relative z-10">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="bg-gray-700 p-4 rounded-lg border border-gray-600"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{preset.name}</h4>
                        <p className="text-sm text-gray-400">
                          保存時間: {new Date(preset.createdAt).toLocaleString('zh-TW')}
                        </p>
                        <p className="text-xs text-gray-500">
                          畫布: {preset.canvasSizeId} | 文字區塊: {preset.textBlocks.length} | 
                          {preset.backgroundImage ? ' 有背景圖' : ' 無背景圖'}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleLoadPreset(preset)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition"
                        >
                          載入
                        </button>
                        <button
                          onClick={() => handleDeletePreset(preset.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition"
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowLoadDialog(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
