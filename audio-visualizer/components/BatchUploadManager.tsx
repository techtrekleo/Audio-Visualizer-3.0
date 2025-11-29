import React, { useState, useCallback } from 'react';
import { Subtitle, SubtitleFormat } from '../types';

// 批量上传歌曲数据结构
export interface SongItem {
    id: string; // 唯一标识
    audioFile: File | null;
    audioUrl: string;
    audioDuration: number;
    backgroundImage: string | null; // 图片URL
    backgroundVideo: string | null; // 视频URL
    subtitlesRawText: string; // 字幕原始文本
    subtitles: Subtitle[]; // 解析后的字幕
    songName?: string; // 歌曲名称（可选）
}

interface BatchUploadManagerProps {
    songs: SongItem[];
    onSongsChange: (songs: SongItem[]) => void;
    onSongSelect: (song: SongItem) => void; // 选择要播放的歌曲
    currentSongId?: string; // 当前选中的歌曲ID
    isBatchMode?: boolean; // 是否处于批量录制模式
    currentBatchIndex?: number; // 当前批量播放的歌曲索引
    onStartBatchRecording?: () => void; // 开始批量录制
    onStopBatchRecording?: () => void; // 停止批量录制
    isRecording?: boolean; // 是否正在录制
}

const MAX_SONGS = 20;

