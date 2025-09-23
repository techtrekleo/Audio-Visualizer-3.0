import React, { useState } from 'react'

interface Competitor {
  channel: string
  title: string
  views: number
  publishedDate: string
  keywords: string[]
  score: number
}

const CompetitorAnalysis: React.FC = () => {
  const [topic, setTopic] = useState('')
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeCompetitors = async () => {
    if (!topic.trim()) return

    setIsAnalyzing(true)
    
    // Simulate API call
    setTimeout(() => {
      const mockCompetitors: Competitor[] = [
        {
          channel: 'TechMaster Pro',
          title: `How to ${topic} Like a Pro in 2024`,
          views: Math.floor(Math.random() * 500000) + 100000,
          publishedDate: '2 weeks ago',
          keywords: [topic, 'tutorial', 'pro', '2024'],
          score: Math.floor(Math.random() * 30) + 70
        },
        {
          channel: 'Easy Learning',
          title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} for Beginners: Complete Guide`,
          views: Math.floor(Math.random() * 300000) + 50000,
          publishedDate: '1 month ago',
          keywords: [topic, 'beginners', 'complete', 'guide'],
          score: Math.floor(Math.random() * 30) + 65
        },
        {
          channel: 'Quick Tips',
          title: `5 ${topic} Tips That Will Change Everything`,
          views: Math.floor(Math.random() * 200000) + 30000,
          publishedDate: '3 weeks ago',
          keywords: [topic, 'tips', 'change', 'everything'],
          score: Math.floor(Math.random() * 30) + 75
        },
        {
          channel: 'Expert Zone',
          title: `The Ultimate ${topic} Tutorial: Step by Step`,
          views: Math.floor(Math.random() * 400000) + 80000,
          publishedDate: '2 months ago',
          keywords: [topic, 'ultimate', 'tutorial', 'step'],
          score: Math.floor(Math.random() * 30) + 80
        },
        {
          channel: 'Learn Fast',
          title: `${topic} Secrets Revealed: What Nobody Tells You`,
          views: Math.floor(Math.random() * 150000) + 20000,
          publishedDate: '1 week ago',
          keywords: [topic, 'secrets', 'revealed', 'nobody'],
          score: Math.floor(Math.random() * 30) + 85
        }
      ]

      setCompetitors(mockCompetitors)
      setIsAnalyzing(false)
    }, 2500)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Competitor Analysis</h2>
        <p className="text-gray-600 mb-6">
          Analyze competitor titles in your niche to understand what works and find opportunities.
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
          
          <button
            onClick={analyzeCompetitors}
            disabled={!topic.trim() || isAnalyzing}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Competitors'}
          </button>
        </div>
      </div>

      {competitors.length > 0 && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitor Titles</h3>
            <div className="space-y-4">
              {competitors.map((competitor, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 mb-1">
                        {competitor.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {competitor.channel} • {competitor.publishedDate}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>👁️ {formatViews(competitor.views)} views</span>
                        <span className={`font-medium ${getScoreColor(competitor.score)}`}>
                          📊 {competitor.score}/100
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Keywords:</span>
                    {competitor.keywords.map((keyword, kIndex) => (
                      <span 
                        key={kIndex}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Patterns</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-800">"How to" + Topic + "Like a Pro"</span>
                  <span className="text-xs text-green-600">High engagement</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-800">"Complete Guide" + Topic</span>
                  <span className="text-xs text-blue-600">Good for tutorials</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-purple-800">"Secrets" + Topic + "Revealed"</span>
                  <span className="text-xs text-purple-600">High curiosity</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Opportunity Analysis</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Look for gaps in competitor content</p>
                <p>• Identify underserved keywords</p>
                <p>• Find trending topics they missed</p>
                <p>• Analyze their title patterns</p>
                <p>• Study their publishing frequency</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitive Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  {Math.floor(Math.random() * 20) + 80}%
                </div>
                <div className="text-sm text-gray-600">Average Title Score</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  {Math.floor(Math.random() * 10) + 5}
                </div>
                <div className="text-sm text-gray-600">Common Keywords</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  {Math.floor(Math.random() * 30) + 20}K
                </div>
                <div className="text-sm text-gray-600">Avg. Views</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompetitorAnalysis








