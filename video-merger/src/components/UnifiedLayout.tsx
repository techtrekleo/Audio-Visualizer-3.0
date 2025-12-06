import React from 'react';

export const UnifiedHeader: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-b border-gray-700 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <a href="/" className="flex items-center space-x-3">
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Sonic Pulse
              </div>
              <div className="text-sm text-gray-400">口袋裡的貓</div>
            </a>
          </div>
          <div className="flex items-center space-x-6">
            <a href="/" className="text-gray-300 hover:text-white transition-colors">首頁</a>
            <a href="/audio-visualizer/" className="text-gray-300 hover:text-white transition-colors">工具</a>
            <a href="/youtuber.html" className="text-gray-300 hover:text-white transition-colors">頻道</a>
          </div>
        </div>
      </div>
    </nav>
  );
};

