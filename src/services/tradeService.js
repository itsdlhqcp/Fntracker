import api from '../utils/api';
import { fxService } from './fxService';

export const tradeService = {
  /**
   * Create trade with enhanced multi-currency support
   * @param {Object} tradeData 
   * @param {Object} portfolio 
   * @returns {Promise}
   */
  async createTrade(tradeData, portfolio) {
    try {
      const apiPayload = await this.buildTradePayload(tradeData, portfolio);
      
      const response = await api.post('/api/trades', apiPayload);
      return response.data;
    } catch (error) {
      console.error('Error creating trade:', error);
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Invalid trade data. Please check your input.';
        throw new Error(errorMessage);
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to add trades to this portfolio.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw new Error(`Failed to create trade: ${error.message}`);
    }
  },

  /**
   * Build trade payload with robust multi-currency handling
   */
  async buildTradePayload(tradeData, portfolio) {
    const {
      assetId,
      assetData,
      quantity,
      price,
      tradeType,
      tradeDate,
      notes,
      fee = 0,
      exchangeRate,
      feeExchangeRate
    } = tradeData;

    // Validate required fields
    if (!assetId || !portfolio?.pid) {
      throw new Error('Missing required trade data');
    }

    const tradeTypeMap = {
      'buy': 'BUY',
      'sell': 'SELL',
      'split': 'SPLIT',
      'bonus': 'BONUS',
      'open_balance': 'OPEN_BAL',
      'consolidate': 'CONSOLIDATE',
      'cancellation': 'CANCELLATION',
      'demerger': 'DEMERGER',
      'roc': 'ROC'
    };

    const trdTyp = tradeTypeMap[tradeType] || 'BUY';
    const trdDt = new Date(tradeDate).toISOString();

    // Get currencies with fallbacks
    const assetCcy = this.normalizeCurrency(assetData?.ccy || assetData?.currency || 'USD');
    const portfolioCcy = this.normalizeCurrency(portfolio?.ccy || portfolio?.currency || 'USD');

    console.log(`Building trade payload: Asset CCY: ${assetCcy}, Portfolio CCY: ${portfolioCcy}`);

    // Base payload
    const payload = {
      assetId: assetId,
      pid: portfolio.pid,
      qty: quantity.toString(),
      trdDt: trdDt,
      trdTyp: trdTyp,
      tradePrice: {
        amountStr: price.toString(),
        ccy: assetCcy
      },
      notes: notes || '',
      source: 'WEB'
    };

    // Handle currency conversion
    if (portfolioCcy !== assetCcy) {
      const fxRate = await this.getFxRateForTrade(assetCcy, portfolioCcy, exchangeRate);
      
      if (fxRate) {
        payload.fx = {
          rate: fxRate.rate,
          numCcy: portfolioCcy,
          denomCcy: assetCcy
        };

        // Log exchange rate info
        if (fxRate.warning) {
          console.warn(`FX Rate Warning: ${fxRate.warning}`);
        }
        console.log(`Applied FX rate: 1 ${assetCcy} = ${fxRate.rate} ${portfolioCcy} (Source: ${fxRate.source})`);
      }
    }

    // Handle fees
    if (fee && parseFloat(fee) > 0) {
      const feePayload = await this.buildFeePayload(fee, assetCcy, portfolioCcy, feeExchangeRate);
      if (feePayload) {
        payload.fee = feePayload;
      }
    }

    console.log('Final trade payload:', JSON.stringify(payload, null, 2));
    return payload;
  },

  /**
   * Get FX rate for trade with multiple fallback options
   */
  async getFxRateForTrade(assetCcy, portfolioCcy, providedRate) {
    // If user provided a rate, validate and use it
    if (providedRate && parseFloat(providedRate) > 0) {
      const rate = parseFloat(providedRate);
      return {
        rate: rate.toString(),
        source: 'user-provided',
        fromCcy: assetCcy,
        toCcy: portfolioCcy
      };
    }

    // Otherwise, fetch from FX service
    try {
      return await fxService.getFxRate(assetCcy, portfolioCcy);
    } catch (error) {
      console.error(`Failed to get FX rate from ${assetCcy} to ${portfolioCcy}:`, error);
      
      // As last resort, return rate of 1 with warning
      return {
        rate: '1',
        source: 'fallback',
        fromCcy: assetCcy,
        toCcy: portfolioCcy,
        warning: `Could not fetch exchange rate for ${assetCcy}/${portfolioCcy}. Using rate of 1.`
      };
    }
  },

  /**
   * Build fee payload with currency handling
   */
  async buildFeePayload(fee, assetCcy, portfolioCcy, feeExchangeRate) {
    try {
      const feeAmount = parseFloat(fee);
      let feeCcy = portfolioCcy; // Default to portfolio currency
      let finalFeeAmount = feeAmount;

      // If fee is in different currency and exchange rate provided
      if (feeExchangeRate && portfolioCcy !== assetCcy) {
        // You might want to handle fee currency conversion here
        // This depends on your specific business logic
      }

      return {
        amountStr: finalFeeAmount.toString(),
        ccy: feeCcy
      };
    } catch (error) {
      console.error('Error building fee payload:', error);
      return null;
    }
  },

  /**
   * Normalize currency codes
   */
  normalizeCurrency(currency) {
    if (!currency) return 'USD';
    return currency.toString().toUpperCase().trim();
  },

  /**
   * Validate currency code format
   */
  isValidCurrencyCode(currency) {
    return /^[A-Z]{3}$/.test(currency);
  },

  /**
   * Get supported currencies (you can expand this list)
   */
  getSupportedCurrencies() {
    return [
      'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD',
      'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'SGD', 'HKD',
      'INR', 'CNY', 'KRW', 'THB', 'MYR', 'IDR', 'PHP', 'VND',
      'BRL', 'MXN', 'ARS', 'CLP', 'COP', 'PEN', 'ZAR', 'RUB'
    ];
  },

  /**
   * Get trades by portfolio with enhanced error handling
   */
  async getTradesByPortfolio(portfolioId) {
    try {
      if (!portfolioId) {
        throw new Error('Portfolio ID is required');
      }

      const response = await api.get(`/api/trades?portfolioId=${portfolioId}`);
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data && Array.isArray(response.data.trades)) {
        return response.data.trades;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
      
      if (error.response?.status === 404) {
        return [];
      }
      
      throw error;
    }
  },

  /**
   * Update trade with multi-currency support
   */
  async updateTrade(tradeId, tradeData, portfolio) {
    try {
      // For updates, we might need to rebuild the payload
      let payload = tradeData;
      
      // If portfolio provided, rebuild payload with FX handling
      if (portfolio) {
        payload = await this.buildTradePayload(tradeData, portfolio);
      }

      const response = await api.put(`/api/trades/${tradeId}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating trade:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Trade not found.');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid trade data. Please check your input.');
      }
      
      throw new Error(`Failed to update trade: ${error.message}`);
    }
  },

  /**
   * Delete trade
   */
  async deleteTrade(tradeId) {
    try {
      const response = await api.delete(`/api/trades/${tradeId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting trade:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Trade not found.');
      }
      
      throw new Error(`Failed to delete trade: ${error.message}`);
    }
  },

  /**
   * Get trade history with currency information
   */
  async getTradeHistory(portfolioId, symbol) {
    try {
      const response = await api.get(`/api/trades/history?portfolioId=${portfolioId}&symbol=${symbol}`);
      
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching trade history:', error);
      
      if (error.response?.status === 404) {
        return [];
      }
      
      throw error;
    }
  },


  // Add this method to your existing tradeService object

/**
 * Delete all trades for a specific asset in a portfolio
 */
async deleteTradesByAsset(assetId, portfolioId) {
  try {
    if (!assetId || !portfolioId) {
      throw new Error('Asset ID and Portfolio ID are required');
    }

    const response = await api.delete(`/api/trades/asset/${assetId}?portfolioId=${portfolioId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting trades by asset:', error);
    
    if (error.response?.status === 404) {
      throw new Error('No trades found for this asset.');
    } else if (error.response?.status === 403) {
      throw new Error('You do not have permission to delete these trades.');
    }
    
    throw new Error(`Failed to delete trades: ${error.message}`);
  }
},

/**
 * Get all trades for a specific asset in a portfolio
 */
async getTradesByAsset(assetId, portfolioId) {
  try {
    if (!assetId || !portfolioId) {
      throw new Error('Asset ID and Portfolio ID are required');
    }

    const response = await api.get(`/api/trades/asset/${assetId}?portfolioId=${portfolioId}`);
    
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response.data && Array.isArray(response.data.trades)) {
      return response.data.trades;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching trades by asset:', error);
    
    if (error.response?.status === 404) {
      return [];
    }
    
    throw error;
  }
},

  /**
   * Validate trade data before submission
   */
  validateTradeData(tradeData, portfolio) {
    const errors = [];

    if (!tradeData.assetId) {
      errors.push('Asset is required');
    }

    if (!tradeData.quantity || parseFloat(tradeData.quantity) <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (!tradeData.price || parseFloat(tradeData.price) <= 0) {
      errors.push('Price must be greater than 0');
    }

    if (!tradeData.tradeDate) {
      errors.push('Trade date is required');
    }

    if (!portfolio) {
      errors.push('Portfolio is required');
    }

    const assetCcy = this.normalizeCurrency(tradeData.assetData?.ccy);
    const portfolioCcy = this.normalizeCurrency(portfolio?.ccy);

    if (!this.isValidCurrencyCode(assetCcy)) {
      errors.push(`Invalid asset currency: ${assetCcy}`);
    }

    if (!this.isValidCurrencyCode(portfolioCcy)) {
      errors.push(`Invalid portfolio currency: ${portfolioCcy}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};