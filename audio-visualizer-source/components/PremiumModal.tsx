import React from 'react';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onUpgrade }) => {
    if (!isOpen) {
        return null;
    }

    const CheckCircleIcon = () => (
        <svg className="w-6 h-6 text-cyan-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.06-1.06l-3.103 3.102-1.537-1.536a.75.75 0 0 0-1.06 1.06l2.067 2.067a.75.75 0 0 0 1.06 0l3.633-3.633Z" clipRule="evenodd" />
        </svg>
    );

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-gray-800 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10 w-full max-w-md p-8 text-center transform transition-all scale-100 opacity-100">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 mb-4 ring-4 ring-cyan-400/20">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9 text-white"><path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v1.586l-.29.29A.75.75 0 0 0 2 6.832V12a9.735 9.735 0 0 0 3.25 7.445.75.75 0 0 0 .5.207v-1.586l.29-.29A.75.75 0 0 0 6 17.168V12a9.735 9.735 0 0 0-3.25-7.445.75.75 0 0 0-.5-.207v1.586l.29.29A.75.75 0 0 0 3 6.832V12a6.75 6.75 0 0 0 1.258 4.002l.71-.71A.75.75 0 0 1 6 15.168V12a3.75 3.75 0 0 1 3.75-3.75h.582A4.5 4.5 0 0 1 15 12.75v2.25a.75.75 0 0 0 1.5 0v-2.25a6 6 0 0 0-6-6h-.75V4.533Z" /><path d="M12.75 18.75a.75.75 0 0 0 1.5 0v-2.25a.75.75 0 0 0-1.5 0v2.25Z" /><path d="M15.75 12.75a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-1.5 0v-.008Z" /><path d="M15 15.75a.75.75 0 0 0 1.5 0v-2.25a.75.75 0 0 0-1.5 0v2.25Z" /><path d="M18.75 12.75a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-1.5 0v-.008Z" /><path d="M18 15.75a.75.75 0 0 0 1.5 0v-2.25a.75.75 0 0 0-1.5 0v2.25Z" /><path d="M12.75 15.75a.75.75 0 0 0 1.5 0v-2.25a.75.75 0 0 0-1.5 0v2.25Z" /><path d="M15.375 18.375a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /><path d="M18.375 18.375a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">解鎖所有專業版功能</h2>
                <p className="text-gray-400 mb-6">升級到專業版，讓您的創作更上一層樓。</p>

                <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-center gap-3">
                        <CheckCircleIcon />
                        <span className="text-gray-300">以令人驚嘆的 <span className="font-bold text-white">4K 解析度</span> 匯出影片</span>
                    </li>
                    <li className="flex items-center gap-3">
                         <CheckCircleIcon />
                        <span className="text-gray-300">解鎖所有進階<span className="font-bold text-white">顏色主題</span> (如 Cyberpunk、Lava 等)</span>
                    </li>
                    <li className="flex items-center gap-3">
                         <CheckCircleIcon />
                        <span className="text-gray-300">自由<span className="font-bold text-white">編輯顯示文字</span>，打造個人品牌</span>
                    </li>
                    <li className="flex items-center gap-3">
                         <CheckCircleIcon />
                        <span className="text-gray-300">隨意<span className="font-bold text-white">調整浮水印位置</span> (左上、右下等)</span>
                    </li>
                </ul>
                
                <div className="mb-6">
                    <p className="text-sm text-gray-400">一次性購買，只需 <span className="font-bold text-lg text-white">$4.99 美元</span> 即可永久解鎖。</p>
                </div>

                <button 
                    onClick={onUpgrade} 
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 text-lg shadow-lg shadow-cyan-500/20"
                >
                    立即升級至專業版
                </button>
                <button onClick={onClose} className="mt-4 text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    以後再說
                </button>
            </div>
        </div>
    );
};

export default PremiumModal;