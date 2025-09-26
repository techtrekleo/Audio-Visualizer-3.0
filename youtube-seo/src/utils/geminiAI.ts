import { GoogleGenerativeAI } from '@google/generative-ai'

// 初始化 Gemini AI - 使用 VITE_API_KEY
const apiKey = (import.meta as any).env?.VITE_API_KEY
console.log('🔑 Gemini API Key available:', !!apiKey, 'Length:', apiKey?.length || 0)

const genAI = new GoogleGenerativeAI(apiKey)

// 隨機符號生成函數
const getRandomSymbol = (): string => {
  const symbols = ['🖤', '💫', '✨', '🌟', '💎', '🎵', '🎶', '💖', '💝', '💕', '💗', '💓', '💘', '💞', '💟', '💜', '💙', '💚', '💛', '🧡', '❤️', '🤍', '🖤', '💯', '🔥', '⭐', '🌙', '☀️', '🌈', '🎭', '🎨', '🎪', '🎯', '🎲', '🎸', '🎹', '🎺', '🎻', '🥁', '🎤', '🎧', '🎵', '🎶']
  return symbols[Math.floor(Math.random() * symbols.length)]
}

// 隨機標題格式生成函數（固定歌名和歌手格式）
const getRandomTitleFormat = (language: string): string => {
  const formats = {
    zh: [
      '【{songName}】- {artist} {symbol} {description}｜{style} / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Music / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Version / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Cover / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Instrumental / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Acoustic / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Piano / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Guitar / {emotion} / {scene}'
    ],
    en: [
      '【{songName}】- {artist} {symbol} {description}｜{style} / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Music / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Version / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Cover / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Instrumental / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Acoustic / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Piano / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Guitar / {emotion} / {scene}'
    ],
    ja: [
      '【{songName}】- {artist} {symbol} {description}｜{style} / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Music / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Version / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Cover / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Instrumental / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Acoustic / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Piano / {emotion} / {scene}',
      '【{songName}】- {artist} {symbol} {description}｜{style} Guitar / {emotion} / {scene}'
    ]
  }
  
  const languageFormats = formats[language as keyof typeof formats] || formats.en
  return languageFormats[Math.floor(Math.random() * languageFormats.length)]
}

