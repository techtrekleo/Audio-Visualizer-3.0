import React from 'react';

export interface FooterProps {
  className?: string;
  showAd?: boolean;
}

export const UnifiedFooter: React.FC<FooterProps> = ({ 
  className = "",
  showAd = false
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className={`w-full text-center flex-shrink-0 ${className}`}
      style={{
        background: 'rgba(26, 26, 26, 0.8)',
        padding: '3rem 0 2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Footer Links */}
        <div className="flex justify-center gap-6 mb-6 flex-wrap">
          <a 
            href="https://www.youtube.com/@%E9%9F%B3%E6%A8%82%E8%84%88%E5%8B%95SonicPulse" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: '#b8b8b8',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#4ecdc4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#b8b8b8';
            }}
          >
            <i className="fab fa-youtube mr-2"></i> YouTube
          </a>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              console.log('Footer: Contact link clicked');
              if ((window as any).openContactModal) {
                console.log('Footer: Calling openContactModal');
                (window as any).openContactModal();
              } else {
                console.error('Footer: openContactModal not found on window');
              }
            }}
            style={{
              color: '#b8b8b8',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#4ecdc4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#b8b8b8';
            }}
          >
            <i className="fas fa-envelope mr-2"></i> 聯繫我們
          </a>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              console.log('Footer: Privacy link clicked');
              if ((window as any).openPrivacyModal) {
                console.log('Footer: Calling openPrivacyModal');
                (window as any).openPrivacyModal();
              } else {
                console.error('Footer: openPrivacyModal not found on window');
              }
            }}
            style={{
              color: '#b8b8b8',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#4ecdc4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#b8b8b8';
            }}
          >
            <i className="fas fa-shield-alt mr-2"></i> 隱私政策
          </a>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              console.log('Footer: Terms link clicked');
              if ((window as any).openTermsModal) {
                console.log('Footer: Calling openTermsModal');
                (window as any).openTermsModal();
              } else {
                console.error('Footer: openTermsModal not found on window');
              }
            }}
            style={{
              color: '#b8b8b8',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#4ecdc4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#b8b8b8';
            }}
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
            className="btn-coffee btn-coffee-large"
            style={{
              background: 'linear-gradient(135deg, #ff6b9d 0%, #4ecdc4 100%)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '15px',
              padding: '1.5rem 3rem',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              fontFamily: "'Poppins', sans-serif",
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #ff8fb3 0%, #5dd5d5 100%)';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #ff6b9d 0%, #4ecdc4 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
            }}
          >
            <img 
              src="/assets/cat-avatar.png" 
              alt="口袋裡的貓" 
              className="coffee-cat-icon"
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            />
            <div className="coffee-text" style={{ textAlign: 'left', lineHeight: '1.2' }}>
              <div className="coffee-main" style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white' }}>贊助口袋裡的貓</div>
              <div className="coffee-sub" style={{ fontSize: '0.9rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.8)' }}>Buy me a coffee</div>
            </div>
          </a>
        </div>

        {/* Copyright */}
        <div style={{ color: '#666', fontSize: '0.9rem' }}>
          <p>© {currentYear} 音樂脈動-Sonic Pulse. 保留所有權利. | 用 ❤️ 為音樂創作者打造</p>
        </div>
      </div>
    </footer>
  );
};

export default UnifiedFooter;
