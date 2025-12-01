
// ... existing code ...

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

// ... existing code ...
