import api from '../utils/api';

export const fxService = {
  // Cache for storing exchange rates to reduce API calls
  rateCache: new Map(),
  cacheTimeout: 5 * 60 * 1000, // 5 minutes

  /**
   * Get FX rate between two currencies with fallback mechanisms
   * @param {string} fromCcy - Source currency (e.g., 'CAD', 'USD', 'INR')
   * @param {string} toCcy - Target currency (e.g., 'USD', 'INR', 'CAD')
   * @returns {Promise<Object>} Exchange rate data
   */
  async getFxRate(fromCcy, toCcy) {
    try {
      // Normalize currency codes to uppercase
      const normalizedFrom = fromCcy.toUpperCase();
      const normalizedTo = toCcy.toUpperCase();

      // Same currency - return rate of 1
      if (normalizedFrom === normalizedTo) {
        return {
          rate: '1',
          fromCcy: normalizedFrom,
          toCcy: normalizedTo,
          fromAmount: '',
          toAmount: '',
          source: 'direct'
        };
      }

      // Check cache first
      const cacheKey = `${normalizedFrom}-${normalizedTo}`;
      const cachedRate = this.getCachedRate(cacheKey);
      if (cachedRate) {
        return cachedRate;
      }

      // Try direct API call first
      try {
        const directRate = await this.fetchDirectRate(normalizedFrom, normalizedTo);
        if (directRate) {
          this.setCachedRate(cacheKey, directRate);
          return directRate;
        }
      } catch (error) {
        console.warn(`Direct rate fetch failed for ${normalizedFrom}/${normalizedTo}:`, error.message);
      }

      // Fallback 1: Try reverse rate (e.g., if CAD/USD fails, try USD/CAD and invert)
      try {
        const reverseRate = await this.fetchReverseRate(normalizedFrom, normalizedTo);
        if (reverseRate) {
          this.setCachedRate(cacheKey, reverseRate);
          return reverseRate;
        }
      } catch (error) {
        console.warn(`Reverse rate fetch failed for ${normalizedFrom}/${normalizedTo}:`, error.message);
      }

      // Fallback 2: Cross-rate via USD (e.g., CAD -> USD -> INR)
      if (normalizedFrom !== 'USD' && normalizedTo !== 'USD') {
        try {
          const crossRate = await this.fetchCrossRate(normalizedFrom, normalizedTo);
          if (crossRate) {
            this.setCachedRate(cacheKey, crossRate);
            return crossRate;
          }
        } catch (error) {
          console.warn(`Cross rate fetch failed for ${normalizedFrom}/${normalizedTo}:`, error.message);
        }
      }

      // Fallback 3: Use external FX service (like exchangerate-api.com or similar)
      try {
        const externalRate = await this.fetchExternalRate(normalizedFrom, normalizedTo);
        if (externalRate) {
          this.setCachedRate(cacheKey, externalRate);
          return externalRate;
        }
      } catch (error) {
        console.warn(`External rate fetch failed for ${normalizedFrom}/${normalizedTo}:`, error.message);
      }

      // Last resort: Return a default rate with warning
      console.error(`All FX rate sources failed for ${normalizedFrom}/${normalizedTo}, using default rate of 1`);
      return {
        rate: '1',
        fromCcy: normalizedFrom,
        toCcy: normalizedTo,
        fromAmount: '',
        toAmount: '',
        source: 'fallback',
        warning: `Unable to fetch exchange rate for ${normalizedFrom}/${normalizedTo}`
      };

    } catch (error) {
      console.error(`Critical error in getFxRate for ${fromCcy}/${toCcy}:`, error);
      throw new Error(`Failed to get exchange rate from ${fromCcy} to ${toCcy}: ${error.message}`);
    }
  },

  /**
   * Fetch exchange rate directly from your API
   */
  async fetchDirectRate(fromCcy, toCcy) {
    const response = await api.get(`/api/fx?fromCcy=${fromCcy}&toCcy=${toCcy}`);
    
    if (response.data && response.data.status === 'OK' && response.data.data && response.data.data.rate) {
      return {
        rate: response.data.data.rate.toString(),
        fromCcy: response.data.data.fromCcy || fromCcy,
        toCcy: response.data.data.toCcy || toCcy,
        fromAmount: response.data.data.fromAmount || '',
        toAmount: response.data.data.toAmount || '',
        source: 'api'
      };
    }
    
    return null;
  },

  /**
   * Try reverse rate and invert it
   */
  async fetchReverseRate(fromCcy, toCcy) {
    const response = await api.get(`/api/fx?fromCcy=${toCcy}&toCcy=${fromCcy}`);
    
    if (response.data && response.data.status === 'OK' && response.data.data && response.data.data.rate) {
      const reverseRate = parseFloat(response.data.data.rate);
      if (reverseRate && reverseRate !== 0) {
        const invertedRate = (1 / reverseRate).toString();
        return {
          rate: invertedRate,
          fromCcy: fromCcy,
          toCcy: toCcy,
          fromAmount: '',
          toAmount: '',
          source: 'reverse'
        };
      }
    }
    
    return null;
  },

  /**
   * Calculate cross rate via USD
   * Example: CAD -> USD -> INR
   */
  async fetchCrossRate(fromCcy, toCcy) {
    // Get fromCcy to USD rate
    const fromToUsdResponse = await api.get(`/api/fx?fromCcy=${fromCcy}&toCcy=USD`);
    const usdToToResponse = await api.get(`/api/fx?fromCcy=USD&toCcy=${toCcy}`);

    if (fromToUsdResponse.data?.status === 'OK' && 
        usdToToResponse.data?.status === 'OK' &&
        fromToUsdResponse.data.data?.rate &&
        usdToToResponse.data.data?.rate) {
      
      const fromToUsdRate = parseFloat(fromToUsdResponse.data.data.rate);
      const usdToToRate = parseFloat(usdToToResponse.data.data.rate);
      
      if (fromToUsdRate && usdToToRate) {
        const crossRate = (fromToUsdRate * usdToToRate).toString();
        return {
          rate: crossRate,
          fromCcy: fromCcy,
          toCcy: toCcy,
          fromAmount: '',
          toAmount: '',
          source: 'cross-usd'
        };
      }
    }

    return null;
  },

  /**
   * Fetch from external service as ultimate fallback
   * Note: You'll need to implement this based on your chosen external service
   */
  async fetchExternalRate(fromCcy, toCcy) {
    // Example implementation for exchangerate-api.com (free tier)
    // You would need to sign up and get an API key
    try {
      // This is a placeholder - implement based on your preferred external service
      const externalApiKey = process.env.REACT_APP_EXTERNAL_FX_API_KEY;
      if (!externalApiKey) {
        return null;
      }

      // Example for exchangerate-api.com
      const response = await fetch(`https://v6.exchangerate-api.com/v6/${externalApiKey}/pair/${fromCcy}/${toCcy}`);
      const data = await response.json();
      
      if (data.result === 'success' && data.conversion_rate) {
        return {
          rate: data.conversion_rate.toString(),
          fromCcy: fromCcy,
          toCcy: toCcy,
          fromAmount: '',
          toAmount: '',
          source: 'external'
        };
      }
    } catch (error) {
      console.warn('External FX service failed:', error);
    }

    return null;
  },

  /**
   * Cache management methods
   */
  getCachedRate(cacheKey) {
    const cached = this.rateCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return { ...cached.data, source: `${cached.data.source}-cached` };
    }
    this.rateCache.delete(cacheKey);
    return null;
  },

  setCachedRate(cacheKey, rateData) {
    this.rateCache.set(cacheKey, {
      data: rateData,
      timestamp: Date.now()
    });
  },

  clearCache() {
    this.rateCache.clear();
  },

  /**
   * Convert amount from one currency to another
   */
  async convertAmount(amount, fromCcy, toCcy) {
    try {
      if (fromCcy === toCcy) {
        return {
          originalAmount: amount,
          convertedAmount: amount,
          rate: 1,
          fromCcy,
          toCcy
        };
      }

      const fxData = await this.getFxRate(fromCcy, toCcy);
      const rate = parseFloat(fxData.rate);
      const convertedAmount = amount * rate;

      return {
        originalAmount: amount,
        convertedAmount: convertedAmount,
        rate: rate,
        fromCcy,
        toCcy,
        fxData,
        warning: fxData.warning
      };
    } catch (error) {
      console.error('Error converting amount:', error);
      throw error;
    }
  },

  /**
   * Get batch exchange rates with better error handling
   */
  async getBatchFxRates(currencyPairs) {
    try {
      const promises = currencyPairs.map(async pair => {
        try {
          const result = await this.getFxRate(pair.fromCcy, pair.toCcy);
          return { ...result, success: true };
        } catch (error) {
          return { 
            fromCcy: pair.fromCcy, 
            toCcy: pair.toCcy, 
            error: error.message, 
            success: false 
          };
        }
      });

      return await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching batch FX rates:', error);
      throw new Error('Failed to fetch batch exchange rates');
    }
  },

  /**
   * Check if a currency pair is supported
   */
  async checkCurrencySupport(fromCcy, toCcy) {
    try {
      const result = await this.getFxRate(fromCcy, toCcy);
      return {
        supported: !result.warning,
        rate: result.rate,
        source: result.source,
        warning: result.warning
      };
    } catch (error) {
      return {
        supported: false,
        error: error.message
      };
    }
  }
};