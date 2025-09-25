import React, { useState } from 'react';

interface ModalProviderProps {
  children: React.ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const openContactModal = () => {
    setShowContactModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    document.body.style.overflow = 'auto';
  };

  const openPrivacyModal = () => {
    setShowPrivacyModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closePrivacyModal = () => {
    setShowPrivacyModal(false);
    document.body.style.overflow = 'auto';
  };

  const openTermsModal = () => {
    setShowTermsModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeTermsModal = () => {
    setShowTermsModal(false);
    document.body.style.overflow = 'auto';
  };

  // 將函數暴露給全局，供 footer 使用
  React.useEffect(() => {
    console.log('ModalProvider: Setting up global functions');
    (window as any).openContactModal = openContactModal;
    (window as any).closeContactModal = closeContactModal;
    (window as any).openPrivacyModal = openPrivacyModal;
    (window as any).closePrivacyModal = closePrivacyModal;
    (window as any).openTermsModal = openTermsModal;
    (window as any).closeTermsModal = closeTermsModal;
    
    // 測試函數是否正確設置
    console.log('ModalProvider: Global functions set:', {
      openContactModal: typeof (window as any).openContactModal,
      openPrivacyModal: typeof (window as any).openPrivacyModal,
      openTermsModal: typeof (window as any).openTermsModal
    });
    
    return () => {
      console.log('ModalProvider: Cleaning up global functions');
      delete (window as any).openContactModal;
      delete (window as any).closeContactModal;
      delete (window as any).openPrivacyModal;
      delete (window as any).closePrivacyModal;
      delete (window as any).openTermsModal;
      delete (window as any).closeTermsModal;
    };
  }, []);

  return (
    <>
      {children}
      
      {/* 聯繫我們彈出視窗 */}
      {showContactModal && (
        <div className="contact-modal" onClick={closeContactModal}>
          <div className="contact-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="contact-modal-header">
              <h3 className="contact-modal-title">聯繫我們</h3>
              <span className="contact-modal-close" onClick={closeContactModal}>&times;</span>
            </div>
            <div className="contact-options">
              <a href="https://discord.com/users/104427212337332224" target="_blank" className="contact-option">
                <div className="contact-option-icon">
                  <i className="fab fa-discord" style={{color: '#5865F2'}}></i>
                </div>
                <div className="contact-option-text">
                  <div className="contact-option-title">Discord</div>
                  <div className="contact-option-desc">即時聊天與技術支援</div>
                </div>
              </a>
              <a href="https://www.threads.com/@sonicpulse.taiwan" target="_blank" className="contact-option">
                <div className="contact-option-icon">
                  <i className="fas fa-at" style={{color: '#000000'}}></i>
                </div>
                <div className="contact-option-text">
                  <div className="contact-option-title">Threads</div>
                  <div className="contact-option-desc">社群互動與最新消息</div>
                </div>
              </a>
              <a href="https://www.youtube.com/@%E9%9F%B3%E6%A8%82%E8%84%88%E5%8B%95SonicPulse" target="_blank" className="contact-option">
                <div className="contact-option-icon">
                  <i className="fab fa-youtube" style={{color: '#FF0000'}}></i>
                </div>
                <div className="contact-option-text">
                  <div className="contact-option-title">YouTube 音樂頻道</div>
                  <div className="contact-option-desc">音樂作品與教學內容</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 隱私政策彈出視窗 */}
      {showPrivacyModal && (
        <div className="privacy-modal" onClick={closePrivacyModal}>
          <div className="privacy-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="privacy-modal-header">
              <h3 className="privacy-modal-title">隱私政策</h3>
              <span className="privacy-modal-close" onClick={closePrivacyModal}>&times;</span>
            </div>
            <div className="privacy-content">
              <h3>資料收集與使用</h3>
              <p>我們致力於保護您的隱私權。本政策說明我們如何收集、使用和保護您的個人資料。</p>
              
              <h3>收集的資料類型</h3>
              <ul>
                <li><strong>使用資料：</strong>我不會收集這個 - 我們不會收集您的個人使用行為資料</li>
                <li><strong>技術資料：</strong>包括 IP 地址（僅用為分析使用地區及尖峰時刻）</li>
                <li><strong>內容資料：</strong>您上傳或輸入的音樂或是歌詞還是歌名，我都不會存，只會在線上作轉換而已</li>
              </ul>
              
              <h3>資料使用目的</h3>
              <p><strong>其實我也不會拿來幹嘛</strong> - 我們收集的資料主要用於：</p>
              <ul>
                <li>分析使用地區分布（僅統計用途）</li>
                <li>了解尖峰使用時段（優化服務穩定性）</li>
                <li>確保服務正常運作</li>
              </ul>
              <p><strong>重要：</strong>我們不會將您的資料用於商業用途、行銷或任何其他目的。</p>
              
              <h3>資料保護</h3>
              <p>我們採用業界標準的安全措施來保護您的資料，包括加密傳輸、安全儲存和存取控制。</p>
              
              <h3>資料分享</h3>
              <p>我們不會出售、交易或轉讓您的個人資料給第三方</p>
              <p>因為我根本沒有收集＝＝</p>
              
              <h3>政策更新</h3>
              <p>我們可能會不時更新此隱私政策。重大變更將透過網站公告或電子郵件通知您。</p>
              
              <p><strong>最後更新：</strong>2025年9月25日</p>
            </div>
          </div>
        </div>
      )}

      {/* 使用條款彈出視窗 */}
      {showTermsModal && (
        <div className="terms-modal" onClick={closeTermsModal}>
          <div className="terms-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="terms-modal-header">
              <h3 className="terms-modal-title">使用條款</h3>
              <span className="terms-modal-close" onClick={closeTermsModal}>&times;</span>
            </div>
            <div className="terms-content">
              <h3>服務條款</h3>
              <p>歡迎使用音樂脈動-Sonic Pulse 的服務。使用我們的服務即表示您同意遵守以下條款。</p>
              
              <h3>服務說明</h3>
              <p>Sonic Pulse 提供多種創作工具，包括：</p>
              <ul>
                <li>Audio Visualizer - 音頻視覺化工具</li>
                <li>YouTube SEO - YouTube 標題 SEO 優化工具</li>
                <li>Font Effects - 字體特效生成器</li>
              </ul>
              <p><strong>無需註冊</strong> - 您可以直接使用所有功能，無需創建帳號。</p>
              
              <h3>使用者責任</h3>
              <ul>
                <li><strong>合法使用：</strong>您承諾僅將服務用於合法目的，不得用於任何違法活動</li>
                <li><strong>內容責任：</strong>您對上傳或創作的內容負完全責任，確保不侵犯他人權利</li>
                <li><strong>遵守規定：</strong>您必須遵守所有適用的法律法規和平台規則</li>
              </ul>
              
              <h3>智慧財產權</h3>
              <p>服務中的所有內容、功能、設計和技術均受智慧財產權法保護。未經授權，不得複製、修改或分發。</p>
              
              <h3>使用者內容</h3>
              <p>您保留對上傳內容的所有權利。使用我們的服務即表示您授予我們必要的使用權限來提供服務。</p>
              
              <h3>服務可用性</h3>
              <p>我們努力保持服務的穩定運行，但不保證服務不會中斷。我們保留在必要時暫停或終止服務的權利。</p>
              
              <h3>免責聲明</h3>
              <p>服務按「現狀」提供，我們不提供任何明示或暗示的保證。我們不對服務中斷、資料遺失或任何損害負責。</p>
              
              <h3>條款修改</h3>
              <p>我們保留隨時修改這些條款的權利。修改後的條款將在網站上公布，繼續使用服務即表示接受新條款。</p>
              
              <h3>爭議解決</h3>
              <p>任何爭議應透過友好協商解決。如無法解決，應提交有管轄權的法院處理。</p>
              
              <p><strong>最後更新：</strong>2025年9月25日</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalProvider;
