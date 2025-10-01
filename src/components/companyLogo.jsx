import React, { useState, useCallback, useEffect } from 'react';
import { useAssetLogo } from '../hooks/useLogo';

const CompanyLogo = ({ symbol, assetData, className = "w-8 h-8" }) => {
  const [imageError, setImageError] = useState(false);

  const getExchange = () => {
    if (assetData?.exchange) {
      return assetData.exchange;
    }
    
    if (symbol?.includes('.BO') || symbol?.includes('.BSE')) {
      return 'BSE';
    } else if (symbol?.includes('.NS') || symbol?.includes('.NSE')) {
      return 'NSE';
    }
    
    return 'NSE'; 
  };

  // Generate fallback initials and colors
  const generateFallback = useCallback(() => {
    const name = assetData?.nm || assetData?.name;
    let initials;
    
    // Try to get initials from company name first
    if (name) {
      const words = name.split(' ').filter(word => word.length > 0);
      if (words.length >= 2) {
        initials = (words[0][0] + words[1][0]).toUpperCase();
      } else {
        initials = words[0]?.substring(0, 2)?.toUpperCase() || symbol?.substring(0, 2)?.toUpperCase() || '??';
      }
    } else {
      initials = symbol?.substring(0, 2)?.toUpperCase() || '??';
    }
    
    // Generate consistent colors based on symbol
    const getConsistentColors = (text) => {
      if (!text) return { bg: 'bg-gray-500', text: 'text-white' };
      
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      const colorPalettes = [
        { bg: 'bg-blue-500', text: 'text-white' },
        { bg: 'bg-green-500', text: 'text-white' },
        { bg: 'bg-purple-500', text: 'text-white' },
        { bg: 'bg-red-500', text: 'text-white' },
        { bg: 'bg-yellow-500', text: 'text-gray-900' },
        { bg: 'bg-pink-500', text: 'text-white' },
        { bg: 'bg-indigo-500', text: 'text-white' },
        { bg: 'bg-teal-500', text: 'text-white' },
        { bg: 'bg-orange-500', text: 'text-white' },
        { bg: 'bg-cyan-500', text: 'text-white' }
      ];
      
      return colorPalettes[Math.abs(hash) % colorPalettes.length];
    };
    
    const colors = getConsistentColors(symbol || name);
    
    return { initials, colors };
  }, [symbol, assetData]);

  const exchange = getExchange();
  const { logoUrl, loading, error, hasLogo } = useAssetLogo(symbol, exchange, assetData);


  useEffect(() => {
    console.log('CompanyLogo Debug:', {
      symbol,
      exchange,
      assetData,
      logoUrl,
      loading,
      error,
      hasLogo,
      imageError
    });
  }, [symbol, exchange, assetData, logoUrl, loading, error, hasLogo, imageError]);

  const handleImageError = useCallback((e) => {
    console.warn(`Failed to load logo image for ${symbol}:`, {
      src: e.target.src,
      error: e.target.error || 'Unknown error'
    });
    setImageError(true);
  }, [symbol]);

  const handleImageLoad = useCallback((e) => {
    console.log(`Successfully loaded logo for ${symbol}:`, e.target.src);
    setImageError(false);
  }, [symbol]);


  const LogoFallback = () => {
    const { initials, colors } = generateFallback();
    
    return (
      <div 
        className={`${className} ${colors.bg} rounded-md flex items-center justify-center ${colors.text} font-semibold text-xs shadow-sm ring-1 ring-black ring-opacity-5`}
        title={assetData?.nm || symbol || 'Unknown Asset'}
      >
        {initials}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`${className} bg-gray-200 rounded-md relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      </div>
    );
  }

  console.log('Rendering decision:', {
    error,
    hasLogo,
    logoUrl,
    imageError,
    willShowImage: hasLogo && logoUrl && !imageError
  });

  if (error || !hasLogo || !logoUrl || imageError) {
    console.log('Showing fallback for:', symbol, { error, hasLogo, logoUrl, imageError });
    return <LogoFallback />;
  }

  return (
    <div className={`${className} relative`}>
      <img
        src={logoUrl}
        alt={`${assetData?.nm || symbol} logo`}
        className={`${className} object-contain rounded-md transition-all duration-200 hover:scale-105`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
        crossOrigin="anonymous" 
      />
      
      <div className="absolute inset-0 rounded-md ring-1 ring-black ring-opacity-5 pointer-events-none" />
    </div>
  );
};

export default CompanyLogo;