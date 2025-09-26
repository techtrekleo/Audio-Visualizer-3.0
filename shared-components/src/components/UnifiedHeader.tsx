import React from 'react';

export interface HeaderProps {
  className?: string;
}

export const UnifiedHeader: React.FC<HeaderProps> = ({ className = "" }) => {
  return (
    <nav className={`fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-white/10 z-50 py-4 ${className}`}>
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
          <li><a href="/#channel" className="text-gray-300 hover:text-white transition-colors">頻道</a></li>
          <li><a href="/#contact" className="text-gray-300 hover:text-white transition-colors">聯繫</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default UnifiedHeader;
