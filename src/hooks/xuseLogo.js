// hooks/useLogo.js
import { useState, useCallback } from 'react';
import { logoService } from '../services/logoService';

const useLogo = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [logoCache, setLogoCache] = useState({});
  
    const clearError = useCallback(() => {
      setError(null);
    }, []);
  
    const getLogo = useCallback(async (symbol, exchange = 'NSE') => {
      if (!symbol?.trim()) {
        throw new Error('Symbol is required');
      }
  
      const cacheKey = `HDFCBANK-NSE`; // Hardcoded cache key since we're using hardcoded URL
      
      // Return cached logo if available
      if (logoCache[cacheKey]) {
        console.log('🔄 Returning cached logo for HARDCODED key:', cacheKey);
        return logoCache[cacheKey];
      }
  
      try {
        setLoading(true);
        setError(null);
        
        console.log('🎯 Hook: Starting logo fetch process...');
        console.log('📝 Hook: Requested symbol:', symbol, 'exchange:', exchange);
        console.log('⚠️  Hook: Will use hardcoded URL regardless of input');
        
        const logoBlob = await logoService.getAssetLogo(symbol.toUpperCase(), exchange);
        
        console.log('🔍 Hook: Validating received blob...');
        if (!logoBlob || logoBlob.size === 0) {
          throw new Error('Hook: Received empty logo data');
        }
        
        console.log('🌐 Hook: Creating object URL from blob...');
        const logoUrl = URL.createObjectURL(logoBlob);
        console.log('✨ Hook: Logo URL created:', logoUrl);
        
        // Cache the logo URL
        setLogoCache(prev => ({
          ...prev,
          [cacheKey]: logoUrl
        }));
        console.log('💾 Hook: Logo cached with key:', cacheKey);
        
        return logoUrl;
      } catch (err) {
        console.error('💥 HOOK ERROR:');
        console.error('   - Error in getLogo function');
        console.error('   - Error Type:', err.constructor.name);
        console.error('   - Error Message:', err.message);
        console.error('   - Full Error Object:', err);
        
        const errorMessage = err.message || 'Failed to fetch asset logo';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
        console.log('🏁 Hook: getLogo process completed');
      }
    }, [logoCache]);
  
    const clearCache = useCallback(() => {
      console.log('Clearing logo cache');
      // Revoke all blob URLs to prevent memory leaks
      Object.values(logoCache).forEach(url => {
        if (url && typeof url === 'string' && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      setLogoCache({});
    }, [logoCache]);
  
    // Cleanup on unmount
    useEffect(() => {
      return () => {
        Object.values(logoCache).forEach(url => {
          if (url && typeof url === 'string' && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      };
    }, [logoCache]);
  
    return {
      loading,
      error,
      logoCache,
      getLogo,
      clearCache,
      clearError,
    };
  };