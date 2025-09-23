import React, { useState } from 'react'
import { generateYouTubeTemplate, YouTubeTemplate, MusicTemplateData } from '../utils/youtubeTemplate'
import MusicCategorySelector from './MusicCategorySelector'

const YouTubeTemplateGenerator: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [topic, setTopic] = useState('')
  const [activity, setActivity] = useState('')
  const [mood, setMood] = useState('')
  const [artist, setArtist] = useState('')
  const [year, setYear] = useState('')
  const [language, setLanguage] = useState('')
  const [template, setTemplate] = useState<YouTubeTemplate | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateTemplate = async () => {
    if (!selectedCategory || !topic.trim()) return

    setIsGenerating(true)
    
    setTimeout(() => {
      const data: MusicTemplateData = {
        musicCategory: selectedCategory,
        topic,
        activity: activity || undefined,
        mood: mood || undefined,
        artist: artist || undefined,
        year: year || undefined,
        language: language || undefined
      }

      const generatedTemplate = generateYouTubeTemplate(data)
      setTemplate(generatedTemplate)
      setIsGenerating(false)
    }, 2000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const copyAllToClipboard = () => {
    if (!template) return
    
    const allContent = `Title: ${template.title}

Description:
${template.description}

Tags:
${template.tags.join(', ')}`

    navigator.clipboard.writeText(allContent)
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🎬 YouTube Upload Template Generator</h2>
        <p className="text-gray-600 mb-6">
          生成完整的 YouTube 上傳模板，包括標題、說明和標籤，優化 SEO 效果。
        </p>
        
        <div className="space-y-6">
          {/* Music Category Selection */}
          <MusicCategorySelector
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                音樂主題 *
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
            <div>
              <label htmlFor="artist" className="block text-sm font-medium text-gray-700 mb-2">
                藝術家/創作者
              </label>
              <input
                id="artist"
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g., Artist Name"
                className="input-field"
              />
            </div>
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

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                年份
              </label>
              <input
                id="year"
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g., 2024"
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                語言
              </label>
              <input
                id="language"
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g., English, Japanese, Instrumental"
                className="input-field"
              />
            </div>
          </div>
          
          <button
            onClick={generateTemplate}
            disabled={!selectedCategory || !topic.trim() || isGenerating}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : 'Generate YouTube Template'}
          </button>
        </div>
      </div>

      {template && (
        <div className="space-y-6">
          {/* Template Score */}
          <div className="card">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Template Score</h3>
              <span className={`text-2xl font-bold ${getScoreColor(template.score)}`}>
                {template.score}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div 
                className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${template.score}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {template.score >= 85 ? 'Excellent SEO optimization' : 
               template.score >= 75 ? 'Good SEO potential' : 'Needs improvement'}
            </p>
          </div>

          {/* Title */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">📝 Title</h3>
              <button
                onClick={() => copyToClipboard(template.title)}
                className="btn-secondary text-sm"
              >
                Copy Title
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-lg font-medium text-gray-900">{template.title}</p>
              <p className="text-sm text-gray-500 mt-2">
                Length: {template.title.length} characters
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">📄 Description</h3>
              <button
                onClick={() => copyToClipboard(template.description)}
                className="btn-secondary text-sm"
              >
                Copy Description
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans">{template.description}</pre>
              <p className="text-sm text-gray-500 mt-2">
                Length: {template.description.length} characters
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">🏷️ Tags</h3>
              <button
                onClick={() => copyToClipboard(template.tags.join(', '))}
                className="btn-secondary text-sm"
              >
                Copy Tags
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Total tags: {template.tags.length} (YouTube recommends max 15)
              </p>
            </div>
          </div>

          {/* Copy All Button */}
          <div className="card">
            <div className="text-center">
              <button
                onClick={copyAllToClipboard}
                className="btn-primary"
              >
                📋 Copy All Content
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Copy title, description, and tags to clipboard
              </p>
            </div>
          </div>

          {/* YouTube Upload Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 SEO Tips</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• 標題包含主要關鍵字和情感描述</p>
                <p>• 說明包含相關關鍵字和行動呼籲</p>
                <p>• 標籤涵蓋相關主題和趨勢</p>
                <p>• 使用表情符號增加視覺吸引力</p>
                <p>• 包含訂閱和通知提醒</p>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Upload Checklist</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>✅ 標題長度適中 (50-60字符)</p>
                <p>✅ 說明包含關鍵字和CTA</p>
                <p>✅ 標籤數量合理 (10-15個)</p>
                <p>✅ 分類設置正確 (Music)</p>
                <p>✅ 縮圖吸引人且相關</p>
                <p>✅ 播放清單分類正確</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default YouTubeTemplateGenerator








