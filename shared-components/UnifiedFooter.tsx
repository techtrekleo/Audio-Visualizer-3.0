import React from 'react';

interface FooterProps {
  className?: string;
  showAd?: boolean;
}

const UnifiedFooter: React.FC<FooterProps> = ({ 
  className = "", 
  showAd = true 
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`w-full text-center p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-600 flex-shrink-0 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Footer Links */}
        <div className="flex justify-center gap-6 mb-6 flex-wrap">
          <a 
            href="https://www.youtube.com/@%E9%9F%B3%E6%A8%82%E8%84%88%E5%8B%95SonicPulse" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
          >
            <i className="fab fa-youtube mr-2"></i> YouTube
          </a>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              // 這裡可以添加聯繫我們彈出視窗的邏輯
              console.log('聯繫我們');
            }}
            className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
          >
            <i className="fas fa-envelope mr-2"></i> 聯繫我們
          </a>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              // 這裡可以添加隱私政策彈出視窗的邏輯
              console.log('隱私政策');
            }}
            className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
          >
            <i className="fas fa-shield-alt mr-2"></i> 隱私政策
          </a>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              // 這裡可以添加使用條款彈出視窗的邏輯
              console.log('使用條款');
            }}
            className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
          >
            <i className="fas fa-file-contract mr-2"></i> 使用條款
          </a>
        </div>

        {/* Buy Me a Coffee Button */}
        <div className="mb-6">
          <p className="text-gray-400 mb-4">喜歡我的工具嗎？請我喝杯咖啡吧！</p>
          <a
            href="https://buymeacoffee.com/sonicpulse2025"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-500 to-cyan-500 text-white rounded-lg hover:from-pink-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <img 
              src="/assets/cat-avatar.png" 
              alt="口袋裡的貓" 
              className="w-8 h-8 rounded-full border-2 border-white/30"
            />
            <div className="text-left">
              <div className="font-semibold">贊助口袋裡的貓</div>
              <div className="text-sm opacity-90">Buy me a coffee</div>
            </div>
          </a>
        </div>

        {/* Copyright */}
        <div className="text-gray-500 text-sm">
          <p>© {currentYear} 音樂脈動-Sonic Pulse. 保留所有權利. | 用 ❤️ 為音樂創作者打造</p>
        </div>
      </div>
    </footer>
  );
};

export default UnifiedFooter;
