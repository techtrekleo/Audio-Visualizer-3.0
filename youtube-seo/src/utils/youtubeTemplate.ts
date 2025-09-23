export interface YouTubeTemplate {
  title: string
  description: string
  tags: string[]
  category: string
  score: number
}

// 隨機符號生成函數
const getRandomSymbol = (): string => {
  const symbols = ['🖤', '💫', '✨', '🌟', '💎', '🎵', '🎶', '💖', '💝', '💕', '💗', '💓', '💘', '💞', '💟', '💜', '💙', '💚', '💛', '🧡', '❤️', '🤍', '🖤', '💯', '🔥', '⭐', '🌙', '☀️', '🌈', '🎭', '🎨', '🎪', '🎯', '🎲', '🎸', '🎹', '🎺', '🎻', '🥁', '🎤', '🎧', '🎵', '🎶']
  return symbols[Math.floor(Math.random() * symbols.length)]
}

// 隨機標題格式生成函數（固定歌名和歌手格式）
const getRandomTitleFormat = (): string => {
  const formats = [
    '【{topic}】- {artist} {symbol} {description}｜{style} / {emotion} / {scene}',
    '【{topic}】- {artist} {symbol} {description}｜{style} Music / {emotion} / {scene}',
    '【{topic}】- {artist} {symbol} {description}｜{style} Version / {emotion} / {scene}',
    '【{topic}】- {artist} {symbol} {description}｜{style} Cover / {emotion} / {scene}',
    '【{topic}】- {artist} {symbol} {description}｜{style} Instrumental / {emotion} / {scene}',
    '【{topic}】- {artist} {symbol} {description}｜{style} Acoustic / {emotion} / {scene}',
    '【{topic}】- {artist} {symbol} {description}｜{style} Piano / {emotion} / {scene}',
    '【{topic}】- {artist} {symbol} {description}｜{style} Guitar / {emotion} / {scene}'
  ]
  return formats[Math.floor(Math.random() * formats.length)]
}

export interface MusicTemplateData {
  musicCategory: string
  topic: string
  activity?: string
  mood?: string
  artist?: string
  year?: string
  language?: string
  additionalStyles?: string[]
}

// 音樂類別對應的 YouTube 分類 ID
export const musicCategoryIds: { [key: string]: string } = {
  'chill': '10', 'bossa-nova': '10', 'bolero': '10', 'yandere': '10',
  'pop': '10', 'rock': '10', 'lofi': '10', 'acoustic': '10',
  'instrumental': '10', 'rnb': '10', 'hip-hop': '10', 'electronic': '10',
  'hifi': '10', 'city-pop': '10', 'soul': '10', 'rap': '10',
  'jazz': '10', 'classical': '10', 'smoky-voice': '10', 'jpop': '10',
  'japanese-style': '10', 'chinese-style': '10'
}

