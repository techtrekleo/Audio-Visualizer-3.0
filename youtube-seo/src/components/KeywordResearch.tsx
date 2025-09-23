import React, { useState } from 'react'
import { musicCategories, getMusicCategory } from '../utils/musicCategories'
import MusicCategorySelector from './MusicCategorySelector'

interface Keyword {
  keyword: string
  searchVolume: number
  difficulty: number
  trend: 'up' | 'down' | 'stable'
}

const KeywordResearch: React.FC = () => {
  const [topic, setTopic] = useState('')
  const [selectedMusicCategory, setSelectedMusicCategory] = useState('')
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const searchKeywords = async () => {
    if (!topic.trim()) return

    setIsSearching(true)
    
    // Simulate API call
    setTimeout(() => {
      let mockKeywords: Keyword[] = []

      // Add music category specific keywords if selected
      if (selectedMusicCategory) {
        const musicCategory = getMusicCategory(selectedMusicCategory)
        if (musicCategory) {
          // Add music category keywords
          musicCategory.keywords.forEach(keyword => {
            mockKeywords.push({
              keyword: `${topic} ${keyword}`,
              searchVolume: Math.floor(Math.random() * 40000) + 8000,
              difficulty: Math.floor(Math.random() * 40) + 25,
              trend: 'up'
            })
          })

          // Add trending topics from music category
          musicCategory.trendingTopics.forEach(topic => {
            mockKeywords.push({
              keyword: topic,
              searchVolume: Math.floor(Math.random() * 60000) + 15000,
              difficulty: Math.floor(Math.random() * 45) + 30,
              trend: 'up'
            })
          })
        }
      }

      // Add general keywords
      const generalKeywords: Keyword[] = [
        {
          keyword: `${topic} tutorial`,
          searchVolume: Math.floor(Math.random() * 50000) + 10000,
          difficulty: Math.floor(Math.random() * 40) + 30,
          trend: 'up'
        },
        {
          keyword: `how to ${topic}`,
          searchVolume: Math.floor(Math.random() * 80000) + 20000,
          difficulty: Math.floor(Math.random() * 50) + 40,
          trend: 'stable'
        },
        {
          keyword: `best ${topic}`,
          searchVolume: Math.floor(Math.random() * 60000) + 15000,
          difficulty: Math.floor(Math.random() * 45) + 35,
          trend: 'up'
        },
        {
          keyword: `${topic} tips`,
          searchVolume: Math.floor(Math.random() * 30000) + 5000,
          difficulty: Math.floor(Math.random() * 35) + 25,
          trend: 'down'
        },
        {
          keyword: `${topic} guide`,
          searchVolume: Math.floor(Math.random() * 40000) + 8000,
          difficulty: Math.floor(Math.random() * 40) + 30,
          trend: 'stable'
        }
      ]

      setKeywords([...mockKeywords, ...generalKeywords])
      setIsSearching(false)
    }, 2000)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L12 10.586 14.586 8H12z" clipRule="evenodd" />
          </svg>
        )
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L12 9.414 14.586 12H12z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'text-green-600'
    if (difficulty < 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Keyword Research</h2>
        <p className="text-gray-600 mb-6">
          Discover trending keywords and search terms for your YouTube content to improve discoverability.
        </p>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your topic or niche
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., cooking, programming, fitness"
              className="input-field"
            />
          </div>

          {/* Music Category Selector */}
          <MusicCategorySelector
            selectedCategory={selectedMusicCategory}
            onCategoryChange={setSelectedMusicCategory}
          />
          
          <button
            onClick={searchKeywords}
            disabled={!topic.trim() || isSearching}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching...' : 'Search Keywords'}
          </button>
        </div>
      </div>

      {keywords.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyword Results</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keyword
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Search Volume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {keywords.map((keyword, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {keyword.keyword}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {keyword.searchVolume.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${getDifficultyColor(keyword.difficulty)}`}>
                        {keyword.difficulty}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {getTrendIcon(keyword.trend)}
                        <span className="ml-1 capitalize">{keyword.trend}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {keywords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Keywords</h3>
            <div className="space-y-3">
              {keywords
                .filter(k => k.difficulty < 50 && k.searchVolume > 20000)
                .slice(0, 3)
                .map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-800">{keyword.keyword}</span>
                    <span className="text-xs text-green-600">{keyword.searchVolume.toLocaleString()} searches</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyword Insights</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• High search volume keywords have more competition</p>
              <p>• Low difficulty keywords are easier to rank for</p>
              <p>• Trending keywords show growing interest</p>
              <p>• Long-tail keywords often have less competition</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default KeywordResearch
