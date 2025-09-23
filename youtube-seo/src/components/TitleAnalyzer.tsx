import React, { useState } from 'react'

interface AnalysisResult {
  score: number
  suggestions: string[]
  issues: string[]
  strengths: string[]
}

const TitleAnalyzer: React.FC = () => {
  const [title, setTitle] = useState('')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeTitle = async () => {
    if (!title.trim()) return

    setIsAnalyzing(true)
    
    // Simulate API call
    setTimeout(() => {
      const score = Math.floor(Math.random() * 40) + 60 // 60-100
      const suggestions = [
        'Add trending keywords',
        'Include numbers or statistics',
        'Use power words like "Amazing", "Incredible", "Best"',
        'Keep title under 60 characters',
        'Add emotional triggers'
      ]
      const issues = [
        'Title is too long',
        'Missing trending keywords',
        'No emotional appeal'
      ]
      const strengths = [
        'Good readability',
        'Clear topic',
        'Appropriate length'
      ]

      setAnalysis({
        score,
        suggestions,
        issues,
        strengths
      })
      setIsAnalyzing(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Title Analyzer</h2>
        <p className="text-gray-600 mb-6">
          Analyze your YouTube video title for SEO optimization and get actionable suggestions.
        </p>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your YouTube title
            </label>
            <textarea
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., How to Make Perfect Pancakes in 5 Minutes"
              className="input-field h-24 resize-none"
            />
          </div>
          
          <button
            onClick={analyzeTitle}
            disabled={!title.trim() || isAnalyzing}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Title'}
          </button>
        </div>
      </div>

      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Score</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {analysis.score}/100
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analysis.score}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {analysis.score >= 80 ? 'Excellent' : 
                 analysis.score >= 60 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>
          </div>

          {/* Strengths Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Strengths</h3>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Issues Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues to Fix</h3>
            <ul className="space-y-2">
              {analysis.issues.map((issue, index) => (
                <li key={index} className="flex items-center text-red-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {issue}
                </li>
              ))}
            </ul>
          </div>

          {/* Suggestions Card */}
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggestions</h3>
            <ul className="space-y-2">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start text-blue-600">
                  <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default TitleAnalyzer