// 生成 YouTube 標題
export const generateYouTubeTitle = (data: MusicTemplateData): string => {
  const { musicCategory, topic, activity, mood, artist } = data
  
  // 音樂風格對應的英文名稱
  const styleNames: { [key: string]: string } = {
    'chill': 'Chill Lofi',
    'bossa-nova': 'Bossa Nova',
    'bolero': 'Bolero',
    'yandere': 'Yandere',
    'pop': 'Pop',
    'rock': 'Rock',
    'lofi': 'Lo-Fi',
    'acoustic': 'Acoustic',
    'instrumental': 'Instrumental',
    'rnb': 'R&B',
    'hip-hop': 'Hip Hop',
    'electronic': 'Electronic',
    'hifi': 'HIFI',
    'city-pop': 'City Pop',
    'soul': 'Soul',
    'rap': 'Rap',
    'jazz': 'Jazz',
    'classical': 'Classical',
    'smoky-voice': 'Smoky Voice',
    'jpop': 'J-Pop',
    'japanese-style': 'Japanese Style',
    'chinese-style': 'Chinese Style'
  }

  // 情感描述模板
  const emotionDescriptions: { [key: string]: string[] } = {
    'chill': ['Relaxing', 'Peaceful', 'Calm', 'Soothing', 'Tranquil'],
    'bossa-nova': ['Romantic', 'Smooth', 'Elegant', 'Sophisticated', 'Charming'],
    'bolero': ['Passionate', 'Romantic', 'Elegant', 'Dramatic', 'Intense'],
    'yandere': ['Dramatic', 'Intense', 'Emotional', 'Dark', 'Obsessive'],
    'pop': ['Catchy', 'Trendy', 'Energetic', 'Upbeat', 'Fun'],
    'rock': ['Powerful', 'Energetic', 'Dynamic', 'Electric', 'Intense'],
    'lofi': ['Warm', 'Nostalgic', 'Relaxing', 'Chill', 'Cozy'],
    'acoustic': ['Natural', 'Intimate', 'Organic', 'Pure', 'Authentic'],
    'instrumental': ['Pure', 'Refined', 'Majestic', 'Classical', 'Orchestral'],
    'rnb': ['Smooth', 'Soulful', 'Emotional', 'Romantic', 'Sensual'],
    'hip-hop': ['Urban', 'Modern', 'Energetic', 'Street', 'Dynamic'],
    'electronic': ['Energetic', 'Modern', 'Dynamic', 'Electronic', 'Futuristic'],
    'hifi': ['Premium', 'Clear', 'High Quality', 'Studio', 'Audiophile'],
    'city-pop': ['Fashionable', 'Urban', 'Sophisticated', 'Modern', 'Stylish'],
    'soul': ['Deep', 'Emotional', 'Passionate', 'Soulful', 'Gospel'],
    'rap': ['Urban', 'Rhythmic', 'Street', 'Lyrical', 'Dynamic'],
    'jazz': ['Smooth', 'Sophisticated', 'Classic', 'Elegant', 'Swing'],
    'classical': ['Timeless', 'Refined', 'Majestic', 'Elegant', 'Symphonic'],
    'smoky-voice': ['Magnetic', 'Charismatic', 'Sultry', 'Deep', 'Raspy'],
    'jpop': ['Kawaii', 'Trendy', 'Energetic', 'Modern', 'Cute'],
    'japanese-style': ['Zen', 'Peaceful', 'Elegant', 'Minimalist', 'Meditative'],
    'chinese-style': ['Elegant', 'Ancient', 'Oriental', 'Classical', 'Traditional']
  }

  // 場景描述模板
  const sceneDescriptions: { [key: string]: string[] } = {
    'chill': ['夜雨思念BGM', '深夜放鬆', '冥想音樂', '學習背景', '睡眠音樂'],
    'bossa-nova': ['咖啡廳音樂', '浪漫晚餐', '巴西風情', '拉丁音樂', '優雅時光'],
    'bolero': ['舞會音樂', '浪漫約會', '拉丁舞曲', '激情時刻', '優雅舞步'],
    'yandere': ['動漫配樂', '戲劇場景', '情感爆發', '黑暗氛圍', '病嬌風格'],
    'pop': ['流行音樂', '電台熱門', '派對音樂', '日常聆聽', '時尚音樂'],
    'rock': ['搖滾演唱會', '派對音樂', '運動配樂', '激情時刻', '現場音樂'],
    'lofi': ['Lo-Fi 學習', '復古氛圍', '懷舊時光', '溫暖音樂', 'Lo-Fi 生活'],
    'acoustic': ['現場演出', '不插電音樂', '自然音樂', '親密時刻', '原聲吉他'],
    'instrumental': ['純音樂', '古典音樂', '交響樂', '背景音樂', '器樂演奏'],
    'rnb': ['R&B 音樂', '靈魂音樂', '浪漫時刻', '夜間音樂', '節奏藍調'],
    'hip-hop': ['嘻哈音樂', '街頭文化', '現代音樂', '派對音樂', '都市音樂'],
    'electronic': ['電子音樂', '舞曲音樂', '電音派對', '現代音樂', '科技音樂'],
    'hifi': ['高保真音樂', '發燒音樂', '音質音樂', '專業錄音', '高品質音樂'],
    'city-pop': ['都市流行', '日本音樂', '時尚音樂', '80年代', '城市音樂'],
    'soul': ['靈魂音樂', '福音音樂', '藍調音樂', '情感音樂', '深層音樂'],
    'rap': ['饒舌音樂', '說唱音樂', '街頭音樂', '節奏音樂', '歌詞音樂'],
    'jazz': ['爵士音樂', '搖擺音樂', '即興音樂', '經典爵士', '優雅爵士'],
    'classical': ['古典音樂', '交響樂', '鋼琴音樂', '管弦樂', '經典音樂'],
    'smoky-voice': ['菸嗓魅力', '磁性嗓音', '滄桑音樂', '深夜酒吧', '成熟魅力'],
    'jpop': ['J-Pop 音樂', '動漫音樂', '可愛音樂', '日本流行', 'Kawaii 風格'],
    'japanese-style': ['和風音樂', '禪意音樂', '日式冥想', '傳統和風', '寧靜時光'],
    'chinese-style': ['中國風音樂', '古典中國', '東方韻味', '傳統音樂', '古風雅韻']
  }

  // 歌手名稱處理
  const artistName = artist || 'Unknown Artist'
  
  // 隨機選擇情感描述和場景描述
  const emotions = emotionDescriptions[musicCategory] || emotionDescriptions['pop']
  const scenes = sceneDescriptions[musicCategory] || sceneDescriptions['pop']
  
  const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]
  const randomScene = scenes[Math.floor(Math.random() * emotions.length)]
  const styleName = styleNames[musicCategory] || 'Music'

  // 生成描述性文字
  const descriptions = [
    `${topic} 的音樂世界`,
    `${topic} 的情感表達`,
    `${topic} 的音樂故事`,
    `${topic} 的旋律時光`,
    `${topic} 的音樂旅程`,
    `${topic} 的靈魂之聲`,
    `${topic} 的音樂回憶`,
    `${topic} 的旋律心情`,
    `${topic} 的音樂時刻`,
    `${topic} 的旋律故事`
  ]
  
  const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)]

  // 組合標題
  const randomSymbol = getRandomSymbol()
  const randomFormat = getRandomTitleFormat()
  return randomFormat
    .replace('{topic}', topic)
    .replace('{artist}', artistName)
    .replace('{symbol}', randomSymbol)
    .replace('{description}', randomDescription)
    .replace('{style}', styleName)
    .replace('{emotion}', randomEmotion)
    .replace('{scene}', randomScene)
}

