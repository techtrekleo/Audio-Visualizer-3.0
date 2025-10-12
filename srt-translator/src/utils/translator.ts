import { SRTSubtitle, Language } from '../types';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';

/**
 * 使用 Gemini API 翻譯單個字幕塊
 */
async function translateText(text: string, targetLanguage: Language, apiKey: string): Promise<string> {
  // 添加調試信息
  console.log('翻譯文本:', text);
  console.log('目標語言:', targetLanguage.name);
  console.log('文本長度:', text.length);
  
  const prompt = `請將以下日文文本翻譯成${targetLanguage.name}：\n\n${text}`;
  
  console.log('翻譯提示詞:', prompt);

  // 增加 maxOutputTokens 到 4096，降低 temperature 讓回應更簡潔
  const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      systemInstruction: {
        parts: [{
          text: "你是一個專業的翻譯工具。請直接翻譯給定的文本，不要添加任何解釋、思考過程或其他內容。只返回翻譯結果。"
        }]
      },
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1000,
        topP: 0.1,
        topK: 1,
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`翻譯失敗: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  
  // 添加調試信息
  console.log('API 回應數據:', JSON.stringify(data, null, 2));
  console.log('API 回應狀態:', response.status);
  console.log('候選結果數量:', data.candidates?.length || 0);
  
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('API 未返回翻譯結果');
  }

  const candidate = data.candidates[0];
  if (!candidate) {
    console.error('API 回應結構:', candidate);
    throw new Error('API 返回的數據結構不正確');
  }

  // 移除 MAX_TOKENS 檢查，讓翻譯繼續進行
  // if (candidate.finishReason === 'MAX_TOKENS') {
  //   throw new Error('翻譯文本太長，請縮短字幕內容或分段處理');
  // }

  // 檢查 content 結構
  if (!candidate.content) {
    console.error('API 回應結構:', candidate);
    throw new Error('API 返回的數據結構不正確 - 缺少 content');
  }

  // 嘗試不同的回應結構
  let translatedText = '';
  
  if (candidate.content.parts && candidate.content.parts.length > 0) {
    // 標準結構
    translatedText = candidate.content.parts[0].text || '';
  } else if (candidate.content.text) {
    // 直接文本結構
    translatedText = candidate.content.text;
  } else if (candidate.finishReason === 'MAX_TOKENS') {
    // 當達到 MAX_TOKENS 時，嘗試從其他地方獲取文本
    console.log('達到 MAX_TOKENS，嘗試其他方法獲取翻譯');
    // 如果沒有找到翻譯結果，返回原文
    if (!translatedText) {
      translatedText = text;
    }
  } else {
    console.error('API 回應結構:', candidate);
    throw new Error('API 返回的數據結構不正確 - 無法找到翻譯文本');
  }

  if (!translatedText) {
    console.error('翻譯結果為空，返回原文');
    return text;
  }

  console.log('最終翻譯結果:', translatedText.trim());
  return translatedText.trim();
}

/**
 * 智能翻譯 SRT 字幕文件（自動判斷最佳批次大小）
 * @param subtitles 原始字幕數組
 * @param targetLanguage 目標語言
 * @param apiKey Gemini API Key
 * @param onProgress 進度回調
 */
export async function translateSubtitles(
  subtitles: SRTSubtitle[],
  targetLanguage: Language,
  apiKey: string,
  onProgress?: (current: number, total: number) => void
): Promise<SRTSubtitle[]> {
  // 計算總字元數
  const totalChars = subtitles.reduce((sum, sub) => sum + sub.text.length, 0);
  const avgCharsPerSubtitle = totalChars / subtitles.length;
  
  // 智能判斷批次大小（基於 token 限制）
  // Gemini 2.5 Pro 輸入限制更高，但為了穩定性仍保守估計
  // 每批最多 25,000 字元（Pro 模型處理能力更強）
  const MAX_CHARS_PER_BATCH = 25000;
  const optimalBatchSize = Math.max(1, Math.floor(MAX_CHARS_PER_BATCH / avgCharsPerSubtitle));
  
  console.log(`📊 字幕統計 (使用 Gemini 2.5 Pro):
    - 總條數: ${subtitles.length}
    - 總字元: ${totalChars}
    - 平均每條: ${avgCharsPerSubtitle.toFixed(0)} 字元
    - 最佳批次: ${optimalBatchSize} 條/批`);
  
  // 如果字幕數量小於等於最佳批次大小，一次翻譯完成
  if (subtitles.length <= optimalBatchSize) {
    console.log('✅ 使用整篇翻譯模式（1 次 API 調用）- 使用 2.5 Pro 獲得最佳品質');
    return await translateInOneBatch(subtitles, targetLanguage, apiKey, onProgress);
  }
  
  // 否則分批翻譯
  console.log(`🔄 使用分批翻譯模式（約 ${Math.ceil(subtitles.length / optimalBatchSize)} 次 API 調用）- 使用 2.5 Pro 獲得最佳品質`);
  return await translateInMultipleBatches(subtitles, targetLanguage, apiKey, optimalBatchSize, onProgress);
}

/**
 * 整篇翻譯（單次 API 調用）
 */
async function translateInOneBatch(
  subtitles: SRTSubtitle[],
  targetLanguage: Language,
  apiKey: string,
  onProgress?: (current: number, total: number) => void
): Promise<SRTSubtitle[]> {
  try {
    // 將所有字幕合併為一個文本，用特殊分隔符分隔
    const fullText = subtitles.map((subtitle) => 
      `<<<${subtitle.index}>>>${subtitle.text}`
    ).join('\n');
    
    console.log(`🚀 開始整篇翻譯 ${subtitles.length} 條字幕...`);
    
    if (onProgress) {
      onProgress(0, subtitles.length);
    }
    
    // 整篇一次翻譯
    const translatedFullText = await translateText(fullText, targetLanguage, apiKey);
    
    console.log('✅ 翻譯完成，解析結果...');
    
    // 解析翻譯結果
    const translatedLines = translatedFullText.split('\n');
    const translatedSubtitles: SRTSubtitle[] = [];
    
    // 將翻譯結果分配回原始字幕
    for (const subtitle of subtitles) {
      // 尋找對應的翻譯行
      const markerPattern = new RegExp(`<<<${subtitle.index}>>>(.+?)(?=<<<|$)`, 's');
      const match = translatedFullText.match(markerPattern);
      
      let translatedText = subtitle.text;
      
      if (match && match[1]) {
        translatedText = match[1].trim();
      } else {
        // 如果找不到標記，嘗試按行號匹配
        const lineIndex = subtitle.index - 1;
        if (translatedLines[lineIndex]) {
          translatedText = translatedLines[lineIndex]
            .replace(/^<<<\d+>>>/, '')
            .trim();
        }
      }
      
      translatedSubtitles.push({
        index: subtitle.index,
        startTime: subtitle.startTime,
        endTime: subtitle.endTime,
        text: translatedText || subtitle.text
      });
      
      if (onProgress) {
        onProgress(translatedSubtitles.length, subtitles.length);
      }
    }
    
    return translatedSubtitles;
  } catch (error) {
    console.error('❌ 整篇翻譯失敗:', error);
    throw error;
  }
}

/**
 * 分批翻譯（多次 API 調用）
 */
async function translateInMultipleBatches(
  subtitles: SRTSubtitle[],
  targetLanguage: Language,
  apiKey: string,
  batchSize: number,
  onProgress?: (current: number, total: number) => void
): Promise<SRTSubtitle[]> {
  const translatedSubtitles: SRTSubtitle[] = [];
  const totalBatches = Math.ceil(subtitles.length / batchSize);
  
  for (let i = 0; i < subtitles.length; i += batchSize) {
    const batch = subtitles.slice(i, i + batchSize);
    const currentBatch = Math.floor(i / batchSize) + 1;
    
    console.log(`📦 處理批次 ${currentBatch}/${totalBatches} (${batch.length} 條字幕)`);
    
    try {
      const batchText = batch.map((subtitle) => 
        `<<<${subtitle.index}>>>${subtitle.text}`
      ).join('\n');
      
      const translatedBatchText = await translateText(batchText, targetLanguage, apiKey);
      
      for (const subtitle of batch) {
        const markerPattern = new RegExp(`<<<${subtitle.index}>>>(.+?)(?=<<<|$)`, 's');
        const match = translatedBatchText.match(markerPattern);
        
        translatedSubtitles.push({
          index: subtitle.index,
          startTime: subtitle.startTime,
          endTime: subtitle.endTime,
          text: match && match[1] ? match[1].trim() : subtitle.text
        });
      }
      
      if (onProgress) {
        onProgress(translatedSubtitles.length, subtitles.length);
      }
      
      // 批次間延遲，避免速率限制（Pro 模型需要更長等待時間）
      if (i + batchSize < subtitles.length) {
        console.log('⏳ 等待 3 秒避免速率限制...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (batchError) {
      console.error(`❌ 批次 ${currentBatch} 翻譯失敗:`, batchError);
      
      // 如果批次翻譯失敗，該批次保持原文
      for (const subtitle of batch) {
        translatedSubtitles.push({
          index: subtitle.index,
          startTime: subtitle.startTime,
          endTime: subtitle.endTime,
          text: subtitle.text
        });
      }
      
      if (onProgress) {
        onProgress(translatedSubtitles.length, subtitles.length);
      }
    }
  }
  
  return translatedSubtitles;
}

/**
 * 批量翻譯（分組處理以提高效率）
 */
export async function batchTranslateSubtitles(
  subtitles: SRTSubtitle[],
  targetLanguages: Language[],
  apiKey: string,
  onProgress?: (languageCode: string, current: number, total: number) => void
): Promise<Map<string, SRTSubtitle[]>> {
  const results = new Map<string, SRTSubtitle[]>();
  
  for (const language of targetLanguages) {
    const translated = await translateSubtitles(
      subtitles,
      language,
      apiKey,
      (current, total) => {
        if (onProgress) {
          onProgress(language.code, current, total);
        }
      }
    );
    
    results.set(language.code, translated);
  }
  
  return results;
}

