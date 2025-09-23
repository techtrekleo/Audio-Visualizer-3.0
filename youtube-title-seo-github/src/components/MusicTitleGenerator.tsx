import React, { useState } from 'react'
import { musicCategories, getMusicCategory, generateMusicTitle } from '../utils/musicCategories'
import MusicCategorySelector from './MusicCategorySelector'

interface MusicTitle {
  title: string
  score: number
  category: string
  keywords: string[]
  mood: string
}

const MusicTitleGenerator: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [topic, setTopic] = useState('')
  const [activity, setActivity] = useState('')
  const [mood, setMood] = useState('')
  const [generatedTitles, setGeneratedTitles] = useState<MusicTitle[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateMusicTitles = async () => {
    if (!selectedCategory || !topic.trim()) return

    setIsGenerating(true)
    
    setTimeout(() => {
      const musicCategory = getMusicCategory(selectedCategory)
      if (!musicCategory) return

      const titles: MusicTitle[] = []
      
      // Generate multiple titles using different templates
      for (let i = 0; i < 8; i++) {
        const title = generateMusicTitle(
          musicCategory,
          topic,
          activity || undefined,
          mood || undefined
        )
        
        titles.push({
          title,
          score: Math.floor(Math.random() * 25) + 75,
          category: musicCategory.name,
          keywords: [...musicCategory.keywords.slice(0, 4)],
          mood: mood || 'Relaxation'
        })
      }

      setGeneratedTitles(titles)
      setIsGenerating(false)
    }, 2000)
  }

  const copyToClipboard = (title: string) => {
    navigator.clipboard.writeText(title)
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMoodColor = (mood: string) => {
    const moodColors: { [key: string]: string } = {
      'relaxation': 'bg-blue-100 text-blue-800',
      'focus': 'bg-green-100 text-green-800',
      'energy': 'bg-yellow-100 text-yellow-800',
      'romantic': 'bg-pink-100 text-pink-800',
      'dramatic': 'bg-purple-100 text-purple-800',
      'elegant': 'bg-gray-100 text-gray-800'
    }
    return moodColors[mood.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🎵 Music Title Generator</h2>
        <p className="text-gray-600 mb-6">
          為音樂內容生成優化的 YouTube 標題，支援多種音樂風格和情感。
        </p>
        
        <div className="space-y-6">
          {/* Music Category Selection */}
          <MusicCategorySelector
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {/* Topic Input */}
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              音樂主題或內容
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., piano, guitar, vocals, instrumental"
              className="input-field"
            />
          </div>

          {/* Music-specific options */}
          {selectedCategory && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="activity" className="block text-sm font-medium text-gray-700 mb-2">
                  活動場景 (Activity)
                </label>
                <input
                  id="activity"
                  type="text"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="e.g., studying, sleeping, working, driving"
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-2">
                  情感氛圍 (Mood)
                </label>
                <input
                  id="mood"
                  type="text"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  placeholder="e.g., relaxation, focus, energy, romantic"
                  className="input-field"
                />
              </div>
            </div>
          )}
          
          <button
            onClick={generateMusicTitles}
            disabled={!selectedCategory || !topic.trim() || isGenerating}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Generate Music Titles'}
          </button>
        </div>
      </div>

      {generatedTitles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Generated Music Titles</h3>
            <span className="text-sm text-gray-500">{generatedTitles.length} titles generated</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {generatedTitles.map((title, index) => (
              <div key={index} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{title.title}</h4>
                      <span className={`text-sm font-medium ${getScoreColor(title.score)}`}>
                        {title.score}/100
                      </span>
                    </div>
                    
                                         <div className="flex items-center space-x-2 mb-3">
                       <span className={`px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full`}>
                         {title.category}
                       </span>
                       <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMoodColor(title.mood)}`}>
                         {title.mood}
                       </span>
                     </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm text-gray-500">Keywords:</span>
                      {title.keywords.slice(0, 3).map((keyword, kIndex) => (
                        <span 
                          key={kIndex}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>Length: {title.title.length} characters</p>
                      <p>Words: {title.title.split(' ').length}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard(title.title)}
                    className="ml-4 btn-secondary text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">音樂標題技巧</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• 包含音樂風格和情感描述</p>
              <p>• 添加活動場景增加相關性</p>
              <p>• 結合熱門關鍵字和趨勢</p>
              <p>• 保持標題簡潔有力</p>
              <p>• 突出音樂特色和氛圍</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">音樂類別特色</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• <strong>Chill</strong>: 放鬆、學習、睡眠音樂</p>
              <p>• <strong>Bossa Nova</strong>: 巴西爵士、咖啡廳氛圍</p>
              <p>• <strong>Bolero</strong>: 浪漫、舞蹈、情感表達</p>
              <p>• <strong>病嬌</strong>: 動漫、戲劇性、情感張力</p>
              <p>• <strong>其他類別</strong>: 各有獨特風格和受眾</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MusicTitleGenerator