// 生成 YouTube 說明
export const generateYouTubeDescription = (data: MusicTemplateData): string => {
  const { musicCategory, topic, activity, mood, artist, year, language } = data
  
  let description = `🎵 ${musicCategory.charAt(0).toUpperCase() + musicCategory.slice(1)} ${topic} music perfect for ${activity || 'listening'}.`

  // 如果有歌手名字，加入到說明中
  if (artist) {
    description += `\n\n🎤 Original Artist: ${artist}`
  }

  description += `\n\n✨ ${mood ? mood.charAt(0).toUpperCase() + mood.slice(1) : 'Amazing'} vibes to help you enjoy great music

🎧 Perfect for:
• ${activity || 'Listening'} and enjoyment
• Music appreciation
• Background music
• Relaxation

⏰ Listen anytime you need great music.

#${musicCategory.charAt(0).toUpperCase() + musicCategory.slice(1)} #${topic} #Music #${activity || 'Listening'} #${mood || 'Amazing'}`

  // 如果有歌手名字，加入到標籤中
  if (artist) {
    description += ` #${artist.replace(/\s+/g, '')}`
  }

  description += `

🎵 Subscribe for more great music!
🔔 Turn on notifications to never miss new uploads
💬 Comment below what you'd like to hear next

${artist ? `🎤 Artist: ${artist}` : ''}
${year ? `📅 Year: ${year}` : ''}
${language ? `🌍 Language: ${language}` : ''}`

  return description
}

