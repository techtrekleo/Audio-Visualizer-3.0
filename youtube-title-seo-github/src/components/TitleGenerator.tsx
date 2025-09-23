import React, { useState } from 'react'
import { musicCategories, getMusicCategory, generateMusicTitle } from '../utils/musicCategories'
import MusicCategorySelector from './MusicCategorySelector'

interface GeneratedTitle {
  title: string
  score: number
  type: string
  keywords: string[]
  category?: string
}

const TitleGenerator: React.FC = () => {
  const [content, setContent] = useState('')
  const [keywords, setKeywords] = useState('')
  const [selectedMusicCategory, setSelectedMusicCategory] = useState('')
  const [activity, setActivity] = useState('')
  const [mood, setMood] = useState('')
  const [generatedTitles, setGeneratedTitles] = useState<GeneratedTitle[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateTitles = async () => {
    if (!content.trim()) return

    setIsGenerating(true)
    
    // Simulate API call
    setTimeout(() => {
      const contentWords = content.toLowerCase().split(' ')
      const keywordList = keywords.toLowerCase().split(',').map(k => k.trim()).filter(k => k)
      
      let mockTitles: GeneratedTitle[] = []

      // Generate music-specific titles if music category is selected
      if (selectedMusicCategory) {
        const musicCategory = getMusicCategory(selectedMusicCategory)
        if (musicCategory) {
          // Generate 3 music-specific titles
          for (let i = 0; i < 3; i++) {
            const musicTitle = generateMusicTitle(
              musicCategory,
              content,
              activity || undefined,
              mood || undefined
            )
            mockTitles.push({
              title: musicTitle,
              score: Math.floor(Math.random() * 20) + 75,
              type: 'Music',
              keywords: [...musicCategory.keywords.slice(0, 3), ...keywordList.slice(0, 2)],
              category: musicCategory.name
            })
          }
        }
      }

      // Generate general titles
      const generalTitles: GeneratedTitle[] = [
        {
          title: `How to ${contentWords.slice(0, 3).join(' ')} in 5 Minutes`,
          score: Math.floor(Math.random() * 20) + 80,
          type: 'How-to',
          keywords: keywordList.slice(0, 2)
        },
        {
          title: `The Ultimate ${contentWords[0]} Guide for Beginners`,
          score: Math.floor(Math.random() * 20) + 75,
          type: 'Guide',
          keywords: keywordList.slice(0, 3)
        },
        {
          title: `${contentWords[0].charAt(0).toUpperCase() + contentWords[0].slice(1)} Tips That Actually Work`,
          score: Math.floor(Math.random() * 20) + 70,
          type: 'Tips',
          keywords: keywordList.slice(0, 2)
        },
        {
          title: `10 ${contentWords[0]} Secrets Nobody Tells You`,
          score: Math.floor(Math.random() * 20) + 85,
          type: 'List',
          keywords: keywordList.slice(0, 2)
        },
        {
          title: `${contentWords[0].charAt(0).toUpperCase() + contentWords[0].slice(1)} Tutorial: Complete Step-by-Step Guide`,
          score: Math.floor(Math.random() * 20) + 75,
          type: 'Tutorial',
          keywords: keywordList.slice(0, 3)
        }
      ]

      setGeneratedTitles([...mockTitles, ...generalTitles])
      setIsGenerating(false)
    }, 3000)
  }

  const copyToClipboard = (title: string) => {
    navigator.clipboard.writeText(title)
    // You could add a toast notification here
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Title Generator</h2>
        <p className="text-gray-600 mb-6">
          Generate optimized YouTube titles based on your content and target keywords.
        </p>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Describe your video content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g., cooking pancakes, programming tutorial, fitness workout"
              className="input-field h-24 resize-none"
            />
          </div>
          
          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
              Target keywords (comma-separated)
            </label>
            <input
              id="keywords"
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., cooking, tutorial, beginner, easy"
              className="input-field"
            />
          </div>

          {/* Music Category Selector */}
          <MusicCategorySelector
            selectedCategory={selectedMusicCategory}
            onCategoryChange={setSelectedMusicCategory}
          />

          {/* Music-specific options */}
          {selectedMusicCategory && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="activity" className="block text-sm font-medium text-gray-700 mb-2">
                  Activity (活動)
                </label>
                <input
                  id="activity"
                  type="text"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="e.g., studying, sleeping, working"
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-2">
                  Mood (心情)
                </label>
                <input
                  id="mood"
                  type="text"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  placeholder="e.g., relaxation, focus, energy"
                  className="input-field"
                />
              </div>
            </div>
          )}
          
          <button
            onClick={generateTitles}
            disabled={!content.trim() || isGenerating}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Generate Titles'}
          </button>
        </div>
      </div>

      {generatedTitles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Generated Titles</h3>
            <span className="text-sm text-gray-500">{generatedTitles.length} titles generated</span>
          </div>
          
          {generatedTitles.map((title, index) => (
            <div key={index} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                                     <div className="flex items-center space-x-3 mb-2">
                     <h4 className="text-lg font-medium text-gray-900">{title.title}</h4>
                     <span className={`text-sm font-medium ${getScoreColor(title.score)}`}>
                       {title.score}/100
                     </span>
                     <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                       title.type === 'Music' 
                         ? 'bg-purple-100 text-purple-800' 
                         : 'bg-blue-100 text-blue-800'
                     }`}>
                       {title.type}
                     </span>
                     {title.category && (
                       <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                         {title.category}
                       </span>
                     )}
                   </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm text-gray-500">Keywords:</span>
                    {title.keywords.map((keyword, kIndex) => (
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
      )}

      {generatedTitles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Title Tips</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• Keep titles under 60 characters for mobile</p>
              <p>• Include numbers and power words</p>
              <p>• Use emotional triggers</p>
              <p>• Add trending keywords</p>
              <p>• Make it click-worthy</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Practices</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• Start with "How to" for tutorials</p>
              <p>• Use "Best" or "Top" for list videos</p>
              <p>• Include "Complete" for comprehensive guides</p>
              <p>• Add "Secrets" or "Tips" for value content</p>
              <p>• Use "Tutorial" for educational content</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TitleGenerator
