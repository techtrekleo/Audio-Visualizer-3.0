import { Language } from '../types';

interface LanguageSelectorProps {
  languages: Language[];
  selectedLanguages: Language[];
  onLanguageToggle: (language: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages,
  selectedLanguages,
  onLanguageToggle,
}) => {
  const isSelected = (language: Language) => {
    return selectedLanguages.some(lang => lang.code === language.code);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="text-3xl">🌍</span>
        步驟 2: 選擇目標語言
      </h2>

      <p className="text-gray-400 mb-6">
        勾選您需要翻譯的語言（可多選）
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {languages.map((language) => {
          const selected = isSelected(language);
          return (
            <label
              key={language.code}
              className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                selected
                  ? 'bg-blue-600/30 border-2 border-blue-500 shadow-lg'
                  : 'bg-gray-900/50 border-2 border-gray-700 hover:border-gray-600'
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onLanguageToggle(language)}
                className="w-5 h-5 rounded cursor-pointer"
              />
              <div className="flex-1">
                <div className="text-white font-semibold text-sm">
                  {language.nativeName}
                </div>
                <div className="text-gray-400 text-xs">
                  {language.name}
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {selectedLanguages.length > 0 && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-400 font-semibold">
            已選擇 {selectedLanguages.length} 種語言：
            {selectedLanguages.map(lang => lang.nativeName).join('、')}
          </p>
        </div>
      )}
    </div>
  );
};

