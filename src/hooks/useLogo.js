import { useState, useEffect, useCallback, useRef } from 'react';
import { logoService } from '../services/logoService';


const globalLogoRequests = new Map();
const globalLogoCache = new Map();
const globalSubscribers = new Map();


const createCacheKey = (symbol, exchange, assetData) => {
  return assetData?.assetId ? 
    `asset_${assetData.assetId}` : 
    `${symbol}_${exchange}`.toLowerCase();
};


const logoRequestManager = {
  async requestLogo(cacheKey, symbol, exchange, assetData) {
    if (globalLogoCache.has(cacheKey)) {
      return globalLogoCache.get(cacheKey);
    }

    if (globalLogoRequests.has(cacheKey)) {
      return globalLogoRequests.get(cacheKey);
    }

    const requestPromise = logoService.getLogoWithCache(symbol, exchange, assetData)
      .then(logoUrl => {
        globalLogoCache.set(cacheKey, logoUrl);
        
        const subscribers = globalSubscribers.get(cacheKey) || new Set();
        subscribers.forEach(callback => {
          try {
            callback(logoUrl, null);
          } catch (error) {
            console.error('Subscriber callback error:', error);
          }
        });
        
        return logoUrl;
      })
      .catch(error => {
        globalLogoCache.set(cacheKey, null);
        
        const subscribers = globalSubscribers.get(cacheKey) || new Set();
        subscribers.forEach(callback => {
          try {
            callback(null, error);
          } catch (err) {
            console.error('Subscriber error callback error:', err);
          }
        });
        
        throw error;
      })
      .finally(() => {
        globalLogoRequests.delete(cacheKey);
        
        setTimeout(() => {
          globalSubscribers.delete(cacheKey);
        }, 100);
      });

    globalLogoRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  },

  subscribe(cacheKey, callback) {
    if (!globalSubscribers.has(cacheKey)) {
      globalSubscribers.set(cacheKey, new Set());
    }
    globalSubscribers.get(cacheKey).add(callback);

    return () => {
      const subscribers = globalSubscribers.get(cacheKey);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          globalSubscribers.delete(cacheKey);
        }
      }
    };
  },

  getCached(cacheKey) {
    return globalLogoCache.get(cacheKey);
  },

  isRequesting(cacheKey) {
    return globalLogoRequests.has(cacheKey);
  },

  clearCacheKey(cacheKey) {
    globalLogoCache.delete(cacheKey);
    globalLogoRequests.delete(cacheKey);
    globalSubscribers.delete(cacheKey);
  },

  clearAllCache() {
    globalLogoCache.clear();
    globalLogoRequests.clear();
    globalSubscribers.clear();
  }
};

export const useLogo = () => {
  const [localCache, setLocalCache] = useState({});
  const [loadingStates, setLoadingStates] = useState({});

  const getLogo = useCallback(async (symbol, exchange = 'NSE', assetData = null) => {
    if (!symbol) return null;

    const cacheKey = createCacheKey(symbol, exchange, assetData);

    const cached = logoRequestManager.getCached(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    if (logoRequestManager.isRequesting(cacheKey)) {
      try {
        return await globalLogoRequests.get(cacheKey);
      } catch (error) {
        return null;
      }
    }

    setLoadingStates(prev => ({ ...prev, [cacheKey]: true }));

    try {
      const logoUrl = await logoRequestManager.requestLogo(cacheKey, symbol, exchange, assetData);
      
      setLocalCache(prev => ({ ...prev, [cacheKey]: logoUrl }));
      
      return logoUrl;
    } catch (error) {
      console.error(`Error fetching logo for ${symbol}:`, error);
      return null;
    } finally {
      setLoadingStates(prev => ({ ...prev, [cacheKey]: false }));
    }
  }, []);


  const getLogoStatus = useCallback((symbol, exchange = 'NSE', assetData = null) => {
    const cacheKey = createCacheKey(symbol, exchange, assetData);
    const cached = logoRequestManager.getCached(cacheKey);
    
    return {
      loading: loadingStates[cacheKey] || logoRequestManager.isRequesting(cacheKey),
      logoUrl: cached,
      hasLogo: cached !== null && cached !== undefined,
      cacheKey
    };
  }, [loadingStates]);

  const batchGetLogos = useCallback(async (assets) => {
    if (!assets || assets.length === 0) return {};

    const results = {};
    const promises = assets.map(async (asset) => {
      const symbol = asset.symbol || asset.sym;
      const exchange = asset.exchange || asset.exch || 'NSE';
      
      try {
        const logoUrl = await getLogo(symbol, exchange, asset);
        return { symbol, logoUrl };
      } catch (error) {
        console.warn(`Failed to fetch logo for ${symbol}:`, error);
        return { symbol, logoUrl: null };
      }
    });

    const resolvedPromises = await Promise.all(promises);
    resolvedPromises.forEach(({ symbol, logoUrl }) => {
      results[symbol] = logoUrl;
    });

    return results;
  }, [getLogo]);

  return {
    getLogo,
    getLogoStatus,
    batchGetLogos,
    clearCache: logoRequestManager.clearAllCache
  };
};

export const useAssetLogo = (symbol, exchange = 'NSE', assetData = null) => {
  const [logoUrl, setLogoUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!symbol) {
      setLogoUrl(null);
      setIsLoading(false);
      setError(false);
      return;
    }

    const cacheKey = createCacheKey(symbol, exchange, assetData);

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const cached = logoRequestManager.getCached(cacheKey);
    if (cached !== undefined) {
      setLogoUrl(cached);
      setIsLoading(false);
      setError(cached === null);
      return;
    }


    if (logoRequestManager.isRequesting(cacheKey)) {
      setIsLoading(true);
      setError(false);
      
      unsubscribeRef.current = logoRequestManager.subscribe(cacheKey, (logoUrl, err) => {
        setLogoUrl(logoUrl);
        setIsLoading(false);
        setError(err !== null || logoUrl === null);
      });
      return;
    }

    setIsLoading(true);
    setError(false);

    unsubscribeRef.current = logoRequestManager.subscribe(cacheKey, (logoUrl, err) => {
      setLogoUrl(logoUrl);
      setIsLoading(false);
      setError(err !== null || logoUrl === null);
    });

    logoRequestManager.requestLogo(cacheKey, symbol, exchange, assetData)
      .catch(err => {
        console.warn(`Logo request failed for ${symbol}:`, err);
      });

  }, [symbol, exchange, assetData?.assetId]);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    logoUrl,
    loading: isLoading,
    error,
    hasLogo: logoUrl !== null && logoUrl !== undefined
  };
};

export const useAssetListLogos = (assets = []) => {
  const [logos, setLogos] = useState({});
  const [loading, setLoading] = useState(false);
  const { batchGetLogos } = useLogo();

  useEffect(() => {
    if (assets.length === 0) {
      setLogos({});
      return;
    }

    let isCurrent = true;
    setLoading(true);

    batchGetLogos(assets)
      .then(results => {
        if (isCurrent) {
          setLogos(results);
        }
      })
      .catch(error => {
        console.error('Batch logo fetch error:', error);
        if (isCurrent) {
          setLogos({});
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [assets, batchGetLogos]);

  const getAssetLogo = useCallback((asset) => {
    const symbol = asset.symbol || asset.sym;
    return logos[symbol] || null;
  }, [logos]);

  return {
    logos,
    loading,
    getAssetLogo
  };
};