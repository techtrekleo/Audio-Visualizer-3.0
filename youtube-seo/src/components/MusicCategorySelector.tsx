import React from 'react'
import { musicCategories, MusicCategory } from '../utils/musicCategories'

interface MusicCategorySelectorProps {
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
  className?: string
}

const MusicCategorySelector: React.FC<MusicCategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        選擇音樂類別
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {musicCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
              selectedCategory === category.id
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium text-sm">
              {category.name}
              {category.englishName && (
                <span className="block text-xs text-gray-500 mt-1">
                  {category.englishName}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-600 mt-2 line-clamp-2">
              {category.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default MusicCategorySelector








