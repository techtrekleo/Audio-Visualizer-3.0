import React from 'react';

const UnifiedHeader: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 backdrop-blur-md border-b z-50 py-4" style={{ background: 'rgba(245, 245, 240, 0.95)', borderColor: 'rgba(74, 74, 74, 0.2)' }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/assets/cat-avatar.png" alt="口袋裡的貓" className="w-10 h-10 rounded-full" style={{ border: '2px solid rgba(139, 157, 195, 0.5)' }} />
          <div>
            <div className="font-bold text-lg" style={{ background: 'linear-gradient(45deg, #8B9DC3, #A8B5C4, #9CA3AF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sonic Pulse</div>
            <div className="text-sm" style={{ color: '#6B7280' }}>🐱 口袋裡的貓</div>
          </div>
        </div>
        <ul className="flex items-center space-x-6">
          <li><a href="/" className="transition-colors" style={{ color: '#4A4A4A' }} onMouseEnter={(e) => e.currentTarget.style.color = '#8B9DC3'} onMouseLeave={(e) => e.currentTarget.style.color = '#4A4A4A'}>首頁</a></li>
          <li><a href="/#tools" className="transition-colors" style={{ color: '#4A4A4A' }} onMouseEnter={(e) => e.currentTarget.style.color = '#8B9DC3'} onMouseLeave={(e) => e.currentTarget.style.color = '#4A4A4A'}>工具</a></li>
          <li><a href="/articles/index.html" className="transition-colors" style={{ color: '#4A4A4A' }} onMouseEnter={(e) => e.currentTarget.style.color = '#8B9DC3'} onMouseLeave={(e) => e.currentTarget.style.color = '#4A4A4A'}>文章</a></li>
          <li><a href="/#channel" className="transition-colors" style={{ color: '#4A4A4A' }} onMouseEnter={(e) => e.currentTarget.style.color = '#8B9DC3'} onMouseLeave={(e) => e.currentTarget.style.color = '#4A4A4A'}>頻道</a></li>
          <li><a href="/#contact" className="transition-colors" style={{ color: '#4A4A4A' }} onMouseEnter={(e) => e.currentTarget.style.color = '#8B9DC3'} onMouseLeave={(e) => e.currentTarget.style.color = '#4A4A4A'}>聯繫</a></li>
        </ul>
      </div>
    </nav>
  );
};

export { UnifiedHeader };

