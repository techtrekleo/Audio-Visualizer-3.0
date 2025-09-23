export interface MusicCategory {
  id: string
  name: string
  englishName?: string
  description: string
  keywords: string[]
  titleTemplates: string[]
  trendingTopics: string[]
}

export const musicCategories: MusicCategory[] = [
  {
    id: 'chill',
    name: 'Chill',
    description: '輕鬆舒緩的音樂風格，適合放鬆和冥想',
    keywords: ['chill', 'relaxing', 'ambient', 'lo-fi', 'chillhop', 'chillout', 'meditation', 'study', 'sleep'],
    titleTemplates: [
      'Chill {topic} Music for {activity}',
      '{topic} Chill Vibes - {mood}',
      'Relaxing {topic} - Perfect for {activity}',
      'Chill {topic} Mix - {mood}',
      '{topic} Lo-Fi Beats for {activity}'
    ],
    trendingTopics: ['study music', 'sleep music', 'meditation', 'workout', 'cafe vibes', 'rainy day']
  },
  {
    id: 'bossa-nova',
    name: 'Bossa Nova',
    englishName: 'Bossa Nova',
    description: '巴西爵士樂風格，優雅而富有節奏感',
    keywords: ['bossa nova', 'brazilian', 'jazz', 'samba', 'latin', 'acoustic', 'guitar', 'vocal'],
    titleTemplates: [
      'Bossa Nova {topic} - Brazilian Jazz',
      '{topic} Bossa Nova Classics',
      'Smooth Bossa Nova {topic} - {mood}',
      'Brazilian {topic} - Bossa Nova Style',
      '{topic} Jazz Bossa Nova Mix'
    ],
    trendingTopics: ['brazilian music', 'latin jazz', 'acoustic guitar', 'vocal jazz', 'cafe music', 'romantic']
  },
  {
    id: 'bolero',
    name: 'Bolero',
    englishName: 'Bolero',
    description: '浪漫的拉丁舞曲，充滿情感和優雅',
    keywords: ['bolero', 'latin', 'romantic', 'dance', 'spanish', 'ballroom', 'passionate', 'elegant'],
    titleTemplates: [
      'Bolero {topic} - Romantic Latin Music',
      '{topic} Bolero Classics',
      'Passionate Bolero {topic} - {mood}',
      'Latin {topic} - Bolero Style',
      '{topic} Romantic Bolero Mix'
    ],
    trendingTopics: ['latin dance', 'romantic music', 'spanish music', 'ballroom dance', 'passionate', 'elegant']
  },
  {
    id: 'yandere',
    name: '病嬌',
    englishName: 'Yandere',
    description: '動漫病嬌風格音樂，充滿戲劇性和情感張力',
    keywords: ['病嬌', 'yandere', 'anime', 'dramatic', 'intense', 'emotional', 'dark', 'obsessive', 'japanese'],
    titleTemplates: [
      '病嬌 {topic} - Yandere Vibes',
      '{topic} 病嬌音樂集',
      'Dramatic Yandere {topic} - {mood}',
      '病嬌 {topic} - Intense Emotions',
      '{topic} Yandere Music Mix'
    ],
    trendingTopics: ['anime music', 'japanese music', 'dramatic', 'emotional', 'dark vibes', 'intense']
  },
  {
    id: 'pop',
    name: '流行',
    englishName: 'Pop',
    description: '當代流行音樂，朗朗上口',
    keywords: ['pop', 'popular', 'mainstream', 'chart', 'hit', 'radio', 'contemporary', 'vocal'],
    titleTemplates: [
      'Pop {topic} - Chart Hits',
      '{topic} Popular Music',
      'Contemporary {topic}',
      '{topic} Radio Hits',
      'Pop {topic} Collection'
    ],
    trendingTopics: ['chart hits', 'radio music', 'contemporary pop', 'vocal pop', 'mainstream']
  },
  {
    id: 'rock',
    name: '搖滾',
    englishName: 'Rock',
    description: '強勁有力的搖滾音樂，充滿能量',
    keywords: ['rock', 'guitar', 'electric', 'powerful', 'energetic', 'band', 'drums', 'bass'],
    titleTemplates: [
      'Rock {topic} - Electric Guitar',
      '{topic} Rock Version',
      'Powerful Rock {topic}',
      '{topic} Rock Cover',
      'Rock {topic} - Energetic'
    ],
    trendingTopics: ['rock covers', 'electric guitar', 'band music', 'energetic', 'powerful', 'guitar solos']
  },
  {
    id: 'lofi',
    name: 'Lofi',
    englishName: 'Lo-Fi',
    description: '低保真音樂，溫暖而放鬆',
    keywords: ['lofi', 'lo-fi', 'chill', 'relaxing', 'warm', 'vinyl', 'nostalgic', 'study'],
    titleTemplates: [
      'Lo-Fi {topic} - Chill Beats',
      '{topic} Lo-Fi Version',
      'Chill Lo-Fi {topic}',
      '{topic} Lo-Fi Mix',
      'Lo-Fi {topic} - Study Music'
    ],
    trendingTopics: ['study music', 'chill beats', 'lo-fi hip hop', 'relaxing', 'nostalgic', 'vinyl']
  },
  {
    id: 'acoustic',
    name: '原聲',
    englishName: 'Acoustic',
    description: '純淨的原聲樂器演奏',
    keywords: ['acoustic', 'guitar', 'piano', 'unplugged', 'live', 'natural', 'organic', 'intimate'],
    titleTemplates: [
      'Acoustic {topic} - Unplugged',
      '{topic} Acoustic Version',
      'Live Acoustic {topic}',
      '{topic} Acoustic Cover',
      'Acoustic {topic} - Natural'
    ],
    trendingTopics: ['unplugged', 'live acoustic', 'guitar covers', 'piano covers', 'intimate', 'natural']
  },
  {
    id: 'instrumental',
    name: '演奏',
    englishName: 'Instrumental',
    description: '純樂器演奏，無歌詞',
    keywords: ['instrumental', 'orchestra', 'symphony', 'classical', 'piano', 'violin', 'no vocals'],
    titleTemplates: [
      'Instrumental {topic} - No Vocals',
      '{topic} Instrumental Version',
      'Orchestral {topic}',
      '{topic} Piano Instrumental',
      'Instrumental {topic} - Classical'
    ],
    trendingTopics: ['instrumental covers', 'piano instrumental', 'orchestral', 'classical', 'no vocals', 'symphony']
  },
  {
    id: 'rnb',
    name: '節奏藍調',
    englishName: 'R&B',
    description: '節奏藍調，富有靈魂和情感',
    keywords: ['r&b', 'rhythm and blues', 'soul', 'smooth', 'vocal', 'emotional', 'romantic'],
    titleTemplates: [
      'R&B {topic} - Smooth Vocals',
      '{topic} R&B Version',
      'Smooth R&B {topic}',
      '{topic} R&B Cover',
      'R&B {topic} - Soulful'
    ],
    trendingTopics: ['smooth r&b', 'soul music', 'vocal covers', 'romantic', 'emotional', 'rhythm and blues']
  },
  {
    id: 'hip-hop',
    name: '嘻哈',
    englishName: 'Hip Hop',
    description: '現代嘻哈音樂，節奏強烈',
    keywords: ['hip hop', 'rap', 'beats', 'urban', 'street', 'modern', 'rhythm'],
    titleTemplates: [
      'Hip Hop {topic} - Urban Beats',
      '{topic} Hip Hop Version',
      'Urban Hip Hop {topic}',
      '{topic} Hip Hop Cover',
      'Hip Hop {topic} - Modern'
    ],
    trendingTopics: ['hip hop covers', 'urban music', 'modern beats', 'street music', 'rhythm', 'urban']
  },
  {
    id: 'electronic',
    name: '電子',
    englishName: 'Electronic',
    description: '現代電子音樂，充滿節奏和創新',
    keywords: ['electronic', 'edm', 'techno', 'house', 'trance', 'dubstep', 'ambient', 'synth'],
    titleTemplates: [
      'Electronic {topic} - EDM Mix',
      '{topic} Techno Beats',
      'House {topic} Music',
      '{topic} Electronic Vibes',
      'EDM {topic} Collection'
    ],
    trendingTopics: ['edm', 'techno', 'house music', 'trance', 'dubstep', 'ambient electronic']
  },
  {
    id: 'hifi',
    name: '高保真',
    englishName: 'HIFI',
    description: '高保真音質，清晰細膩',
    keywords: ['hifi', 'high fidelity', 'audiophile', 'quality', 'clear', 'premium', 'studio'],
    titleTemplates: [
      'HIFI {topic} - High Fidelity',
      '{topic} HIFI Version',
      'Premium HIFI {topic}',
      '{topic} Studio Quality',
      'HIFI {topic} - Audiophile'
    ],
    trendingTopics: ['high fidelity', 'audiophile', 'studio quality', 'premium', 'clear sound', 'quality']
  },
  {
    id: 'city-pop',
    name: '都市流行',
    englishName: 'City Pop',
    description: '日本都市流行音樂，時尚現代',
    keywords: ['city pop', 'japanese', 'urban', 'modern', 'fashionable', 'sophisticated', '80s'],
    titleTemplates: [
      'City Pop {topic} - Japanese Urban',
      '{topic} City Pop Version',
      'Urban City Pop {topic}',
      '{topic} Japanese Pop',
      'City Pop {topic} - Modern'
    ],
    trendingTopics: ['japanese pop', 'city pop', 'urban japanese', 'modern', 'fashionable', '80s vibes']
  },
  {
    id: 'soul',
    name: '靈魂樂',
    englishName: 'Soul',
    description: '富有靈魂的音樂，情感豐富',
    keywords: ['soul', 'soulful', 'emotional', 'gospel', 'blues', 'passionate', 'deep'],
    titleTemplates: [
      'Soul {topic} - Soulful Vocals',
      '{topic} Soul Version',
      'Soulful {topic}',
      '{topic} Soul Cover',
      'Soul {topic} - Emotional'
    ],
    trendingTopics: ['soul music', 'soulful covers', 'gospel', 'blues', 'emotional', 'passionate']
  },
  {
    id: 'rap',
    name: '饒舌',
    englishName: 'Rap',
    description: '饒舌音樂，節奏和歌詞並重',
    keywords: ['rap', 'rapping', 'lyrics', 'rhythm', 'urban', 'street', 'wordplay'],
    titleTemplates: [
      'Rap {topic} - Urban Lyrics',
      '{topic} Rap Version',
      'Urban Rap {topic}',
      '{topic} Rap Cover',
      'Rap {topic} - Street'
    ],
    trendingTopics: ['rap covers', 'urban rap', 'street music', 'lyrics', 'rhythm', 'wordplay']
  },
  {
    id: 'jazz',
    name: '爵士樂',
    englishName: 'Jazz',
    description: '經典爵士樂，充滿即興和複雜的和聲',
    keywords: ['jazz', 'swing', 'bebop', 'smooth jazz', 'fusion', 'improvisation', 'saxophone', 'piano'],
    titleTemplates: [
      'Jazz {topic} - Classic Swing',
      '{topic} Jazz Standards',
      'Smooth Jazz {topic}',
      '{topic} Bebop Classics',
      'Jazz Fusion {topic} Mix'
    ],
    trendingTopics: ['jazz standards', 'smooth jazz', 'bebop', 'fusion', 'saxophone', 'piano jazz']
  },
  {
    id: 'classical',
    name: '古典音樂',
    englishName: 'Classical',
    description: '經典古典音樂，優雅而永恆',
    keywords: ['classical', 'orchestra', 'symphony', 'piano', 'violin', 'mozart', 'beethoven', 'chopin'],
    titleTemplates: [
      'Classical {topic} - Orchestral Masterpieces',
      '{topic} Classical Music',
      'Piano {topic} - Classical',
      '{topic} Symphony Classics',
      'Classical {topic} Collection'
    ],
    trendingTopics: ['orchestra', 'piano classical', 'symphony', 'mozart', 'beethoven', 'chopin']
  },
  {
    id: 'smoky-voice',
    name: '菸嗓',
    englishName: 'Smoky Voice',
    description: '富有磁性的菸嗓風格，充滿滄桑和魅力',
    keywords: ['smoky voice', 'raspy', 'husky', 'gravelly', 'deep', 'magnetic', 'charismatic', 'sultry'],
    titleTemplates: [
      'Smoky Voice {topic} - Magnetic Charm',
      '{topic} Smoky Voice Version',
      'Raspy {topic} - Smoky Style',
      '{topic} Smoky Voice Cover',
      'Smoky Voice {topic} - Charismatic'
    ],
    trendingTopics: ['smoky voice', 'raspy vocals', 'husky voice', 'gravelly', 'magnetic', 'charismatic']
  },
  {
    id: 'jpop',
    name: 'J-pop',
    englishName: 'J-Pop',
    description: '日本流行音樂，時尚現代',
    keywords: ['jpop', 'j-pop', 'japanese pop', 'japanese', 'anime', 'kawaii', 'modern', 'trendy'],
    titleTemplates: [
      'J-Pop {topic} - Japanese Style',
      '{topic} J-Pop Version',
      'Japanese Pop {topic}',
      '{topic} J-Pop Cover',
      'J-Pop {topic} - Kawaii'
    ],
    trendingTopics: ['jpop', 'japanese pop', 'anime music', 'kawaii', 'modern japanese', 'trendy']
  },
  {
    id: 'japanese-style',
    name: '和風',
    englishName: 'Japanese Style',
    description: '傳統日本和風音樂，優雅寧靜',
    keywords: ['japanese style', 'traditional', 'zen', 'peaceful', 'elegant', 'minimalist', 'meditation', 'zen'],
    titleTemplates: [
      'Japanese Style {topic} - Traditional Zen',
      '{topic} Japanese Style Version',
      'Traditional {topic} - Japanese Style',
      '{topic} Japanese Style Cover',
      'Japanese Style {topic} - Zen'
    ],
    trendingTopics: ['japanese traditional', 'zen music', 'peaceful', 'elegant', 'minimalist', 'meditation']
  },
  {
    id: 'chinese-style',
    name: '中國風',
    englishName: 'Chinese Style',
    description: '傳統中國風音樂，古典優雅',
    keywords: ['chinese style', 'traditional chinese', 'classical chinese', 'elegant', 'ancient', 'oriental', 'zen', 'peaceful'],
    titleTemplates: [
      'Chinese Style {topic} - Traditional Elegance',
      '{topic} Chinese Style Version',
      'Traditional Chinese {topic}',
      '{topic} Chinese Style Cover',
      'Chinese Style {topic} - Oriental'
    ],
    trendingTopics: ['chinese traditional', 'oriental music', 'classical chinese', 'elegant', 'ancient', 'zen']
  }
]

export const getMusicCategory = (id: string): MusicCategory | undefined => {
  return musicCategories.find(category => category.id === id)
}

export const getMusicCategoryByName = (name: string): MusicCategory | undefined => {
  return musicCategories.find(category => 
    category.name.toLowerCase().includes(name.toLowerCase()) ||
    category.englishName?.toLowerCase().includes(name.toLowerCase())
  )
}

export const generateMusicTitle = (
  category: MusicCategory,
  topic: string,
  activity?: string,
  mood?: string
): string => {
  const template = category.titleTemplates[Math.floor(Math.random() * category.titleTemplates.length)]
  
  return template
    .replace('{topic}', topic)
    .replace('{activity}', activity || 'listening')
    .replace('{mood}', mood || 'Relaxation')
}
