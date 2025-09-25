import React from 'react';

const UnifiedHeader: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-white/10 z-50 py-4">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/assets/cat-avatar.png" alt="口袋裡的貓" className="w-10 h-10 rounded-full" />
          <div>
            <div className="text-white font-bold text-lg">Sonic Pulse</div>
            <div className="text-gray-400 text-sm">🐱 口袋裡的貓</div>
          </div>
        </div>
        <ul className="flex items-center space-x-6">
          <li><a href="/" className="text-gray-300 hover:text-white transition-colors">首頁</a></li>
          <li><a href="/#tools" className="text-gray-300 hover:text-white transition-colors">工具</a></li>
          <li><a href="/articles/index.html" className="text-gray-300 hover:text-white transition-colors">文章</a></li>
          <li><a href="/#channel" className="text-gray-300 hover:text-white transition-colors">頻道</a></li>
          <li><a href="/#contact" className="text-gray-300 hover:text-white transition-colors">聯繫</a></li>
        </ul>
      </div>
    </nav>
  );
};

const UnifiedFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-600 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex justify-center space-x-8 mb-6 flex-wrap">
          <a 
            href="https://www.youtube.com/@%E9%9F%B3%E6%A8%82%E8%84%88%E5%8B%95SonicPulse" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <i className="fab fa-youtube mr-2"></i> YouTube
          </a>
          <a 
            href="mailto:contact@sonicpulse.com"
            className="text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <i className="fas fa-envelope mr-2"></i> 聯繫我們
          </a>
          <a 
            href="#privacy"
            className="text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <i className="fas fa-shield-alt mr-2"></i> 隱私政策
          </a>
          <a 
            href="#terms"
            className="text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <i className="fas fa-file-contract mr-2"></i> 使用條款
          </a>
        </div>
        
        {/* Buy Me a Coffee 按鈕 */}
        <div className="mb-6">
          <p className="text-gray-400 mb-4">喜歡我的工具嗎？請我喝杯咖啡吧！</p>
          <a 
            href="https://buymeacoffee.com/sonicpulse2025" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg"
          >
            <img src="/assets/cat-avatar.png" alt="口袋裡的貓" className="w-8 h-8 rounded-full" />
            <div className="text-left">
              <div className="font-semibold">贊助口袋裡的貓</div>
              <div className="text-sm opacity-90">Buy me a coffee</div>
            </div>
          </a>
        </div>
        
        <div className="text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} 音樂脈動-Sonic Pulse. 保留所有權利. | 用 ❤️ 為音樂創作者打造</p>
        </div>
      </div>
    </footer>
  );
};

export { UnifiedHeader, UnifiedFooter };

