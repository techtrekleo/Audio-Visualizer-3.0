import { SRTSubtitle, Language } from '../types';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';

/**
 * 使用 Gemini API 翻譯單個字幕塊（帶重試機制）
 */
async function translateText(text: string, targetLanguage: Language, apiKey: string, _retryCount = 0): Promise<string> {
  // 添加調試信息
  console.log('翻譯文本:', text);
  console.log('目標語言:', targetLanguage.name);
  console.log('文本長度:', text.length);
  
  // 使用原生語言名稱，讓 AI 更好地理解目標語言
  const targetLanguageName = targetLanguage.nativeName || targetLanguage.name;
  
  // 根據目標語言選擇合適的提示詞語言
  let prompt: string;
  if (targetLanguage.code.startsWith('zh')) {
    // 中文目標語言使用中文提示詞
    prompt = `請將以下文本翻譯成${targetLanguageName}。請保持原文的語氣、風格和格式，確保翻譯準確自然：\n\n${text}`;
  } else {
    // 其他語言使用英文提示詞，更通用
    prompt = `Please translate the following text to ${targetLanguageName} (${targetLanguage.name}). Maintain the original tone, style, and format. Ensure the translation is accurate and natural:\n\n${text}`;
  }
  
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
          text: targetLanguage.code.startsWith('zh') 
            ? "你是一個專業的多語言翻譯工具。請直接翻譯給定的文本到目標語言，保持原始格式和結構。確保翻譯準確、自然、符合目標語言的表達習慣。不要添加任何解釋、思考過程、額外內容或標記。只返回純粹的翻譯結果。"
            : "You are a professional multilingual translation tool. Please translate the given text to the target language while maintaining the original format and structure. Ensure the translation is accurate, natural, and follows the target language's expression patterns. Do not add any explanations, reasoning, additional content, or markers. Only return the pure translation result."
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
    console.error('API 錯誤回應:', errorData);
    
    // 提供更詳細的錯誤信息
    if (response.status === 400) {
      throw new Error(`翻譯請求格式錯誤 (400): ${errorData.error?.message || '請檢查 API Key 和請求格式'}`);
    } else if (response.status === 403) {
      throw new Error(`API 權限不足 (403): ${errorData.error?.message || '請檢查 API Key 是否有效'}`);
    } else if (response.status === 429) {
      throw new Error(`API 請求過於頻繁 (429): ${errorData.error?.message || '請稍後再試'}`);
    } else if (response.status >= 500) {
      throw new Error(`服務器錯誤 (${response.status}): ${errorData.error?.message || 'Google 服務暫時不可用，請稍後再試'}`);
    } else {
      throw new Error(`翻譯失敗 (${response.status}): ${errorData.error?.message || response.statusText}`);
    }
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
    console.log('使用標準 parts 結構獲取翻譯');
  } else if (candidate.content.text) {
    // 直接文本結構
    translatedText = candidate.content.text;
    console.log('使用直接 text 結構獲取翻譯');
  } else if (candidate.text) {
    // 頂層 text 結構
    translatedText = candidate.text;
    console.log('使用頂層 text 結構獲取翻譯');
  } else if (candidate.finishReason === 'MAX_TOKENS') {
    // 當達到 MAX_TOKENS 時，嘗試從其他地方獲取文本
    console.log('達到 MAX_TOKENS，嘗試其他方法獲取翻譯');
    // 檢查是否有部分回應
    if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
      translatedText = candidate.content.parts[0].text || '';
    }
    // 如果沒有找到翻譯結果，返回原文
    if (!translatedText) {
      console.warn('MAX_TOKENS 情況下未找到翻譯，返回原文');
      translatedText = text;
    }
  } else {
    console.error('API 回應結構:', candidate);
    console.error('完整的 API 回應:', JSON.stringify(data, null, 2));
    throw new Error('API 返回的數據結構不正確 - 無法找到翻譯文本');
  }

  if (!translatedText || translatedText.trim() === '') {
    console.error('翻譯結果為空，返回原文');
    return text;
  }

  const finalResult = translatedText.trim();
  
  // 檢查翻譯結果是否與原文相同（可能的翻譯失敗）
  if (finalResult === text.trim()) {
    console.warn('翻譯結果與原文相同，可能翻譯失敗');
  }
  
  console.log('最終翻譯結果:', finalResult);
  return finalResult;
}

/**
 * 帶重試機制的翻譯函數
 */