const BatchUploadManager: React.FC<BatchUploadManagerProps> = ({
    songs,
    onSongsChange,
    onSongSelect,
    currentSongId,
    isBatchMode = false,
    currentBatchIndex = 0,
    onStartBatchRecording,
    onStopBatchRecording,
    isRecording = false
}) => {
    const [activeTab, setActiveTab] = useState<number>(0);

    // 创建新歌曲
    const addNewSong = useCallback(() => {
        if (songs.length >= MAX_SONGS) {
            alert(`最多只能添加 ${MAX_SONGS} 首歌曲`);
            return;
        }

        const newSong: SongItem = {
            id: `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            audioFile: null,
            audioUrl: '',
            audioDuration: 0,
            backgroundImage: null,
            backgroundVideo: null,
            subtitlesRawText: '',
            subtitles: [],
            songName: `歌曲 ${songs.length + 1}`
        };

        onSongsChange([...songs, newSong]);
        setActiveTab(songs.length); // 切换到新添加的歌曲标签
    }, [songs, onSongsChange]);

    // 删除歌曲
    const removeSong = useCallback((songId: string) => {
        if (songs.length <= 1) {
            alert('至少需要保留一首歌曲');
            return;
        }

        const updatedSongs = songs.filter(song => song.id !== songId);
        onSongsChange(updatedSongs);
        
        // 如果删除的是当前标签，切换到第一个标签
        if (activeTab >= updatedSongs.length) {
            setActiveTab(0);
        }
    }, [songs, onSongsChange, activeTab]);

    // 更新歌曲
    const updateSong = useCallback((songId: string, updates: Partial<SongItem>) => {
        const updatedSongs = songs.map(song => 
            song.id === songId ? { ...song, ...updates } : song
        );
        onSongsChange(updatedSongs);
    }, [songs, onSongsChange]);

    // 处理音频文件上传
    const handleAudioUpload = useCallback((songId: string, file: File) => {
        const url = URL.createObjectURL(file);
        const audio = new Audio(url);
        
        audio.onloadedmetadata = () => {
            updateSong(songId, {
                audioFile: file,
                audioUrl: url,
                audioDuration: audio.duration
            });
        };
        
        audio.onerror = () => {
            alert('音频文件加载失败');
            URL.revokeObjectURL(url);
        };
    }, [updateSong]);

    // 处理图片上传
    const handleImageUpload = useCallback((songId: string, file: File) => {
        const url = URL.createObjectURL(file);
        updateSong(songId, {
            backgroundImage: url,
            backgroundVideo: null // 清除视频
        });
    }, [updateSong]);

    // 处理视频上传
    const handleVideoUpload = useCallback((songId: string, file: File) => {
        const url = URL.createObjectURL(file);
        updateSong(songId, {
            backgroundVideo: url,
            backgroundImage: null // 清除图片
        });
    }, [updateSong]);

    // 清除背景媒体
    const clearBackgroundMedia = useCallback((songId: string) => {
        const song = songs.find(s => s.id === songId);
        if (song) {
            if (song.backgroundImage) URL.revokeObjectURL(song.backgroundImage);
            if (song.backgroundVideo) URL.revokeObjectURL(song.backgroundVideo);
        }
        updateSong(songId, {
            backgroundImage: null,
            backgroundVideo: null
        });
    }, [songs, updateSong]);

    // 解析字幕（简化版，使用现有的解析逻辑）
    const parseSubtitles = useCallback((rawText: string, format: SubtitleFormat = SubtitleFormat.BRACKET): Subtitle[] => {
        if (!rawText.trim()) return [];
        
        const lines = rawText.trim().split('\n');
        const subtitles: Subtitle[] = [];
        
        if (format === SubtitleFormat.BRACKET) {
            const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2})\]/;
            lines.forEach(line => {
                const match = line.match(timeRegex);
                if (match) {
                    const minutes = parseInt(match[1], 10);
                    const seconds = parseInt(match[2], 10);
                    const centiseconds = parseInt(match[3], 10);
                    const time = minutes * 60 + seconds + centiseconds / 100;
                    const text = line.replace(timeRegex, '').trim();
                    if (text) {
                        subtitles.push({ time, text });
                    }
                }
            });
            
            // 计算结束时间
            subtitles.forEach((subtitle, index) => {
                if (index < subtitles.length - 1) {
                    subtitle.endTime = subtitles[index + 1].time;
                } else {
                    subtitle.endTime = subtitle.time + 10;
                }
            });
        }
        
        return subtitles.sort((a, b) => a.time - b.time);
    }, []);

    // 更新字幕
    const handleSubtitleChange = useCallback((songId: string, rawText: string) => {
        const subtitles = parseSubtitles(rawText);
        updateSong(songId, {
            subtitlesRawText: rawText,
            subtitles
        });
    }, [updateSong, parseSubtitles]);

    const currentSong = songs[activeTab];

    return (
        <div className="w-full max-w-7xl mx-auto bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">批量上传管理</h2>
                <div className="flex items-center gap-4">
                    <span className="text-gray-300">
                        已添加 {songs.length} / {MAX_SONGS} 首歌曲
                    </span>
                    {!isBatchMode && (
                        <button
                            onClick={addNewSong}
                            disabled={songs.length >= MAX_SONGS}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200"
                        >
                            ➕ 新增歌曲
                        </button>
                    )}
                </div>
            </div>

            {/* 批量录制控制 */}
            {songs.length > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-400/30 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">批量录制模式</h3>
                            <p className="text-sm text-gray-300">
                                {isBatchMode 
                                    ? `正在录制：第 ${currentBatchIndex + 1} / ${songs.length} 首歌曲`
                                    : `将连续录制 ${songs.length} 首歌曲，生成一个完整视频`
                                }
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {!isBatchMode ? (
                                <button
                                    onClick={onStartBatchRecording}
                                    disabled={songs.length === 0 || songs.some(s => !s.audioFile)}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200 shadow-lg"
                                >
                                    🎬 开始批量录制
                                </button>
                            ) : (
                                <button
                                    onClick={onStopBatchRecording}
                                    className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg animate-pulse"
                                >
                                    ⏹️ 停止批量录制
                                </button>
                            )}
                        </div>
                    </div>
                    {isBatchMode && (
                        <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                                        style={{ width: `${((currentBatchIndex + 1) / songs.length) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm text-gray-300 min-w-[80px] text-right">
                                    {currentBatchIndex + 1} / {songs.length}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                当前播放：{songs[currentBatchIndex]?.songName || `歌曲 ${currentBatchIndex + 1}`}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* 标签页导航 */}
            {songs.length > 0 && (
                <div className="mb-6 border-b border-gray-700">
                    <div className="flex flex-wrap gap-2">
                        {songs.map((song, index) => (
                            <div
                                key={song.id}
                                className="relative inline-block"
                            >
                                <button
                                    onClick={() => !isBatchMode && setActiveTab(index)}
                                    disabled={isBatchMode}
                                    className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-200 ${
                                        activeTab === index
                                            ? 'bg-cyan-600 text-white'
                                            : index === currentBatchIndex && isBatchMode
                                            ? 'bg-purple-600 text-white animate-pulse'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    } ${isBatchMode ? 'cursor-not-allowed opacity-75' : ''}`}
                                >
                                    {song.songName || `歌曲 ${index + 1}`}
                                    {song.audioFile && ' ✓'}
                                    {index === currentBatchIndex && isBatchMode && ' 🎬'}
                                </button>
                                {songs.length > 1 && !isBatchMode && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeSong(song.id);
                                        }}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs flex items-center justify-center transition-all duration-200"
                                        title="删除歌曲"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 当前歌曲编辑区域 */}
            {currentSong && (
                <div className="space-y-6">
                    {/* 歌曲名称 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            歌曲名称
                        </label>
                        <input
                            type="text"
                            value={currentSong.songName || ''}
                            onChange={(e) => updateSong(currentSong.id, { songName: e.target.value })}
                            placeholder="输入歌曲名称..."
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                    </div>

                    {/* 音频上传 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            音频文件 {currentSong.audioFile && `✓ ${currentSong.audioFile.name}`}
                        </label>
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    handleAudioUpload(currentSong.id, file);
                                }
                                e.target.value = '';
                            }}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200"
                        />
                        {currentSong.audioDuration > 0 && (
                            <p className="text-sm text-gray-400 mt-1">
                                时长: {Math.floor(currentSong.audioDuration / 60)}:{(currentSong.audioDuration % 60).toFixed(0).padStart(2, '0')}
                            </p>
                        )}
                    </div>

                    {/* 背景媒体上传 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            背景媒体
                        </label>
                        <div className="flex gap-2">
                            <label className="flex-1 text-center bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer">
                                📷 上传图片
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            handleImageUpload(currentSong.id, file);
                                        }
                                        e.target.value = '';
                                    }}
                                />
                            </label>
                            <label className="flex-1 text-center bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer">
                                🎬 上传视频
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="video/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            handleVideoUpload(currentSong.id, file);
                                        }
                                        e.target.value = '';
                                    }}
                                />
                            </label>
                            {(currentSong.backgroundImage || currentSong.backgroundVideo) && (
                                <button
                                    onClick={() => clearBackgroundMedia(currentSong.id)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition-all duration-200"
                                >
                                    🗑️ 清除
                                </button>
                            )}
                        </div>
                        {currentSong.backgroundImage && (
                            <p className="text-sm text-gray-400 mt-1">✓ 已上传图片</p>
                        )}
                        {currentSong.backgroundVideo && (
                            <p className="text-sm text-gray-400 mt-1">✓ 已上传视频</p>
                        )}
                    </div>

                    {/* 字幕编辑（使用标签页，每首歌独立显示） */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            字幕内容（{currentSong.songName || `歌曲 ${activeTab + 1}`}）
                        </label>
                        <textarea
                            value={currentSong.subtitlesRawText}
                            onChange={(e) => handleSubtitleChange(currentSong.id, e.target.value)}
                            placeholder="输入字幕内容，格式：[00:00.00] 字幕内容..."
                            rows={8}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 font-mono text-sm"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            格式: [mm:ss.xx] 字幕内容，每行一句
                        </p>
                        {currentSong.subtitles.length > 0 && (
                            <p className="text-sm text-cyan-400 mt-1">
                                ✓ 已解析 {currentSong.subtitles.length} 条字幕
                            </p>
                        )}
                    </div>

                    {/* 选择播放按钮 - 只在非批量模式显示 */}
                    {!isBatchMode && (
                        <div>
                            <button
                                onClick={() => onSongSelect(currentSong)}
                                disabled={!currentSong.audioFile}
                                className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200"
                            >
                                ▶️ 选择此歌曲进行播放
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* 空状态 */}
            {songs.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-400 mb-4">还没有添加任何歌曲</p>
                    <button
                        onClick={addNewSong}
                        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold transition-all duration-200"
                    >
                        ➕ 添加第一首歌曲
                    </button>
                </div>
            )}
        </div>
    );
};

export default BatchUploadManager;

