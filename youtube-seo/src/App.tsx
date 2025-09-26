import { useState } from 'react'
import { musicCategories } from './utils/musicCategories'
import { generateAIContent } from './utils/geminiAI'
import { UnifiedHeader, UnifiedFooter, ModalProvider } from '../../shared-components/dist'

interface SEOContent {
  title: string
  description: string
  tags: string[]
  englishTitle?: string
  englishDescription?: string
  englishTags?: string[]
}

// 支援的語言選項
const languageOptions = [
  { id: 'zh', name: '中文', flag: '🇨🇳' },
  { id: 'en', name: 'English', flag: '🇺🇸' },
  { id: 'ja', name: '日本語', flag: '🇯🇵' },
  { id: 'ko', name: '한국어', flag: '🇰🇷' },
  { id: 'es', name: 'Español', flag: '🇪🇸' },
  { id: 'fr', name: 'Français', flag: '🇫🇷' }
]

function App() {
  const [songName, setSongName] = useState('')
  const [artist, setArtist] = useState('')
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [customStyle, setCustomStyle] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [styleHistory, setStyleHistory] = useState<string[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState('zh') // 預設中文
  const [seoContent, setSeoContent] = useState<SEOContent | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev => 
      prev.includes(styleId) 
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    )
  }

  const addCustomStyle = () => {
    if (customStyle.trim() && !selectedStyles.includes(customStyle.trim())) {
      setSelectedStyles(prev => [...prev, customStyle.trim()])
      
      // 添加到歷史記錄
      if (!styleHistory.includes(customStyle.trim())) {
        setStyleHistory(prev => [customStyle.trim(), ...prev.slice(0, 9)]) // 保留最近10個
      }
      
      setCustomStyle('')
      setShowCustomInput(false)
    }
  }

  const addFromHistory = (style: string) => {
    if (!selectedStyles.includes(style)) {
      setSelectedStyles(prev => [...prev, style])
    }
  }

  const removeStyle = (styleId: string) => {
    setSelectedStyles(prev => prev.filter(id => id !== styleId))
  }

  const generateSEO = async () => {
    if (!songName.trim() || selectedStyles.length === 0) return

    setIsGenerating(true)
    setError(null)
    
    try {
      const artistName = artist || 'Unknown Artist'
      
      // 將風格 ID 轉換為風格名稱
      const styleNames = selectedStyles.map(styleId => {
        const category = musicCategories.find(c => c.id === styleId)
        return category ? category.name : styleId
      })
      
      // 生成主要語言內容
      const result = await generateAIContent(songName, artistName, styleNames, selectedLanguage)
      
      // 如果選擇的不是英文，則額外生成英文版本
      let englishResult = null
      if (selectedLanguage !== 'en') {
        try {
          englishResult = await generateAIContent(songName, artistName, styleNames, 'en')
        } catch (err) {
          console.warn('英文版本生成失敗:', err)
        }
      }
      
      setSeoContent({
        title: result.title,
        description: result.description,
        tags: result.tags,
        englishTitle: englishResult?.title,
        englishDescription: englishResult?.description,
        englishTags: englishResult?.tags
      })
    } catch (err) {
      console.error('生成失敗:', err)
      setError('AI 生成失敗，請檢查 API 金鑰或稍後再試')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <ModalProvider>
      <div className="min-h-screen bg-black">
        <UnifiedHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl border border-black p-6">
            <h1 className="text-3xl font-bold text-white mb-2">Seo高分標題模板產生器</h1>
            <h2 className="text-xl font-semibold text-gray-100 mb-6">
              Generate SEO-friendly titles and tags for your music covers
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="songName" className="block text-sm font-medium text-gray-300 mb-2">
                  Song Name *
                </label>
                <input
                  id="songName"
                  type="text"
                  value={songName}
                  onChange={(e) => setSongName(e.target.value)}
                  placeholder="e.g., Shape of You, Bohemian Rhapsody"
                  className="w-full px-3 py-2 bg-gray-900 border-2 border-black rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label htmlFor="artist" className="block text-sm font-medium text-gray-300 mb-2">
                  Original Artist (Optional)
                </label>
                <input
                  id="artist"
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="e.g., Ed Sheeran, Queen"
                  className="w-full px-3 py-2 bg-gray-900 border-2 border-black rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Language (語言) *
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {languageOptions.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setSelectedLanguage(lang.id)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                        selectedLanguage === lang.id
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                          : 'border-black bg-gray-800 hover:border-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium text-sm">
                        {lang.flag} {lang.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Music Style * (可多選)
                </label>
                
                {/* 預設風格選項 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {musicCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => toggleStyle(category.id)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                        selectedStyles.includes(category.id)
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                          : 'border-black bg-gray-800 hover:border-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium text-sm">
                        {category.name}
                        {category.englishName && (
                          <span className="block text-xs text-gray-400 mt-1">
                            {category.englishName}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* 自定義輸入和歷史記錄 */}
                <div className="space-y-3">
                  {/* 自定義輸入按鈕 */}
                  <button
                    onClick={() => setShowCustomInput(!showCustomInput)}
                    className="w-full p-3 rounded-lg border-2 border-dashed border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-700 transition-all duration-200 text-gray-300"
                  >
                    <div className="flex items-center justify-center">
                      <span className="mr-2">+</span>
                      自定義 Music Style
                    </div>
                  </button>

                  {/* 自定義輸入框 */}
                  {showCustomInput && (
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customStyle}
                          onChange={(e) => setCustomStyle(e.target.value)}
                          placeholder="輸入自定義音樂風格..."
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                          onKeyPress={(e) => e.key === 'Enter' && addCustomStyle()}
                        />
                        <button
                          onClick={addCustomStyle}
                          disabled={!customStyle.trim()}
                          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          添加
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 歷史記錄 */}
                  {styleHistory.length > 0 && (
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                      <h4 className="text-sm font-medium text-gray-300 mb-3">歷史記錄</h4>
                      <div className="flex flex-wrap gap-2">
                        {styleHistory.map((style, index) => (
                          <button
                            key={index}
                            onClick={() => addFromHistory(style)}
                            disabled={selectedStyles.includes(style)}
                            className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 已選擇的風格顯示 */}
                {selectedStyles.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">已選擇的風格:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStyles.map((styleId) => {
                        const category = musicCategories.find(c => c.id === styleId)
                        const displayName = category ? category.name : styleId
                        return (
                          <span
                            key={styleId}
                            className="inline-flex items-center px-3 py-1 bg-cyan-600 text-white text-sm rounded-full"
                          >
                            {displayName}
                            <button
                              onClick={() => removeStyle(styleId)}
                              className="ml-2 text-cyan-200 hover:text-white"
                            >
                              ×
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={generateSEO}
                disabled={!songName.trim() || selectedStyles.length === 0 || isGenerating}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? '🤖 AI is generating...' : 'Generate with AI'}
              </button>

              {error && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {seoContent && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl border border-black p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-100">Title (標題)</h3>
                  <button
                    onClick={() => copyToClipboard(seoContent.title)}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Copy Title
                  </button>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <p className="text-lg font-medium text-gray-100">{seoContent.title}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Length: {seoContent.title.length} characters
                  </p>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl border border-black p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-100">Description (歌曲說明)</h3>
                  <button
                    onClick={() => copyToClipboard(seoContent.description)}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Copy Description
                  </button>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-100 font-sans">{seoContent.description}</pre>
                  <p className="text-sm text-gray-400 mt-2">
                    Length: {seoContent.description.length} characters
                  </p>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl border border-black p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-100">Tags (標籤)</h3>
                  <button
                    onClick={() => copyToClipboard(seoContent.tags.join(', '))}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Copy Tags
                  </button>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {seoContent.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400">
                    Tags with comma separator: {seoContent.tags.join(', ')}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Total tags: {seoContent.tags.length} | Total characters: {seoContent.tags.join(', ').length}
                  </p>
                </div>
              </div>

              {/* 英文版本區塊 */}
              {seoContent.englishTitle && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-lg shadow-2xl border border-blue-500/30 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-blue-300 flex items-center gap-2">
                        🇺🇸 English Version (英文版本)
                      </h3>
                      <button
                        onClick={() => copyToClipboard(seoContent.englishTitle!)}
                        className="bg-blue-700 hover:bg-blue-600 text-blue-100 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Copy English Title
                      </button>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                      <p className="text-lg font-medium text-blue-100">{seoContent.englishTitle}</p>
                      <p className="text-sm text-blue-400 mt-2">
                        Length: {seoContent.englishTitle.length} characters
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-lg shadow-2xl border border-blue-500/30 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-blue-300">English Description (英文說明)</h3>
                      <button
                        onClick={() => copyToClipboard(seoContent.englishDescription!)}
                        className="bg-blue-700 hover:bg-blue-600 text-blue-100 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Copy English Description
                      </button>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-blue-100 font-sans">{seoContent.englishDescription}</pre>
                      <p className="text-sm text-blue-400 mt-2">
                        Length: {seoContent.englishDescription!.length} characters
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-lg shadow-2xl border border-blue-500/30 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-blue-300">English Tags (英文標籤)</h3>
                      <button
                        onClick={() => copyToClipboard(seoContent.englishTags!.join(', '))}
                        className="bg-blue-700 hover:bg-blue-600 text-blue-100 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Copy English Tags
                      </button>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {seoContent.englishTags!.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-blue-400">
                        Tags with comma separator: {seoContent.englishTags!.join(', ')}
                      </p>
                      <p className="text-sm text-blue-400 mt-2">
                        Total tags: {seoContent.englishTags!.length} | Total characters: {seoContent.englishTags!.join(', ').length}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </main>
        
        {/* 統一的 Footer */}
        <UnifiedFooter />
      </div>
    </ModalProvider>
  )
}

export default App
