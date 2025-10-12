import React, { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  onSkip: () => void;
  title?: string;
  message?: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSkip,
  title = "API 配額已用完",
  message = "內建的 Gemini API 配額已用完，請輸入您自己的 API Key 以繼續使用 AI 功能。"
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('請輸入有效的 API Key');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      // 簡單驗證 API Key 格式
      if (!apiKey.startsWith('AIza') || apiKey.length < 30) {
        throw new Error('API Key 格式不正確');
      }

      // 測試 API Key 是否有效
      const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      
      if (!testResponse.ok) {
        throw new Error('API Key 無效或已過期');
      }

      // 保存到本地存儲
      localStorage.setItem('user_gemini_api_key', apiKey);
      onSave(apiKey);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API Key 驗證失敗');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSkip = () => {
    onSkip();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-600">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* 內容區域 */}
        <div className="p-6">
          <p className="text-gray-300 mb-6 leading-relaxed">
            {message}
          </p>

          {/* 隱私聲明 */}
          <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-blue-200 mb-1">隱私保護</h4>
                <p className="text-xs text-blue-300 leading-relaxed">
                  您的 API Key 將<strong>僅存儲在您的瀏覽器本地</strong>，我們不會收集、傳輸或存儲您的 API Key。您可以隨時清除瀏覽器數據來刪除 API Key。
                </p>
              </div>
            </div>
          </div>

          {/* API Key 輸入 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="輸入您的 Gemini API Key..."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {error && (
              <p className="text-red-400 text-sm mt-2 flex items-center space-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* 如何獲取 API Key 說明 */}
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-gray-200 mb-2">如何獲取 API Key？</h4>
            <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
              <li>前往 <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline">Google AI Studio</a></li>
              <li>登入您的 Google 帳戶</li>
              <li>點擊「Create API Key」</li>
              <li>複製生成的 API Key 並貼上到上方輸入框</li>
            </ol>
          </div>
        </div>

        {/* 按鈕區域 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/50 rounded-b-lg">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            暫時跳過
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isValidating || !apiKey.trim()}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {isValidating && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{isValidating ? '驗證中...' : '保存並使用'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;

