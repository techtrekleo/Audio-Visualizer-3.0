import React from 'react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    const openContactModal = (e: React.MouseEvent) => {
        e.preventDefault();
        const modal = document.getElementById('contactModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    };

    const openPrivacyModal = (e: React.MouseEvent) => {
        e.preventDefault();
        const modal = document.getElementById('privacyModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    };

    const openTermsModal = (e: React.MouseEvent) => {
        e.preventDefault();
        const modal = document.getElementById('termsModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    };

    return (
        <footer className="unified-footer w-full mt-8 border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-wrap justify-center gap-8 mb-8">
                    <a href="https://www.youtube.com/@%E9%9F%B3%E6%A8%82%E8%84%88%E5%8B%95SonicPulse" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2">
                        <i className="fab fa-youtube"></i> YouTube
                    </a>
                    <a href="#" onClick={openContactModal} className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2">
                        <i className="fas fa-envelope"></i> 聯繫我們
                    </a>
                    <a href="#" onClick={openPrivacyModal} className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2">
                        <i className="fas fa-shield-alt"></i> 隱私政策
                    </a>
                    <a href="#" onClick={openTermsModal} className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2">
                        <i className="fas fa-file-contract"></i> 使用條款
                    </a>
                </div>

                {/* Buy Me a Coffee Button */}
                <div className="text-center mb-8">
                    <p className="text-gray-500 mb-4">喜歡我的工具嗎？請我喝杯咖啡吧！</p>
                    <a href="https://buymeacoffee.com/sonicpulse2025" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl hover:from-cyan-500 hover:to-blue-500 transition-all text-white shadow-lg hover:shadow-cyan-500/20 transform hover:-translate-y-1">
                        <img src="/assets/cat-avatar.png" alt="口袋裡的貓" className="w-8 h-8 rounded-full" />
                        <div className="flex flex-col items-start">
                            <span className="font-bold text-sm">贊助口袋裡的貓</span>
                            <span className="text-xs opacity-90">Buy me a coffee</span>
                        </div>
                    </a>
                </div>

                <div className="text-center text-gray-600 text-sm">
                    <p>&copy; {currentYear} 音樂脈動-Sonic Pulse. 保留所有權利. | 用 ❤️ 為音樂創作者打造</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
