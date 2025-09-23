import React, { useState, useEffect } from 'react';
import { Subtitle, SubtitleBgStyle } from '../types';

interface LyricsDisplayProps {
  subtitles: Subtitle[];
  currentTime: number;
  isVisible: boolean;
  onToggle: () => void;
  bgStyle: SubtitleBgStyle;
}

interface LyricsLine {
  text: string;
  time: number;
  isActive: boolean;
  isPast: boolean;
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  subtitles,
  currentTime,
  isVisible,
  onToggle,
  bgStyle
}) => {
  const [lyricsLines, setLyricsLines] = useState<LyricsLine[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // 處理字幕數據，創建歌詞行
  useEffect(() => {
    if (subtitles.length === 0) return;

    const lines: LyricsLine[] = subtitles.map((subtitle, index) => ({
      text: subtitle.text,
      time: subtitle.time,
      isActive: false,
      isPast: false
    }));

    setLyricsLines(lines);
  }, [subtitles]);

  // 更新當前活動的歌詞行
  useEffect(() => {
    if (lyricsLines.length === 0) return;

    let activeIndex = 0;
    const updatedLines = lyricsLines.map((line, index) => {
      const isActive = currentTime >= line.time && 
        (index === lyricsLines.length - 1 || currentTime < lyricsLines[index + 1].time);
      const isPast = currentTime > line.time;

      if (isActive) {
        activeIndex = index;
      }

      return {
        ...line,
        isActive,
        isPast
      };
    });

    setLyricsLines(updatedLines);
    setCurrentIndex(activeIndex);
  }, [currentTime, lyricsLines]);

  // 獲取要顯示的10行歌詞（當前行前後各5行）
  const getDisplayLines = () => {
    if (lyricsLines.length === 0) return [];

    const startIndex = Math.max(0, currentIndex - 5);
    const endIndex = Math.min(lyricsLines.length, startIndex + 10);
    
    return lyricsLines.slice(startIndex, endIndex);
  };

  const displayLines = getDisplayLines();

  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={onToggle}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200"
        >
          🎵 顯示歌詞 (測試中)
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* 關閉按鈕 */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <button
          onClick={onToggle}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200"
        >
          ✕ 關閉歌詞
        </button>
      </div>

      {/* 歌詞顯示區域 */}
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4 max-w-4xl px-8">
          {displayLines.map((line, index) => {
            const isCurrentLine = line.isActive;
            const isPastLine = line.isPast;
            
            // 根據背景樣式設置背景樣式
            const getBackgroundStyle = () => {
              if (bgStyle === SubtitleBgStyle.NONE) {
                return {};
              } else if (bgStyle === SubtitleBgStyle.BLACK) {
                return {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  display: 'inline-block'
                };
              } else if (bgStyle === SubtitleBgStyle.TRANSPARENT) {
                return {
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  display: 'inline-block'
                };
              }
              return {};
            };

            return (
              <div
                key={`${line.time}-${index}`}
                className={`transition-all duration-500 ${
                  isCurrentLine
                    ? 'text-4xl md:text-5xl font-bold text-white drop-shadow-2xl transform scale-110'
                    : isPastLine
                    ? 'text-2xl md:text-3xl text-gray-400 opacity-60'
                    : 'text-2xl md:text-3xl text-gray-300 opacity-80'
                }`}
                style={{
                  textShadow: isCurrentLine 
                    ? '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4)'
                    : '0 0 10px rgba(0, 0, 0, 0.5)',
                  filter: isCurrentLine ? 'brightness(1.2)' : 'brightness(0.8)',
                  ...getBackgroundStyle()
                }}
              >
                {line.text}
              </div>
            );
          })}
        </div>
      </div>

      {/* 測試中標示 */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
          🧪 測試中
        </div>
      </div>
    </div>
  );
};

export default LyricsDisplay;
