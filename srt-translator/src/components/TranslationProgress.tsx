import { getLanguageName } from '../utils/languages';

interface TranslationProgressProps {
  languageCode: string;
  current: number;
  total: number;
  totalLanguages: number;
}

export const TranslationProgress: React.FC<TranslationProgressProps> = ({
  languageCode,
  current,
  total,
  totalLanguages,
}) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="text-3xl animate-spin">⚙️</span>
        翻譯進行中...
      </h2>

      <div className="space-y-6">
        {/* 當前語言進度 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 font-semibold">
              正在翻譯: {getLanguageName(languageCode)}
            </span>
            <span className="text-blue-400 font-bold">
              {current} / {total}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-500 ease-out flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${percentage}%` }}
            >
              {percentage > 15 && `${percentage}%`}
            </div>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm flex items-start gap-2">
            <span className="text-lg">⏳</span>
            <span>
              翻譯需要一些時間，請耐心等待。每條字幕需要約 0.6 秒處理時間。
              {totalLanguages > 1 && ` 共需翻譯 ${totalLanguages} 種語言。`}
            </span>
          </p>
        </div>

        {/* 動畫加載指示 */}
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

