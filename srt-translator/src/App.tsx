import { useState, useCallback, useEffect } from 'react';
import { UnifiedHeader } from './components/UnifiedHeader';
import { UnifiedFooter } from './components/UnifiedFooter';
import { FileUpload } from './components/FileUpload';
import { LanguageSelector } from './components/LanguageSelector';
import { TranslationProgress } from './components/TranslationProgress';
import { DownloadResults } from './components/DownloadResults';
import { ApiKeyModal } from './components/ApiKeyModal';
import { SRTSubtitle, Language, TranslationResult } from './types';
import { parseSRT, isValidSRT } from './utils/srtParser';
import { batchTranslateSubtitles } from './utils/translator';
import { SUPPORTED_LANGUAGES } from './utils/languages';
import './index.css';

function App() {
  const [parsedSubtitles, setParsedSubtitles] = useState<SRTSubtitle[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([]);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationResults, setTranslationResults] = useState<TranslationResult[]>([]);
  const [currentProgress, setCurrentProgress] = useState<{ language: string; current: number; total: number } | null>(null);
  const [originalFilename, setOriginalFilename] = useState<string>('subtitles');
  
  // API Key 管理
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [apiQuotaExceeded, setApiQuotaExceeded] = useState<boolean>(false);

  // 從 localStorage 加載 API Key
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setUserApiKey(savedApiKey);
    }
  }, []);

  // 處理文件上傳或文本貼上
  const handleSRTInput = useCallback((content: string, filename?: string) => {
    if (!isValidSRT(content)) {
      alert('無效的 SRT 格式！請檢查文件內容。');
      return;
    }

    const parsed = parseSRT(content);
    setParsedSubtitles(parsed);
    setTranslationResults([]);
    
    if (filename) {
      // 移除 .srt 副檔名
      const baseName = filename.replace(/\.srt$/i, '');
      setOriginalFilename(baseName);
    }
  }, []);

  // 處理語言選擇
  const handleLanguageToggle = useCallback((language: Language) => {
    setSelectedLanguages(prev => {
      const exists = prev.find(lang => lang.code === language.code);
      if (exists) {
        return prev.filter(lang => lang.code !== language.code);
      } else {
        return [...prev, language];
      }
    });
  }, []);

  // 開始翻譯
  const handleStartTranslation = useCallback(async () => {
    if (parsedSubtitles.length === 0) {
      alert('請先上傳或貼上 SRT 字幕！');
      return;
    }

    if (selectedLanguages.length === 0) {
      alert('請至少選擇一種目標語言！');
      return;
    }

    // 檢查 API Key
    // 優先使用用戶的 API Key，如果沒有則使用內建的免費 API Key
    let apiKey = userApiKey || (import.meta as any).env.VITE_API_KEY || 'AIzaSyAxPc3BA9NcFeNkDgPo7bmzAsL_HJ_krQw';
    if (!apiKey) {
      setShowApiKeyModal(true);
      setApiQuotaExceeded(false);
      return;
    }

    setIsTranslating(true);
    setTranslationResults([]);
    setCurrentProgress(null);

    try {
      const results = await batchTranslateSubtitles(
        parsedSubtitles,
        selectedLanguages,
        apiKey,
        (languageCode, current, total) => {
          setCurrentProgress({ language: languageCode, current, total });
        }
      );

      // 轉換為 TranslationResult 格式
      const translationResults: TranslationResult[] = [];
      results.forEach((subtitles, languageCode) => {
        const language = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
        if (language) {
          translationResults.push({
            language,
            subtitles,
            filename: `${originalFilename}_${languageCode}.srt`
          });
        }
      });

      setTranslationResults(translationResults);
      setCurrentProgress(null);
    } catch (error: any) {
      console.error('翻譯失敗:', error);
      
      const errorMessage = error?.message || String(error);
      const isQuotaExceeded = errorMessage.includes('quota') || 
                            errorMessage.includes('limit') || 
                            errorMessage.includes('exceeded') ||
                            error?.status === 429 ||
                            error?.code === 429;
      
      if (isQuotaExceeded && !userApiKey) {
        setShowApiKeyModal(true);
        setApiQuotaExceeded(true);
        alert('內建的 AI API 配額已用完，請輸入您自己的 API Key 以繼續使用。');
      } else {
        alert(`翻譯失敗：${errorMessage}\n\n請檢查您的 API Key、網路連線或稍後再試。`);
      }
    } finally {
      setIsTranslating(false);
    }
  }, [parsedSubtitles, selectedLanguages, userApiKey, originalFilename]);

  // API Key 模態框處理
  const handleApiKeySave = useCallback((apiKey: string) => {
    setUserApiKey(apiKey);
    localStorage.setItem('gemini_api_key', apiKey);
    setShowApiKeyModal(false);
    setApiQuotaExceeded(false);
  }, []);

  const handleApiKeySkip = useCallback(() => {
    setShowApiKeyModal(false);
  }, []);

  const handleApiKeyModalClose = useCallback(() => {
    setShowApiKeyModal(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <UnifiedHeader />
      
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* 標題區域 */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              SRT 字幕翻譯系統
            </h1>
            <p className="text-gray-300 text-lg">
              上傳或貼上 SRT 字幕文件，快速翻譯成多種語言
            </p>
            <p className="text-yellow-400 text-sm mt-2">
              ⚠️ 時間碼將完全保持不變，僅翻譯文本內容
            </p>
          </div>

          {/* 步驟 1: 上傳/貼上 SRT */}
          <div className="mb-8">
            <FileUpload 
              onFileLoad={handleSRTInput}
              onTextPaste={handleSRTInput}
              subtitleCount={parsedSubtitles.length}
            />
          </div>

          {/* 步驟 2: 選擇目標語言 */}
          {parsedSubtitles.length > 0 && (
            <div className="mb-8">
              <LanguageSelector
                languages={SUPPORTED_LANGUAGES}
                selectedLanguages={selectedLanguages}
                onLanguageToggle={handleLanguageToggle}
              />
            </div>
          )}

          {/* API Key 輸入區域 */}
          {parsedSubtitles.length > 0 && selectedLanguages.length > 0 && (
            <div className="mb-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span>🔑</span>
                  API Key 設定
                </h3>
                
                {userApiKey ? (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm">
                      ✅ 已設定 API Key: {userApiKey.substring(0, 8)}...
                    </p>
                     <button
                       onClick={() => {
                         setUserApiKey('');
                         localStorage.removeItem('gemini_api_key');
                       }}
                       className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                     >
                       清除 API Key
                     </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm font-semibold">
                        Gemini API Key (可選)
                      </label>
                     <input
                       type="password"
                       value={userApiKey}
                       onChange={(e) => {
                         const newApiKey = e.target.value;
                         setUserApiKey(newApiKey);
                         // 自動保存到 localStorage
                         if (newApiKey.trim()) {
                           localStorage.setItem('gemini_api_key', newApiKey.trim());
                         } else {
                           localStorage.removeItem('gemini_api_key');
                         }
                       }}
                       placeholder="輸入您的 Gemini API Key (留空使用內建配額)"
                       className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                     />
                       <p className="text-gray-400 text-xs mt-2">
                         使用您自己的 API Key 可以避免免費配額限制，獲得更好的翻譯體驗。留空則使用內建免費配額。
                       </p>
                    </div>
                    
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-400 text-sm mb-2 font-semibold">
                        如何獲取 API Key？
                      </p>
                      <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                        <li>訪問 <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a></li>
                        <li>登入您的 Google 帳號</li>
                        <li>點擊 "Create API Key"</li>
                        <li>複製生成的 API Key 並貼上到上方輸入框</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 步驟 3: 開始翻譯按鈕 */}
          {parsedSubtitles.length > 0 && selectedLanguages.length > 0 && !isTranslating && translationResults.length === 0 && (
            <div className="text-center mb-8">
              <button
                onClick={handleStartTranslation}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🚀 開始翻譯
              </button>
              <p className="text-gray-400 text-sm mt-3">
                將翻譯 {parsedSubtitles.length} 條字幕到 {selectedLanguages.length} 種語言
              </p>
            </div>
          )}

          {/* 翻譯進度 */}
          {isTranslating && currentProgress && (
            <div className="mb-8">
              <TranslationProgress
                languageCode={currentProgress.language}
                current={currentProgress.current}
                total={currentProgress.total}
                totalLanguages={selectedLanguages.length}
              />
            </div>
          )}

          {/* 下載結果 */}
          {translationResults.length > 0 && (
            <div className="mb-8">
              <DownloadResults results={translationResults} />
            </div>
          )}
        </div>
      </main>

      <UnifiedFooter />

      {/* API Key 模態框 */}
      {showApiKeyModal && (
        <ApiKeyModal
          isOpen={showApiKeyModal}
          onClose={handleApiKeyModalClose}
          onSave={handleApiKeySave}
          onSkip={handleApiKeySkip}
          quotaExceeded={apiQuotaExceeded}
        />
      )}
    </div>
  );
}

export default App;