// 生成 YouTube 標籤
export const generateYouTubeTags = (data: MusicTemplateData): string[] => {
  const { musicCategory, topic, activity, mood, additionalStyles = [], artist } = data
  
  const baseTags: { [key: string]: string[] } = {
    'chill': ['chill', 'relaxing', 'ambient', 'lo-fi', 'chillhop', 'chillout', 'meditation', 'study', 'sleep', 'peaceful', 'calm', 'soothing', 'chill music', 'relaxing music', 'ambient music', 'lo-fi music', 'study music', 'sleep music', 'peaceful music', 'calm music', 'soothing music', 'chill vibes', 'relaxing vibes', 'ambient vibes', 'lo-fi vibes', 'study vibes', 'sleep vibes', 'peaceful vibes', 'calm vibes', 'soothing vibes'],
    'pop': ['pop', 'popular', 'mainstream', 'chart', 'hit', 'radio', 'contemporary', 'vocal', 'trendy', 'catchy', 'pop music', 'popular music', 'mainstream music', 'chart music', 'hit music', 'radio music', 'contemporary music', 'vocal music', 'trendy music', 'catchy music', 'pop hits', 'popular hits', 'mainstream hits', 'chart hits', 'radio hits', 'contemporary hits', 'vocal hits', 'trendy hits', 'catchy hits', 'pop vibes', 'popular vibes', 'mainstream vibes', 'chart vibes', 'radio vibes', 'contemporary vibes', 'vocal vibes', 'trendy vibes', 'catchy vibes']
  }

  // 收集所有選中風格的標籤
  const allStyleTags: string[] = []
  const selectedStyles = [musicCategory, ...additionalStyles]
  
  selectedStyles.forEach(style => {
    if (baseTags[style]) {
      allStyleTags.push(...baseTags[style])
    }
  })

  const topicTags = [topic, `${topic} music`, `${topic} instrumental`, `${topic} cover`, `${topic} version`, `${topic} remix`, `${topic} acoustic`, `${topic} piano`, `${topic} guitar`, `${topic} instrumental`, `${topic} no vocals`, `${topic} karaoke`, `${topic} backing track`, `${topic} instrumental version`, `${topic} acoustic version`, `${topic} piano version`, `${topic} guitar version`, `${topic} remix version`, `${topic} cover version`, `${topic} music cover`, `${topic} instrumental cover`, `${topic} acoustic cover`, `${topic} piano cover`, `${topic} guitar cover`, `${topic} remix cover`, `${topic} music version`, `${topic} instrumental music`, `${topic} acoustic music`, `${topic} piano music`, `${topic} guitar music`, `${topic} remix music`, `${topic} cover music`, `${topic} music instrumental`, `${topic} music acoustic`, `${topic} music piano`, `${topic} music guitar`, `${topic} music remix`, `${topic} music cover`]
  
  // 如果有歌手名字，加入歌手相關標籤
  const artistTags = artist ? [
    artist, 
    `${artist} music`, 
    `${artist} songs`, 
    `${artist} hits`, 
    `${artist} covers`, 
    `${artist} instrumental`, 
    `${artist} acoustic`, 
    `${artist} piano`, 
    `${artist} guitar`, 
    `${artist} remix`, 
    `${artist} version`, 
    `${artist} karaoke`, 
    `${artist} backing track`, 
    `${artist} instrumental version`, 
    `${artist} acoustic version`, 
    `${artist} piano version`, 
    `${artist} guitar version`, 
    `${artist} remix version`, 
    `${artist} cover version`, 
    `${artist} music cover`, 
    `${artist} instrumental cover`, 
    `${artist} acoustic cover`, 
    `${artist} piano cover`, 
    `${artist} guitar cover`, 
    `${artist} remix cover`, 
    `${artist} music version`, 
    `${artist} instrumental music`, 
    `${artist} acoustic music`, 
    `${artist} piano music`, 
    `${artist} guitar music`, 
    `${artist} remix music`, 
    `${artist} cover music`, 
    `${artist} music instrumental`, 
    `${artist} music acoustic`, 
    `${artist} music piano`, 
    `${artist} music guitar`, 
    `${artist} music remix`, 
    `${artist} music cover`,
    `${topic} ${artist}`,
    `${topic} by ${artist}`,
    `${topic} ${artist} cover`,
    `${topic} ${artist} version`,
    `${topic} ${artist} instrumental`,
    `${topic} ${artist} acoustic`,
    `${topic} ${artist} piano`,
    `${topic} ${artist} guitar`,
    `${topic} ${artist} remix`,
    `${artist} ${topic}`,
    `${artist} ${topic} cover`,
    `${artist} ${topic} version`,
    `${artist} ${topic} instrumental`,
    `${artist} ${topic} acoustic`,
    `${artist} ${topic} piano`,
    `${artist} ${topic} guitar`,
    `${artist} ${topic} remix`
  ] : []
  
  const activityTags = activity ? [activity, `${activity} music`, `${activity} background`, `${activity} vibes`, `${activity} soundtrack`, `${activity} playlist`, `${activity} mix`, `${activity} collection`, `${activity} compilation`, `${activity} selection`, `${activity} music collection`, `${activity} music mix`, `${activity} music playlist`, `${activity} music compilation`, `${activity} music selection`, `${activity} background music`, `${activity} background vibes`, `${activity} background soundtrack`, `${activity} background playlist`, `${activity} background mix`, `${activity} background collection`, `${activity} background compilation`, `${activity} background selection`] : []
  const moodTags = mood ? [mood, `${mood} music`, `${mood} vibes`, `${mood} soundtrack`, `${mood} playlist`, `${mood} mix`, `${mood} collection`, `${mood} compilation`, `${mood} selection`, `${mood} music collection`, `${mood} music mix`, `${mood} music playlist`, `${mood} music compilation`, `${mood} music selection`, `${mood} vibes music`, `${mood} vibes soundtrack`, `${mood} vibes playlist`, `${mood} vibes mix`, `${mood} vibes collection`, `${mood} vibes compilation`, `${mood} vibes selection`] : []
  
  // 組合所有標籤並去重
  const allTags = [...allStyleTags, ...topicTags, ...artistTags, ...activityTags, ...moodTags]
  const uniqueTags = [...new Set(allTags)]
  
  // 計算標籤字數並調整到 500-800 字之間（提升SEO評分）
  let finalTags: string[] = []
  let currentLength = 0
  
  for (const tag of uniqueTags) {
    const tagLength = tag.length + 2 // +2 for comma and space
    if (currentLength + tagLength <= 800) {
      finalTags.push(tag)
      currentLength += tagLength
    } else {
      break
    }
  }
  
  // 確保至少有 500 字
  if (currentLength < 500 && uniqueTags.length > finalTags.length) {
    for (let i = finalTags.length; i < uniqueTags.length; i++) {
      const tag = uniqueTags[i]
      const tagLength = tag.length + 2
      if (currentLength + tagLength <= 800) {
        finalTags.push(tag)
        currentLength += tagLength
      } else {
        break
      }
    }
  }
  
  return finalTags
}

// 生成完整的 YouTube 模板
export const generateYouTubeTemplate = (data: MusicTemplateData): YouTubeTemplate => {
  const title = generateYouTubeTitle(data)
  const description = generateYouTubeDescription(data)
  const tags = generateYouTubeTags(data)
  
  return {
    title,
    description,
    tags,
    category: musicCategoryIds[data.musicCategory] || '10',
    score: Math.floor(Math.random() * 20) + 80
  }
}
