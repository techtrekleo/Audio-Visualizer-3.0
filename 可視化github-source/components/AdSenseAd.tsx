import React, { useEffect } from 'react';

// 擴展 Window 接口以包含 AdSense
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdSenseAdProps {
  type: 'banner' | 'sidebar' | 'footer';
  className?: string;
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({ type, className = '' }) => {
  useEffect(() => {
    // 重新初始化 AdSense 廣告
    if (window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.log('AdSense error:', error);
      }
    }
  }, []);

  const getAdStyle = () => {
    switch (type) {
      case 'banner':
        return 'w-full h-24 md:h-32 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center';
      case 'sidebar':
        return 'w-full h-64 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center';
      case 'footer':
        return 'w-full h-20 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center';
      default:
        return 'w-full h-24 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center';
    }
  };

  const getAdUnit = () => {
    switch (type) {
      case 'banner':
        return (
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-3289174642940086"
            data-ad-slot="YOUR_BANNER_AD_SLOT"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        );
      case 'sidebar':
        return (
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-3289174642940086"
            data-ad-slot="YOUR_SIDEBAR_AD_SLOT"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        );
      case 'footer':
        return (
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-3289174642940086"
            data-ad-slot="YOUR_FOOTER_AD_SLOT"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${getAdStyle()} ${className}`}>
      {getAdUnit()}
      <div className="text-gray-400 text-sm">
        {type === 'banner' && 'Advertisement'}
        {type === 'sidebar' && 'Sponsored Content'}
        {type === 'footer' && 'Advertisement'}
      </div>
    </div>
  );
};

export default AdSenseAd;
