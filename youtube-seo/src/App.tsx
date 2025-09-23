import { useState } from 'react'
import { musicCategories } from './utils/musicCategories'
import { generateAIContent } from './utils/geminiAI'

interface SEOContent {
  title: string
  description: string
  tags: string[]
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

  const generateSEO = async () => {
    if (!songName.trim() || selectedStyles.length === 0) return

    setIsGenerating(true)
    setError(null)
    
    try {
      const artistName = artist || 'Unknown Artist'
      const result = await generateAIContent(songName, artistName, selectedStyles, selectedLanguage)
      
      setSeoContent({
        title: result.title,
        description: result.description,
        tags: result.tags
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
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-sm border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-100">
                🎵 YouTube SEO Generator
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">by 音樂脈動-Sonic Pulse</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 p-6">
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
                  className="w-full px-3 py-2 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
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
                  className="w-full px-3 py-2 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
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
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-700'
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {musicCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => toggleStyle(category.id)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                        selectedStyles.includes(category.id)
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-700'
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
                {selectedStyles.length > 0 && (
                  <p className="text-sm text-gray-400 mt-2">
                    已選擇: {selectedStyles.map(id => musicCategories.find(c => c.id === id)?.name).join(', ')}
                  </p>
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
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 p-6">
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

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 p-6">
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

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 p-6">
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
            </div>
          )}
        </div>
      </main>

      <footer className="bg-gray-800/50 backdrop-blur-sm border-t border-gray-700 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Sonic Pulse. Built with ❤️ by 音樂脈動-Sonic Pulse</p>
            <p className="mt-2">
              <a 
                href="https://www.youtube.com/@%E9%9F%B3%E6%A8%82%E8%84%88%E5%8B%95SonicPulse" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                🎵 Sonic Pulse YouTube Channel
              </a>
            </p>
            
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
