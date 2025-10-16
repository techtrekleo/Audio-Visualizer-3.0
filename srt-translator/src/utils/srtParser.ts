import { SRTSubtitle } from '../types';

/**
 * 解析 SRT 字幕文件
 * @param content SRT 文件內容
 * @returns 解析後的字幕數組
 */
export function parseSRT(content: string): SRTSubtitle[] {
  const subtitles: SRTSubtitle[] = [];
  
  // 移除 BOM 和標準化換行符
  const normalizedContent = content
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
  
  // 分割字幕塊（使用兩個或更多連續換行）
  const blocks = normalizedContent.split(/\n\s*\n/).filter(block => block.trim());
  
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    
    if (lines.length < 3) continue;
    
    // 第一行：序號
    const index = parseInt(lines[0].trim(), 10);
    if (isNaN(index)) continue;
    
    // 第二行：時間碼
    const timeLine = lines[1].trim();
    const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    
    if (!timeMatch) continue;
    
    const startTime = timeMatch[1];
    const endTime = timeMatch[2];
    
    // 剩餘行：字幕文本
    const text = lines.slice(2).join('\n').trim();
    
    subtitles.push({
      index,
      startTime,
      endTime,
      text
    });
  }
  
  return subtitles;
}

/**
 * 生成 SRT 格式字幕文件
 * @param subtitles 字幕數組
 * @returns SRT 格式字符串
 */
export function generateSRT(subtitles: SRTSubtitle[]): string {
  return subtitles.map(subtitle => {
    return `${subtitle.index}\n${subtitle.startTime} --> ${subtitle.endTime}\n${subtitle.text}\n`;
  }).join('\n');
}

/**
 * 驗證 SRT 時間碼格式
 * @param timeCode 時間碼字符串
 * @returns 是否有效
 */
export function isValidTimeCode(timeCode: string): boolean {
  return /^\d{2}:\d{2}:\d{2},\d{3}$/.test(timeCode);
}

/**
 * 驗證 SRT 格式
 * @param content SRT 文件內容
 * @returns 是否為有效 SRT 格式
 */
export function isValidSRT(content: string): boolean {
  try {
    const subtitles = parseSRT(content);
    return subtitles.length > 0;
  } catch {
    return false;
  }
}



