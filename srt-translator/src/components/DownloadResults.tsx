import { TranslationResult } from '../types';
import { generateSRT } from '../utils/srtParser';

interface DownloadResultsProps {
  results: TranslationResult[];
}

export const DownloadResults: React.FC<DownloadResultsProps> = ({ results }) => {
  const handleDownload = (result: TranslationResult) => {
    const srtContent = generateSRT(result.subtitles);
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    results.forEach((result, index) => {
      setTimeout(() => {
        handleDownload(result);
      }, index * 300);
    });
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="text-3xl">🎉</span>
        翻譯完成！
      </h2>

      <div className="mb-6">
        <p className="text-gray-300 mb-4">
          成功翻譯為 {results.length} 種語言，點擊下載對應的 SRT 文件：
        </p>
        
        {results.length > 1 && (
          <button
            onClick={handleDownloadAll}
            className="w-full mb-4 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            📦 下載全部 ({results.length} 個文件)
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result) => (
          <div
            key={result.language.code}
            className="bg-gray-900/50 border border-gray-700 rounded-lg p-5 hover:border-blue-500 transition-all duration-300"
          >
            <div className="mb-3">
              <h3 className="text-white font-bold text-lg mb-1">
                {result.language.nativeName}
              </h3>
              <p className="text-gray-400 text-sm">
                {result.language.name}
              </p>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-500 text-xs mb-1">文件名稱：</p>
              <p className="text-gray-300 text-sm font-mono break-all">
                {result.filename}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-blue-400 text-sm">
                ✅ {result.subtitles.length} 條字幕
              </p>
            </div>

            <button
              onClick={() => handleDownload(result)}
              className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <span>⬇️</span>
              <span>下載</span>
            </button>
          </div>
        ))}
      </div>

      {/* 時間碼保持提示 */}
      <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
        <p className="text-green-400 text-sm flex items-center gap-2">
          <span className="text-lg">✅</span>
          <span>所有翻譯的字幕時間碼均保持與原文完全一致</span>
        </p>
      </div>
    </div>
  );
};

