import { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  onSkip: () => void;
  quotaExceeded: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onSave,
  onSkip,
  quotaExceeded,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('請輸入有效的 API Key');
      return;
    }

    if (apiKey.length < 20) {
      setError('API Key 格式似乎不正確，請檢查');
      return;
    }

    onSave(apiKey.trim());
    setApiKey('');
    setError('');
  };

  const handleSkip = () => {
    setApiKey('');
    setError('');
    onSkip();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-3xl">🔑</span>
            {quotaExceeded ? 'API 配額已用完' : '需要 API Key'}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {quotaExceeded && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">
                ⚠️ 內建的 Gemini API 配額已用完。請輸入您自己的 API Key 以繼續使用翻譯功能。
              </p>
            </div>
          )}

          <div>
            <p className="text-gray-700 mb-4">
              本工具使用 Google Gemini API 進行字幕翻譯。請輸入您的 API Key：
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2 text-sm font-semibold">
                  Gemini API Key
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setError('');
                  }}
                  placeholder="AIza..."
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                {error && (
                  <p className="mt-2 text-red-400 text-sm">{error}</p>
                )}
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm mb-2 font-semibold">
                  如何獲取 API Key？
                </p>
                <ol className="text-gray-700 text-sm space-y-1 list-decimal list-inside">
                  <li>訪問 <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a></li>
                  <li>登入您的 Google 帳號</li>
                  <li>點擊 "Create API Key"</li>
                  <li>複製生成的 API Key 並貼上到上方輸入框</li>
                </ol>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-sm flex items-start gap-2">
                  <span className="text-lg">🔒</span>
                  <span>
                    <strong>隱私保護：</strong>您的 API Key 僅存儲在瀏覽器本地（localStorage），不會上傳到任何服務器。我們不會收集或存儲您的 API Key。
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex gap-3 justify-end">
          <button
            onClick={handleSkip}
            className="px-6 py-3 bg-gray-700 text-gray-800 rounded-lg hover:bg-gray-600 transition-colors duration-300 font-semibold"
          >
            稍後再說
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-gray-800 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg"
          >
            保存並繼續
          </button>
        </div>
      </div>
    </div>
  );
};