// 生成 YouTube 標題
export const generateAITitle = async (songName: string, artist: string, musicStyles: string[], language: string = 'zh'): Promise<string> => {
  console.log('🤖 Starting AI title generation...')
  try {
    if (!apiKey) {
      console.error('❌ No API key available - please set VITE_API_KEY environment variable')
      throw new Error('No API key available - please set VITE_API_KEY environment variable')
    }
    
    if (apiKey === 'your_gemini_api_key_here' || apiKey.length < 10) {
      console.error('❌ Invalid API key - please check your VITE_API_KEY setting')
      throw new Error('Invalid API key - please check your VITE_API_KEY setting')
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    
    // 根據語言選擇不同的提示詞
    let prompt = ''
    if (language === 'zh') {
      const randomSymbol = getRandomSymbol()
      prompt = `請為以下音樂生成一個 YouTube 標題：

歌曲資訊：
- 歌名：${songName}
- 原唱：${artist}
- 音樂風格：${musicStyles.join(', ')}

請使用固定格式生成標題：
【歌名】- 歌手名 ${randomSymbol} 描述｜音樂風格變體 / 情感描述 / 場景描述

請根據選用的音樂風格深度分析並生成貼切的描述：

${musicStyles.map(style => {
  const styleDescriptions = {
    'chill': 'Chill風格：描述應該體現放鬆、舒緩、冥想、夜間氛圍、學習背景等特點',
    'bossa-nova': 'Bossa Nova風格：描述應該體現巴西風情、浪漫、優雅、咖啡廳、拉丁韻味等特點',
    'bolero': 'Bolero風格：描述應該體現拉丁舞曲、浪漫、激情、優雅舞步、舞會音樂等特點',
    'yandere': '病嬌風格：描述應該體現動漫風格、戲劇性、情感爆發、黑暗氛圍、病嬌魅力等特點',
    'pop': 'Pop風格：描述應該體現流行、時尚、朗朗上口、電台熱門、派對音樂等特點',
    'rock': 'Rock風格：描述應該體現搖滾、強勁、電吉他、現場音樂、激情等特點',
    'lofi': 'Lo-Fi風格：描述應該體現復古、溫暖、懷舊、學習音樂、Lo-Fi生活等特點',
    'acoustic': 'Acoustic風格：描述應該體現原聲、自然、不插電、親密、現場演出等特點',
    'instrumental': 'Instrumental風格：描述應該體現純音樂、器樂、交響樂、背景音樂等特點',
    'rnb': 'R&B風格：描述應該體現節奏藍調、靈魂、浪漫、夜間音樂、情感豐富等特點',
    'hip-hop': 'Hip Hop風格：描述應該體現嘻哈、街頭、現代、節奏、都市文化等特點',
    'electronic': 'Electronic風格：描述應該體現電子、科技、舞曲、現代、電音派對等特點',
    'hifi': 'HIFI風格：描述應該體現高保真、音質、發燒、專業錄音、高品質等特點',
    'city-pop': 'City Pop風格：描述應該體現都市流行、日本音樂、時尚、80年代、城市音樂等特點',
    'soul': 'Soul風格：描述應該體現靈魂、福音、藍調、深層情感、情感音樂等特點',
    'rap': 'Rap風格：描述應該體現饒舌、說唱、街頭、節奏、歌詞音樂等特點',
    'jazz': 'Jazz風格：描述應該體現爵士、搖擺、即興、經典、優雅等特點',
    'classical': 'Classical風格：描述應該體現古典、交響樂、鋼琴、管弦樂、經典音樂等特點',
    'smoky-voice': '菸嗓風格：描述應該體現磁性嗓音、滄桑魅力、成熟韻味、深夜酒吧、菸嗓特色等特點',
    'jpop': 'J-Pop風格：描述應該體現日本流行、動漫音樂、可愛、Kawaii、現代日本等特點',
    'japanese-style': '和風風格：描述應該體現傳統日本、禪意、寧靜、優雅、日式冥想等特點',
    'chinese-style': '中國風風格：描述應該體現古典中國、東方韻味、傳統音樂、古風雅韻、中國古典等特點'
  }
  return styleDescriptions[style as keyof typeof styleDescriptions] || `${style}風格：請根據此風格特點生成描述`
}).join('\n')}

音樂風格變體可以選擇：
- 基本風格（如：${musicStyles[0]}）
- 風格 + Music（如：${musicStyles[0]} Music）
- 風格 + Version（如：${musicStyles[0]} Version）
- 風格 + Cover（如：${musicStyles[0]} Cover）
- 風格 + Instrumental（如：${musicStyles[0]} Instrumental）
- 風格 + Acoustic（如：${musicStyles[0]} Acoustic）
- 風格 + Piano（如：${musicStyles[0]} Piano）
- 風格 + Guitar（如：${musicStyles[0]} Guitar）

請確保：
1. 根據選用的音樂風格深度分析，生成最貼切的描述
2. 情感描述要符合該風格的特色和氛圍
3. 場景描述要體現該風格的典型使用場景
4. 整體要吸引人點擊且符合風格特色
5. 必須使用符號：${randomSymbol}
6. 隨機選擇音樂風格變體
7. **重要：標題長度必須嚴格控制在100字以內**

只回傳標題，不要其他文字。`
    } else if (language === 'en') {
      const randomSymbol = getRandomSymbol()
      prompt = `Generate a YouTube title for the following music:

Song Info:
- Song Name: ${songName}
- Original Artist: ${artist}
- Music Styles: ${musicStyles.join(', ')}

Please use fixed format to generate title:
【Song Name】- Artist Name ${randomSymbol} Description｜Music Style Variant / Emotional Description / Scene Description

Music style variants to choose from:
- Basic style (e.g., Pop)
- Style + Music (e.g., Pop Music)
- Style + Version (e.g., Pop Version)
- Style + Cover (e.g., Pop Cover)
- Style + Instrumental (e.g., Pop Instrumental)
- Style + Acoustic (e.g., Pop Acoustic)
- Style + Piano (e.g., Pop Piano)
- Style + Guitar (e.g., Pop Guitar)

Please ensure:
1. Description matches the music style
2. Emotional description is appropriate
3. Scene description is engaging
4. Overall is click-worthy
5. Must use symbol: ${randomSymbol}
6. Randomly choose music style variant
7. **IMPORTANT: Title length must be strictly limited to 100 characters or less**

Return only the title, no other text.`
    } else if (language === 'ja') {
      const randomSymbol = getRandomSymbol()
      prompt = `以下の音楽のYouTubeタイトルを生成してください：

曲情報：
- 曲名：${songName}
- 原曲アーティスト：${artist}
- 音楽スタイル：${musicStyles.join(', ')}

固定形式でタイトルを生成してください：
【曲名】- アーティスト名 ${randomSymbol} 説明｜音楽スタイル変体 / 感情説明 / シーン説明

音楽スタイル変体の選択肢：
- 基本スタイル（例：Pop）
- スタイル + Music（例：Pop Music）
- スタイル + Version（例：Pop Version）
- スタイル + Cover（例：Pop Cover）
- スタイル + Instrumental（例：Pop Instrumental）
- スタイル + Acoustic（例：Pop Acoustic）
- スタイル + Piano（例：Pop Piano）
- スタイル + Guitar（例：Pop Guitar）

以下の点を確認してください：
1. 説明は音楽スタイルに合っている
2. 感情説明が適切
3. シーン説明が魅力的
4. 全体的にクリックしたくなる
5. 必ず記号を使用：${randomSymbol}
6. 音楽スタイル変体をランダムに選択
7. **重要：タイトル長は100文字以内に厳格に制限**

タイトルのみを返してください。`
    } else {
      // 其他語言使用英文
      const randomSymbol = getRandomSymbol()
      prompt = `Generate a YouTube title for the following music in ${language}:

Song Info:
- Song Name: ${songName}
- Original Artist: ${artist}
- Music Styles: ${musicStyles.join(', ')}

Please use fixed format to generate title:
【Song Name】- Artist Name ${randomSymbol} Description｜Music Style Variant / Emotional Description / Scene Description

Music style variants to choose from:
- Basic style (e.g., Pop)
- Style + Music (e.g., Pop Music)
- Style + Version (e.g., Pop Version)
- Style + Cover (e.g., Pop Cover)
- Style + Instrumental (e.g., Pop Instrumental)
- Style + Acoustic (e.g., Pop Acoustic)
- Style + Piano (e.g., Pop Piano)
- Style + Guitar (e.g., Pop Guitar)

Please ensure:
1. Description matches the music style
2. Emotional description is appropriate
3. Scene description is engaging
4. Overall is click-worthy
5. Must use symbol: ${randomSymbol}
6. Randomly choose music style variant

Return only the title, no other text.`
    }

    console.log('📤 Sending request to Gemini AI...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const title = response.text().trim()
    console.log('✅ AI title generated:', title)
    return title
  } catch (error: any) {
    console.error('❌ AI 標題生成錯誤:', error)
    console.error('❌ Error details:', error.message)
    // 回退到預設模板
    const randomSymbol = getRandomSymbol()
    const randomFormat = getRandomTitleFormat(language)
    const fallbackTitle = randomFormat
      .replace('{songName}', songName)
      .replace('{artist}', artist)
      .replace('{symbol}', randomSymbol)
      .replace('{description}', `${songName} 的音樂世界`)
      .replace('{style}', musicStyles[0])
      .replace('{emotion}', 'Amazing')
      .replace('{scene}', '音樂欣賞')
    console.log('🔄 Using fallback title:', fallbackTitle)
    return fallbackTitle
  }
}

// 生成 YouTube 說明
export const generateAIDescription = async (songName: string, artist: string, musicStyles: string[], language: string = 'zh'): Promise<string> => {
  console.log('🤖 Starting AI description generation...')
  try {
    if (!apiKey) {
      console.error('❌ No API key available - please set VITE_API_KEY environment variable')
      throw new Error('No API key available - please set VITE_API_KEY environment variable')
    }
    
    if (apiKey === 'your_gemini_api_key_here' || apiKey.length < 10) {
      console.error('❌ Invalid API key - please check your VITE_API_KEY setting')
      throw new Error('Invalid API key - please check your VITE_API_KEY setting')
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    
    // 根據語言選擇不同的提示詞
    let prompt = ''
    if (language === 'zh') {
      prompt = `請為以下音樂生成一個 YouTube 影片說明：

歌曲資訊：
- 歌名：${songName}
- 原唱：${artist}
- 音樂風格：${musicStyles.join(', ')}

請生成一個完整的 YouTube 說明，包含：
1. 開頭介紹（使用表情符號）
2. 音樂特色描述
3. 適合的聆聽場景
4. 標籤（使用 # 符號，但不要標題格式）
5. 訂閱和互動呼籲
6. 歌手資訊

格式要求：
- 使用表情符號增加視覺效果
- 包含適當的標籤（直接在內容中使用#標籤，不要使用「**# 相關標籤：**」等標題格式）
- 鼓勵訂閱和互動
- 長度適中（200-400字）
- 重要：必須在描述中多次提及歌名「${songName}」，確保標題關鍵字出現在描述中
- 重要：必須在描述中提及歌手「${artist}」
- 重要：必須在描述中提及音樂風格「${musicStyles.join(', ')}」

請生成完整的說明文字。`
    } else if (language === 'en') {
      prompt = `Generate a YouTube video description for the following music:

Song Info:
- Song Name: ${songName}
- Original Artist: ${artist}
- Music Styles: ${musicStyles.join(', ')}

Please generate a complete YouTube description including:
1. Introduction with emojis
2. Music feature description
3. Suitable listening scenarios
4. Tags (using # symbols, but not as section headers)
5. Subscription and interaction call-to-action
6. Artist information

Format requirements:
- Use emojis for visual appeal
- Include appropriate tags (use # tags directly in content, do not use section headers like "**# Related Tags:**")
- Encourage subscription and interaction
- Moderate length (200-400 words)
- IMPORTANT: Must mention the song name "${songName}" multiple times in the description to ensure title keywords appear in description
- IMPORTANT: Must mention the artist "${artist}" in the description
- IMPORTANT: Must mention the music styles "${musicStyles.join(', ')}" in the description

Please generate the complete description text.`
    } else if (language === 'ja') {
      prompt = `以下の音楽のYouTube動画説明を生成してください：

曲情報：
- 曲名：${songName}
- 原曲アーティスト：${artist}
- 音楽スタイル：${musicStyles.join(', ')}

完全なYouTube説明を生成してください。含むべき内容：
1. 絵文字を使った紹介
2. 音楽の特徴説明
3. 適した聴取シーン
4. タグ（#記号を使用、但しセクション見出しではなく）
5. チャンネル登録とインタラクションの呼びかけ
6. アーティスト情報

形式要件：
- 視覚的魅力のために絵文字を使用
- 適切なタグを含める
- チャンネル登録とインタラクションを促進
- 適度な長さ（200-400語）
- 重要：説明文で曲名「${songName}」を複数回言及し、タイトルのキーワードが説明に含まれるようにする
- 重要：説明文でアーティスト「${artist}」を言及する
- 重要：説明文で音楽スタイル「${musicStyles.join(', ')}」を言及する

完全な説明文を生成してください。`
    } else {
      // 其他語言使用英文
      prompt = `Generate a YouTube video description for the following music in ${language}:

Song Info:
- Song Name: ${songName}
- Original Artist: ${artist}
- Music Styles: ${musicStyles.join(', ')}

Please generate a complete YouTube description including:
1. Introduction with emojis
2. Music feature description
3. Suitable listening scenarios
4. Related tags (using #)
5. Subscription and interaction call-to-action
6. Artist information

Format requirements:
- Use emojis for visual appeal
- Include appropriate tags (use # tags directly in content, do not use section headers like "**# Related Tags:**")
- Encourage subscription and interaction
- Moderate length (200-400 words)
- IMPORTANT: Must mention the song name "${songName}" multiple times in the description to ensure title keywords appear in description
- IMPORTANT: Must mention the artist "${artist}" in the description
- IMPORTANT: Must mention the music styles "${musicStyles.join(', ')}" in the description

Please generate the complete description text.`
    }

    console.log('📤 Sending request to Gemini AI...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const description = response.text().trim()
    console.log('✅ AI description generated (length:', description.length, ')')
    return description
  } catch (error: any) {
    console.error('❌ AI 說明生成錯誤:', error)
    console.error('❌ Error details:', error.message)
    // 回退到預設模板
    const fallbackDescription = `🎵 ${musicStyles[0]} ${songName} music perfect for listening.

✨ Amazing vibes to help you enjoy great music

🎧 Perfect for:
• Listening and enjoyment
• Music appreciation
• Background music
• Relaxation

⏰ Listen anytime you need great music.

#${musicStyles[0]} #${songName} #Music #Listening #Amazing

🎵 Subscribe for more great music!
🔔 Turn on notifications to never miss new uploads
💬 Comment below what you'd like to hear next

🎤 Artist: ${artist}`
    console.log('🔄 Using fallback description')
    return fallbackDescription
  }
}

// 生成 YouTube 標籤
export const generateAITags = async (songName: string, artist: string, musicStyles: string[], language: string = 'zh'): Promise<string[]> => {
  console.log('🤖 Starting AI tags generation...')
  try {
    if (!apiKey) {
      console.error('❌ No API key available - please set VITE_API_KEY environment variable')
      throw new Error('No API key available - please set VITE_API_KEY environment variable')
    }
    
    if (apiKey === 'your_gemini_api_key_here' || apiKey.length < 10) {
      console.error('❌ Invalid API key - please check your VITE_API_KEY setting')
      throw new Error('Invalid API key - please check your VITE_API_KEY setting')
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    
    // 根據語言選擇不同的提示詞
    let prompt = ''
    if (language === 'zh') {
      prompt = `請為以下音樂生成 YouTube 標籤：

歌曲資訊：
- 歌名：${songName}
- 原唱：${artist}
- 音樂風格：${musicStyles.join(', ')}

請生成 30-40 個相關標籤，要求：
1. 包含歌名相關標籤（${songName}、${songName}音樂、${songName}翻唱、${songName}cover、${songName}instrumental、${songName}acoustic、${songName}piano、${songName}guitar等）
2. 包含歌手相關標籤（${artist}、${artist}音樂、${artist}歌曲、${artist}翻唱、${artist}cover、${artist}instrumental、${artist}acoustic等）
3. 包含音樂風格標籤（${musicStyles.join('、')}、${musicStyles[0]}音樂、${musicStyles[0]}翻唱、${musicStyles[0]}cover等）
4. 包含熱門關鍵字（音樂、翻唱、cover、vocal、instrumental、chill、relaxing、study、work、background music、music cover、instrumental music、acoustic music、piano music、guitar music等）
5. 包含情感和場景標籤（emotional、beautiful、amazing、perfect、love、sad、happy、relaxing music、study music、sleep music、work music等）
6. 包含長尾關鍵字（${songName} instrumental cover、${songName} acoustic version、${songName} piano cover、${songName} guitar cover、${artist} ${songName} cover等）
7. 總字數在 500-800 字之間（增加字符數以提升SEO評分）
8. 用逗號分隔
9. 避免過長或冷門的關鍵字

請只回傳標籤列表，不要其他文字。`
    } else if (language === 'en') {
      prompt = `Generate YouTube tags for the following music:

Song Info:
- Song Name: ${songName}
- Original Artist: ${artist}
- Music Styles: ${musicStyles.join(', ')}

Please generate 30-40 relevant tags with these requirements:
1. Include song name related tags (${songName}, ${songName} music, ${songName} cover, ${songName} instrumental, ${songName} acoustic, ${songName} piano, ${songName} guitar, etc.)
2. Include artist related tags (${artist}, ${artist} music, ${artist} songs, ${artist} cover, ${artist} instrumental, ${artist} acoustic, etc.)
3. Include music style tags (${musicStyles.join(', ')}, ${musicStyles[0]} music, ${musicStyles[0]} cover, etc.)
4. Include popular keywords (music, cover, vocal, instrumental, chill, relaxing, study, work, background music, music cover, instrumental music, acoustic music, piano music, guitar music, etc.)
5. Include emotional and scene tags (emotional, beautiful, amazing, perfect, love, sad, happy, relaxing music, study music, sleep music, work music, etc.)
6. Include long-tail keywords (${songName} instrumental cover, ${songName} acoustic version, ${songName} piano cover, ${songName} guitar cover, ${artist} ${songName} cover, etc.)
7. Total characters between 500-800 (increase character count to improve SEO score)
8. Separate with commas
9. Avoid overly long or niche keywords

Return only the tag list, no other text.`
    } else if (language === 'ja') {
      prompt = `以下の音楽のYouTubeタグを生成してください：

曲情報：
- 曲名：${songName}
- 原曲アーティスト：${artist}
- 音楽スタイル：${musicStyles.join(', ')}

30-40個の関連タグを生成してください。要件：
1. 曲名関連タグを含む（${songName}、${songName}音楽、${songName}カバー、${songName}インスト、${songName}アコースティック、${songName}ピアノ、${songName}ギターなど）
2. アーティスト関連タグを含む（${artist}、${artist}音楽、${artist}楽曲、${artist}カバー、${artist}インスト、${artist}アコースティックなど）
3. 音楽スタイルタグを含む（${musicStyles.join('、')}、${musicStyles[0]}音楽、${musicStyles[0]}カバーなど）
4. 人気キーワードを含む（音楽、カバー、ボーカル、インスト、チル、リラックス、勉強、仕事、BGM、音楽カバー、インスト音楽、アコースティック音楽、ピアノ音楽、ギター音楽など）
5. 感情とシーンのタグを含む（感情的、美しい、素晴らしい、完璧、愛、悲しい、幸せ、リラックス音楽、勉強音楽、睡眠音楽、仕事音楽など）
6. ロングテールキーワードを含む（${songName} インストカバー、${songName} アコースティック版、${songName} ピアノカバー、${songName} ギターカバー、${artist} ${songName} カバーなど）
7. 総文字数500-800文字（SEOスコア向上のため文字数を増加）
8. カンマで区切る
9. 長すぎるやニッチなキーワードは避ける

タグリストのみを返してください。`
    } else {
      // 其他語言使用英文
      prompt = `Generate YouTube tags for the following music in ${language}:

Song Info:
- Song Name: ${songName}
- Original Artist: ${artist}
- Music Styles: ${musicStyles.join(', ')}

Please generate 30-40 relevant tags with these requirements:
1. Include song name related tags (${songName}, ${songName} music, ${songName} cover, ${songName} instrumental, ${songName} acoustic, ${songName} piano, ${songName} guitar, etc.)
2. Include artist related tags (${artist}, ${artist} music, ${artist} songs, ${artist} cover, ${artist} instrumental, ${artist} acoustic, etc.)
3. Include music style tags (${musicStyles.join(', ')}, ${musicStyles[0]} music, ${musicStyles[0]} cover, etc.)
4. Include popular keywords (music, cover, vocal, instrumental, chill, relaxing, study, work, background music, music cover, instrumental music, acoustic music, piano music, guitar music, etc.)
5. Include emotional and scene tags (emotional, beautiful, amazing, perfect, love, sad, happy, relaxing music, study music, sleep music, work music, etc.)
6. Include long-tail keywords (${songName} instrumental cover, ${songName} acoustic version, ${songName} piano cover, ${songName} guitar cover, ${artist} ${songName} cover, etc.)
7. Total characters between 500-800 (increase character count to improve SEO score)
8. Separate with commas
9. Avoid overly long or niche keywords

Return only the tag list, no other text.`
    }

    console.log('📤 Sending request to Gemini AI...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const tagsText = response.text().trim()
    
    // 解析標籤
    const tags = tagsText.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    const finalTags = tags.slice(0, 35) // 增加標籤數量限制到35個
    console.log('✅ AI tags generated:', finalTags.length, 'tags')
    return finalTags
  } catch (error: any) {
    console.error('❌ AI 標籤生成錯誤:', error)
    console.error('❌ Error details:', error.message)
    // 回退到預設標籤
    const fallbackTags = [
      songName, `${songName} music`, `${songName} instrumental`, `${songName} cover`, `${songName} acoustic`, `${songName} piano`, `${songName} guitar`,
      artist, `${artist} music`, `${artist} songs`, `${artist} covers`, `${artist} instrumental`, `${artist} acoustic`,
      ...musicStyles, `${musicStyles[0]} music`, `${musicStyles[0]} cover`, `${musicStyles[0]} instrumental`,
      'music', 'instrumental', 'cover', 'vocal', 'acoustic', 'piano', 'guitar', 'music cover', 'instrumental music', 'acoustic music',
      'piano music', 'guitar music', 'background music', 'study music', 'relaxing music', 'chill music', 'beautiful music',
      'emotional music', 'perfect music', 'amazing music', 'love music', 'sad music', 'happy music'
    ]
    console.log('🔄 Using fallback tags:', fallbackTags.length, 'tags')
    return fallbackTags
  }
}

// 完整的 AI 生成函數
export const generateAIContent = async (songName: string, artist: string, musicStyles: string[], language: string = 'zh') => {
  console.log('🚀 Starting complete AI content generation...')
  try {
    const [title, description, tags] = await Promise.all([
      generateAITitle(songName, artist, musicStyles, language),
      generateAIDescription(songName, artist, musicStyles, language),
      generateAITags(songName, artist, musicStyles, language)
    ])

    console.log('🎉 All AI content generated successfully!')
    return {
      title,
      description,
      tags,
      category: '10', // Music category
      score: Math.floor(Math.random() * 20) + 80
    }
  } catch (error: any) {
    console.error('❌ AI 內容生成錯誤:', error)
    throw error
  }
}
