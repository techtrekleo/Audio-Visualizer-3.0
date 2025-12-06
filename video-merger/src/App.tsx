import React, { useState, useRef } from 'react';
import { UnifiedHeader } from './components/UnifiedLayout';
import { UnifiedFooter, ModalProvider } from '../../shared-components/dist';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

interface VideoFile {
  file: File;
  url: string;
  duration: number;
  name: string;
}

function App() {
  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mergedVideoUrl, setMergedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const videoFilesData: VideoFile[] = [];

    for (const file of files) {
      if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        const duration = await getVideoDuration(url);
        videoFilesData.push({
          file,
          url,
          duration,
          name: file.name,
        });
      }
    }

    setVideoFiles((prev) => [...prev, ...videoFilesData]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getVideoDuration = (url: string): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = url;
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      video.onerror = () => {
        resolve(0);
      };
    });
  };

  const removeVideo = (index: number) => {
    const file = videoFiles[index];
    URL.revokeObjectURL(file.url);
    setVideoFiles((prev) => prev.filter((_, i) => i !== index));
    if (mergedVideoUrl) {
      URL.revokeObjectURL(mergedVideoUrl);
      setMergedVideoUrl(null);
    }
  };

  const moveVideo = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === videoFiles.length - 1)
    ) {
      return;
    }

    const newFiles = [...videoFiles];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    setVideoFiles(newFiles);
    if (mergedVideoUrl) {
      URL.revokeObjectURL(mergedVideoUrl);
      setMergedVideoUrl(null);
    }
  };

  const loadFFmpeg = async () => {
    if (ffmpegRef.current) {
      return ffmpegRef.current;
    }

    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;

    ffmpeg.on('log', ({ message }) => {
      console.log(message);
    });

    ffmpeg.on('progress', ({ progress: p }) => {
      setProgress(Math.round(p * 100));
    });

    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    } catch (error) {
      console.error('FFmpeg 載入失敗:', error);
      throw new Error('無法載入 FFmpeg，請檢查網路連線');
    }

    return ffmpeg;
  };

  const mergeVideos = async () => {
    if (videoFiles.length < 2) {
      setError('請至少選擇兩個影片檔案');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const ffmpeg = await loadFFmpeg();

      // 將所有影片檔案寫入 FFmpeg 的虛擬檔案系統
      for (let i = 0; i < videoFiles.length; i++) {
        const videoFile = videoFiles[i];
        const data = await fetchFile(videoFile.url);
        await ffmpeg.writeFile(`input${i}.webm`, data);
      }

      // 創建 concat 文件
      const concatContent = videoFiles
        .map((_, i) => `file 'input${i}.webm'`)
        .join('\n');
      await ffmpeg.writeFile('concat.txt', concatContent);

      // 執行合併 - 使用重新編碼以確保兼容性
      await ffmpeg.exec([
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        'concat.txt',
        '-c:v',
        'libvpx-vp9',
        '-c:a',
        'libopus',
        '-b:v',
        '1M',
        '-b:a',
        '128k',
        'output.webm',
      ]);

      // 讀取合併後的影片
      const data = await ffmpeg.readFile('output.webm');
      const blob = new Blob([data], { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setMergedVideoUrl(url);

      // 清理
      for (let i = 0; i < videoFiles.length; i++) {
        await ffmpeg.deleteFile(`input${i}.webm`);
      }
      await ffmpeg.deleteFile('concat.txt');
      await ffmpeg.deleteFile('output.webm');
    } catch (err) {
      console.error('合併失敗:', err);
      setError(`合併失敗: ${err instanceof Error ? err.message : '未知錯誤'}`);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadMergedVideo = () => {
    if (!mergedVideoUrl) return;

    const a = document.createElement('a');
    a.href = mergedVideoUrl;
    a.download = `merged-video-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = videoFiles.reduce((sum, file) => sum + file.duration, 0);

  return (
    <ModalProvider>
      <div className="min-h-screen bg-black flex flex-col">
        <UnifiedHeader />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 flex-1">
        <div className="space-y-6">
          {/* 標題 */}
          <div className="card">
            <h1 className="text-3xl font-bold text-white mb-2">歐皇測試頁面</h1>
            <p className="text-gray-300">
              將多個 WebM 影片檔案串接成一支長影片
            </p>
          </div>

          {/* 錯誤訊息 */}
          {error && (
            <div className="card bg-red-900/50 border-red-700">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* 上傳區域 */}
          <div className="card">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              選擇影片檔案 (可多選)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/webm,video/*"
              multiple
              onChange={handleFileSelect}
              className="input-field"
              disabled={isProcessing}
            />
            <p className="text-xs text-gray-400 mt-2">
              支援 WebM 格式，可一次選擇多個檔案
            </p>
          </div>

          {/* 影片列表 */}
          {videoFiles.length > 0 && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">
                  影片列表 ({videoFiles.length} 個)
                </h2>
                <div className="text-sm text-gray-300">
                  總時長: {formatDuration(totalDuration)}
                </div>
              </div>

              <div className="space-y-2">
                {videoFiles.map((videoFile, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="text-sm text-gray-400 w-8">
                        #{index + 1}
                      </div>
                      <video
                        src={videoFile.url}
                        className="w-24 h-16 object-cover rounded"
                        muted
                      />
                      <div className="flex-1">
                        <div className="text-sm text-white font-medium">
                          {videoFile.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDuration(videoFile.duration)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => moveVideo(index, 'up')}
                        disabled={index === 0 || isProcessing}
                        className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveVideo(index, 'down')}
                        disabled={index === videoFiles.length - 1 || isProcessing}
                        className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeVideo(index)}
                        disabled={isProcessing}
                        className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        移除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 合併按鈕 */}
          {videoFiles.length >= 2 && (
            <div className="card">
              <button
                onClick={mergeVideos}
                disabled={isProcessing}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? `處理中... ${progress}%` : '開始合併影片'}
              </button>
              {isProcessing && (
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-cyan-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 預覽和下載 */}
          {mergedVideoUrl && (
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-4">
                合併完成！
              </h2>
              <video
                src={mergedVideoUrl}
                controls
                className="w-full rounded-lg mb-4"
              />
              <button
                onClick={downloadMergedVideo}
                className="w-full btn-primary py-3 text-lg"
              >
                下載合併後的影片
              </button>
            </div>
          )}
        </div>
        </main>
        <UnifiedFooter />
      </div>
    </ModalProvider>
  );
}

export default App;

