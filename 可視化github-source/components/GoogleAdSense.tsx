import React, { useEffect, useRef } from 'react';

interface GoogleAdSenseProps {
    adSlot: string;
    adFormat: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
    className?: string;
    style?: React.CSSProperties;
    responsive?: boolean;
}

const GoogleAdSense: React.FC<GoogleAdSenseProps> = ({
    adSlot,
    adFormat,
    className = '',
    style = {},
    responsive = true
}) => {
    const adRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 檢查是否已經加載了 AdSense
        if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
            try {
                (window as any).adsbygoogle.push({});
            } catch (error) {
                console.warn('AdSense push error:', error);
            }
        }
    }, [adSlot]);

    // 根據廣告格式設置樣式
    const getAdStyle = () => {
        const baseStyle: React.CSSProperties = {
            display: 'block',
            textAlign: 'center',
            ...style
        };

        switch (adFormat) {
            case 'rectangle':
                return {
                    ...baseStyle,
                    width: '300px',
                    height: '250px'
                };
            case 'horizontal':
                return {
                    ...baseStyle,
                    width: '728px',
                    height: '90px'
                };
            case 'vertical':
                return {
                    ...baseStyle,
                    width: '160px',
                    height: '600px'
                };
            case 'auto':
            default:
                return {
                    ...baseStyle,
                    width: '100%',
                    height: 'auto'
                };
        }
    };

    return (
        <div 
            ref={adRef}
            className={`google-adsense ${className}`}
            style={getAdStyle()}
        >
            <ins
                className="adsbygoogle"
                style={getAdStyle()}
                data-ad-client="ca-pub-YOUR_PUBLISHER_ID" // 替換為你的發布商 ID
                data-ad-slot={adSlot}
                data-ad-format={adFormat}
                data-full-width-responsive={responsive}
            />
        </div>
    );
};

export default GoogleAdSense;

