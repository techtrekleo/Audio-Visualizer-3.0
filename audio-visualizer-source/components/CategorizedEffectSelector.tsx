import React, { useState } from 'react';
import { VisualizationType, EffectCategory } from '../types';
import { EFFECTS_BY_CATEGORY, getCategoryName, getEffectInfo } from '../constants/effectCategories';

interface CategorizedEffectSelectorProps {
  currentType: VisualizationType;
  onTypeChange: (type: VisualizationType) => void;
}

const CategorizedEffectSelector: React.FC<CategorizedEffectSelectorProps> = ({
  currentType,
  onTypeChange
}) => {
  const [activeCategory, setActiveCategory] = useState<EffectCategory>(EffectCategory.BASIC);

  const categories = Object.values(EffectCategory);

  return (
    <div className="categorized-effect-selector bg-gray-800 rounded-lg p-4 mb-4">
      {/* 分類標籤頁 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeCategory === category
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            {getCategoryName(category)}
          </button>
        ))}
      </div>

      {/* 特效網格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {EFFECTS_BY_CATEGORY[activeCategory]?.map((effect) => {
          const isSelected = currentType === effect.type;
          return (
            <div
              key={effect.type}
              className={`effect-card bg-gray-700 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:scale-105 ${
                isSelected
                  ? 'ring-2 ring-blue-500 bg-blue-900/30'
                  : 'hover:bg-gray-600'
              }`}
              onClick={() => onTypeChange(effect.type)}
            >
              {/* 特效標題 */}
              <div className="text-center">
                <h3 className="text-sm font-medium text-white mb-1">
                  {effect.type}
                </h3>
                {isSelected && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto animate-pulse"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>


    </div>
  );
};

export default CategorizedEffectSelector;
