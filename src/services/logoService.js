import api from '../utils/api';

export const logoService = {

  async getCompanyLogo(symbol, exchange = 'NSE', assetData = null) {
    try {
      if (!symbol) {
        throw new Error('Symbol is required');
      }

      if (assetData?.assetId) {
        const logoUrl = await this.getLogoByAssetId(assetData.assetId);
        if (logoUrl) return logoUrl;
      }

      const cleanSymbol = symbol.replace(/\.(NS|NSE|BO|BSE|TO)$/i, '');
      
 
      const normalizedExchange = this.normalizeExchange(exchange);
      
      console.log(`Fetching logo for: ${cleanSymbol} on ${normalizedExchange}`);

      const logoUrl = this.constructLogoUrl(cleanSymbol, normalizedExchange);
      
      const isValid = await this.validateImageUrl(logoUrl);
      if (isValid) {
        console.log(`Logo URL constructed successfully: ${logoUrl}`);
        return logoUrl;
      } else {
        console.warn(`Logo URL validation failed: ${logoUrl}`);
        return null;
      }

    } catch (error) {
      return this.handleLogoError(error, symbol, exchange);
    }
  },

 
  constructLogoUrl(symbol, exchange) {

    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost/v1/portfolio-mgr';
    return `${baseUrl}/api/asset/logos?symbol=${encodeURIComponent(symbol)}&exchange=${encodeURIComponent(exchange)}`;
  },

 
  async validateImageUrl(url) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'Accept': 'image/*',
        },
        timeout: 5000
      });
      
      const contentType = response.headers.get('content-type');
      return response.ok && contentType && contentType.startsWith('image/');
    } catch (error) {
      console.warn(`Image validation failed for ${url}:`, error.message);
      return false;
    }
  },


  async getLogoByAssetId(assetId) {
    try {

      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost/v1/portfolio-mgr';
      const logoUrl = `${baseUrl}/api/asset/${assetId}/logo`;
      

      const isValid = await this.validateImageUrl(logoUrl);
      if (isValid) {
        return logoUrl;
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to fetch logo by assetId ${assetId}:`, error.message);
      return null;
    }
  },

  processLogoResponse(response) {
    if (!response || !response.data) return null;

    const data = response.data;
    
    const contentType = response.headers?.['content-type'] || response.headers?.['Content-Type'];
    

    if (contentType && contentType.startsWith('image/')) {

      if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
        return data;
      }
      
  
      if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
        const blob = new Blob([data], { type: contentType });
        return URL.createObjectURL(blob);
      }
    }


    if (typeof data === 'string') {

      if (data.startsWith('http://') || data.startsWith('https://')) {
        return data;
      }
      if (data.startsWith('data:image/')) {
        return data;
      }
      
      if (data && !data.startsWith('http') && !data.startsWith('data:')) {
        if (data.includes('/') || data.match(/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
          const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost/v1/portfolio-mgr';
          return `${baseUrl}/api/asset/logos/${data}`;
        }
      }
    }

    if (typeof data === 'object') {
      const logoFields = ['logoUrl', 'logo_url', 'url', 'imageUrl', 'image_url', 'src', 'href'];
      for (const field of logoFields) {
        if (data[field] && typeof data[field] === 'string') {
          return data[field];
        }
      }

      if (data.data && data.contentType) {
        return `data:${data.contentType};base64,${data.data}`;
      }
      
      if (data.base64 && data.mimeType) {
        return `data:${data.mimeType};base64,${data.base64}`;
      }

      if (data.svg || data.svgContent) {
        const svgContent = data.svg || data.svgContent;
        return `data:image/svg+xml;base64,${btoa(svgContent)}`;
      }
      
      if (data.toString && data.toString().startsWith('http')) {
        return data.toString();
      }
    }

    return null;
  },


  handleLogoError(error, symbol, exchange) {
    if (error.response) {
      const { status, statusText, data } = error.response;
      console.warn(`Logo API error for ${symbol}:`, {
        status,
        statusText,
        data: data ? JSON.stringify(data).substring(0, 200) : null
      });

      switch (status) {
        case 404:
          console.warn(`Logo not found for ${symbol} on ${exchange}`);
          break;
        case 401:
          console.error('Logo API authentication failed - check Bearer token');
          break;
        case 429:
          console.warn('Logo API rate limit exceeded');
          break;
        case 500:
          console.error(`Logo API server error for ${symbol}`);
          break;
        default:
          console.warn(`Logo API returned ${status} for ${symbol}`);
      }
    } else if (error.request) {
      console.warn(`Logo API network error for ${symbol}:`, error.message);
    } else {
      console.warn(`Logo service error for ${symbol}:`, error.message);
    }

    return null;
  },

  async getLogoWithCache(symbol, exchange, assetData = null) {
    if (assetData?.logoUrl && this.isValidUrl(assetData.logoUrl)) {
      return assetData.logoUrl;
    }

    const cacheKey = assetData?.assetId ? 
      `logo_asset_${assetData.assetId}` : 
      `logo_${symbol}_${exchange}`.toLowerCase();

   
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {

      const logoUrl = await this.retryApiCall(() => 
        this.getCompanyLogo(symbol, exchange, assetData), 
        2
      );

      
      const ttl = logoUrl ? 7200000 : 600000; 
      this.setCache(cacheKey, logoUrl, ttl);

      return logoUrl;
    } catch (error) {
      console.error(`Failed to get logo for ${symbol}:`, error);
      return null;
    }
  },

  async batchGetLogosFromAssets(assets, concurrency = 3) {
    if (!assets || assets.length === 0) return {};

    const results = {};
    const chunks = this.chunkArray(assets, concurrency);

    for (const chunk of chunks) {
      const promises = chunk.map(async (asset) => {
        try {
          const logoUrl = await this.getLogoWithCache(
            asset.symbol || asset.sym, 
            asset.exchange || asset.exch || 'NSE',
            asset 
          );
          
          const key = asset.symbol || asset.sym;
          return { symbol: key, logoUrl };
        } catch (error) {
          console.warn(`Failed to fetch logo for ${asset.symbol || asset.sym}:`, error);
          return { symbol: asset.symbol || asset.sym, logoUrl: null };
        }
      });

      const chunkResults = await Promise.all(promises);
      chunkResults.forEach(result => {
        if (result.symbol) {
          results[result.symbol] = result.logoUrl;
        }
      });

      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  },


  normalizeExchange(exchange) {
    if (!exchange) return 'NSE';
    
    const exchangeMap = {
      'NSE': 'NSE',
      'BSE': 'BSE',
      'NASDAQ': 'NASDAQ', 
      'NYSE': 'NYSE',
      'TSX': 'TSX',
      'LSE': 'LSE',
      'TO': 'TSX',
      'BO': 'BSE',
      'NS': 'NSE',
      'HDBFS': 'NSE',
      // Add more mappings as needed
      'XNAS': 'NASDAQ',
      'XNYS': 'NYSE'
    };
    
    return exchangeMap[exchange.toUpperCase()] || exchange.toUpperCase();
  },


  isValidUrl(string) {
    if (!string || typeof string !== 'string') return false;
    
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'data:';
    } catch (_) {
      return false;
    }
  },


  async retryApiCall(apiCall, maxRetries = 2, baseDelay = 1000) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {

        if (error.response?.status === 401 || 
            error.response?.status === 404 || 
            error.response?.status === 403) {
          throw error;
        }

        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  },

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  generateInteractionId() {
    return 'web_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  getSessionId() {
    try {
      let sessionId = sessionStorage.getItem('finshots_api_session_id');
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('finshots_api_session_id', sessionId);
      }
      return sessionId;
    } catch (error) {
      return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
  },

  getFromCache(key) {
    try {
      const cached = localStorage.getItem(`logo_cache_${key}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() < parsed.expiry) {
          return parsed.data;
        } else {
          localStorage.removeItem(`logo_cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }
    return null;
  },

  setCache(key, data, ttl = 7200000) { 
    try {
      const cacheKeys = Object.keys(localStorage).filter(k => k.startsWith('logo_cache_'));
      if (cacheKeys.length > 1000) {
        const keysWithTimestamps = cacheKeys.map(k => {
          try {
            const cached = JSON.parse(localStorage.getItem(k));
            return { key: k, timestamp: cached.timestamp || 0 };
          } catch {
            return { key: k, timestamp: 0 };
          }
        }).sort((a, b) => a.timestamp - b.timestamp);

        keysWithTimestamps.slice(0, 100).forEach(item => {
          localStorage.removeItem(item.key);
        });
      }

      const cacheData = {
        data,
        expiry: Date.now() + ttl,
        timestamp: Date.now()
      };
      localStorage.setItem(`logo_cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  },


  clearExpiredCache() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('logo_cache_')) {
          try {
            const cached = JSON.parse(localStorage.getItem(key));
            if (Date.now() >= cached.expiry) {
              localStorage.removeItem(key);
            }
          } catch {
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Cache cleanup error:', error);
    }
  },

  clearCache() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('logo_cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  },

  createFallbackLogo(symbol, assetData = null) {
    const name = assetData?.nm || assetData?.name || null;
    const initials = this.generateInitials(symbol, name);
    const colors = this.getConsistentColors(symbol);
    
    return {
      type: 'fallback',
      initials,
      colors,
      symbol: symbol?.toUpperCase(),
      assetData
    };
  },

  generateInitials(symbol, name) {
    if (name) {
      const words = name.split(' ').filter(word => word.length > 0);
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return words[0].substring(0, 2).toUpperCase();
    }
    
    return symbol?.substring(0, 2)?.toUpperCase() || '??';
  },

  getConsistentColors(symbol) {
    if (!symbol) return { bg: 'bg-gray-500', text: 'text-white' };
    
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) {
      hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colorPalettes = [
      { bg: 'bg-blue-500', text: 'text-white' },
      { bg: 'bg-green-500', text: 'text-white' },
      { bg: 'bg-purple-500', text: 'text-white' },
      { bg: 'bg-red-500', text: 'text-white' },
      { bg: 'bg-yellow-500', text: 'text-black' },
      { bg: 'bg-pink-500', text: 'text-white' },
      { bg: 'bg-indigo-500', text: 'text-white' },
      { bg: 'bg-teal-500', text: 'text-white' },
      { bg: 'bg-orange-500', text: 'text-white' },
      { bg: 'bg-cyan-500', text: 'text-white' }
    ];
    
    return colorPalettes[Math.abs(hash) % colorPalettes.length];
  },

 
  async testLogoEndpoint(symbol, exchange) {
    console.log(`Testing logo endpoint for ${symbol} on ${exchange}`);
    
    try {
      const result = await this.getCompanyLogo(symbol, exchange);
      console.log('Logo result:', result);
      return result;
    } catch (error) {
      console.error('Logo test failed:', error);
      return null;
    }
  },

  getCacheStats() {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('logo_cache_'));
      const stats = {
        totalEntries: keys.length,
        validEntries: 0,
        expiredEntries: 0,
        corruptedEntries: 0
      };

      keys.forEach(key => {
        try {
          const cached = JSON.parse(localStorage.getItem(key));
          if (Date.now() < cached.expiry) {
            stats.validEntries++;
          } else {
            stats.expiredEntries++;
          }
        } catch {
          stats.corruptedEntries++;
        }
      });

      return stats;
    } catch (error) {
      return { error: error.message };
    }
  }
};