async function translateTextWithRetry(text: string, targetLanguage: Language, apiKey: string): Promise<string> {
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`🔄 重試翻譯 (第 ${attempt + 1} 次嘗試)...`);
        // 重試前等待
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
      }
      
      return await translateText(text, targetLanguage, apiKey, attempt);
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ 翻譯失敗 (第 ${attempt + 1} 次嘗試):`, error);
      
      // 如果是最後一次嘗試，拋出錯誤
      if (attempt === maxRetries) {
        break;
      }
      
      // 檢查是否是可重試的錯誤
      const errorMessage = lastError.message.toLowerCase();
      if (errorMessage.includes('429') || errorMessage.includes('rate limit') || 
          errorMessage.includes('500') || errorMessage.includes('503') || 
          errorMessage.includes('timeout')) {
        console.log(`⏳ 檢測到可重試錯誤，將在 ${(attempt + 1) * 2} 秒後重試...`);
        continue;
      } else {
        // 不可重試的錯誤，直接拋出
        break;
      }
    }
  }
  
  throw lastError || new Error('翻譯失敗：未知錯誤');
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
    
    // 整篇一次翻譯（使用重試機制）
    const translatedFullText = await translateTextWithRetry(fullText, targetLanguage, apiKey);
    
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
      let foundTranslation = false;
      
      if (match && match[1] && match[1].trim() !== '') {
        translatedText = match[1].trim();
        foundTranslation = true;
        console.log(`✅ 找到字幕 ${subtitle.index} 的翻譯:`, translatedText);
      } else {
        // 如果找不到標記，嘗試按行號匹配
        const lineIndex = subtitle.index - 1;
        if (translatedLines[lineIndex]) {
          const lineText = translatedLines[lineIndex]
            .replace(/^<<<\d+>>>/, '')
            .trim();
          if (lineText !== '') {
            translatedText = lineText;
            foundTranslation = true;
            console.log(`✅ 按行號找到字幕 ${subtitle.index} 的翻譯:`, translatedText);
          }
        }
      }
      
      if (!foundTranslation) {
        console.warn(`⚠️ 字幕 ${subtitle.index} 未找到翻譯，保持原文:`, subtitle.text);
      }
      
      translatedSubtitles.push({
        index: subtitle.index,
        startTime: subtitle.startTime,
        endTime: subtitle.endTime,
        text: translatedText
      });
      
      if (onProgress) {
        onProgress(translatedSubtitles.length, subtitles.length);
      }
    }
    
    // 統計翻譯成功率
    const translatedCount = translatedSubtitles.filter(sub => sub.text !== subtitles.find(orig => orig.index === sub.index)?.text).length;
    const successRate = ((translatedCount / subtitles.length) * 100).toFixed(1);
    console.log(`📊 整篇翻譯統計: ${translatedCount}/${subtitles.length} 條成功翻譯 (${successRate}%)`);
    
    if (successRate !== '100.0') {
      console.warn(`⚠️ 有 ${subtitles.length - translatedCount} 條字幕保持原文，請檢查翻譯結果`);
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
      
      const translatedBatchText = await translateTextWithRetry(batchText, targetLanguage, apiKey);
      
      for (const subtitle of batch) {
        const markerPattern = new RegExp(`<<<${subtitle.index}>>>(.+?)(?=<<<|$)`, 's');
        const match = translatedBatchText.match(markerPattern);
        
        let translatedText = subtitle.text;
        let foundTranslation = false;
        
        if (match && match[1] && match[1].trim() !== '') {
          translatedText = match[1].trim();
          foundTranslation = true;
          console.log(`✅ 批次中找到字幕 ${subtitle.index} 的翻譯:`, translatedText);
        }
        
        if (!foundTranslation) {
          console.warn(`⚠️ 批次中字幕 ${subtitle.index} 未找到翻譯，保持原文:`, subtitle.text);
        }
        
        translatedSubtitles.push({
          index: subtitle.index,
          startTime: subtitle.startTime,
          endTime: subtitle.endTime,
          text: translatedText
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
  
  // 統計翻譯成功率
  const translatedCount = translatedSubtitles.filter(sub => sub.text !== subtitles.find(orig => orig.index === sub.index)?.text).length;
  const successRate = ((translatedCount / subtitles.length) * 100).toFixed(1);
  console.log(`📊 分批翻譯統計: ${translatedCount}/${subtitles.length} 條成功翻譯 (${successRate}%)`);
  
  if (successRate !== '100.0') {
    console.warn(`⚠️ 有 ${subtitles.length - translatedCount} 條字幕保持原文，請檢查翻譯結果`);
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

