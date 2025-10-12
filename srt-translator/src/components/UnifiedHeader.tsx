export interface HeaderProps {
  className?: string;
}

export const UnifiedHeader: React.FC<HeaderProps> = ({ className = "" }) => {
  return (
    <>
      <style>{`
        .unified-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 1000;
          padding: 1rem 0;
        }
        
        .unified-nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
        }
        
        .unified-logo {
          font-family: 'Orbitron', monospace;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .unified-logo-cat {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .unified-logo-main {
          font-size: 1.8rem;
          font-weight: 900;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: unified-gradient 3s ease infinite;
        }
        
        .unified-logo-sub {
          font-size: 0.7rem;
          font-weight: 400;
          color: #96ceb4;
          margin-top: -2px;
        }
        
        .unified-nav-links {
          display: flex;
          list-style: none;
          gap: 2rem;
          margin: 0;
          padding: 0;
        }
        
        .unified-nav-links a {
          color: #ffffff;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
          position: relative;
        }
        
        .unified-nav-links a:hover {
          color: #4ecdc4;
        }
        
        .unified-nav-links a::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
          transition: width 0.3s ease;
        }
        
        .unified-nav-links a:hover::after {
          width: 100%;
        }
        
        @keyframes unified-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @media (max-width: 768px) {
          .unified-nav-container {
            padding: 0 1rem;
          }
          
          .unified-logo-main {
            font-size: 1.5rem;
          }
          
          .unified-logo-sub {
            font-size: 0.6rem;
          }
          
          .unified-nav-links {
            display: none;
          }
        }
      `}</style>
      <nav className={`unified-navbar ${className}`}>
        <div className="unified-nav-container">
          <div className="unified-logo">
            <img src="/assets/cat-avatar.png" alt="口袋裡的貓" className="unified-logo-cat" />
            <div>
              <div className="unified-logo-main">Sonic Pulse</div>
              <div className="unified-logo-sub">🐱 口袋裡的貓</div>
            </div>
          </div>
          <ul className="unified-nav-links">
            <li><a href="/">首頁</a></li>
            <li><a href="/#tools">工具</a></li>
            <li><a href="/#channel">頻道</a></li>
            <li><a href="/#contact">聯繫</a></li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default UnifiedHeader;

