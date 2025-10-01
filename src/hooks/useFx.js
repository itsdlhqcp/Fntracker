import { useState, useCallback } from 'react';
import { fxService } from '../services/fxService';

export const useFx = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fxRates, setFxRates] = useState({});

  /**
   * Get FX rate between two currencies
   */
  const getFxRate = useCallback(async (fromCcy, toCcy) => {
    const cacheKey = `${fromCcy}-${toCcy}`;
    
    // Return cached rate if available
    if (fxRates[cacheKey]) {
      return fxRates[cacheKey];
    }

    try {
      setLoading(true);
      setError(null);
      
      const fxData = await fxService.getFxRate(fromCcy, toCcy);
      
      // Cache the rate
      setFxRates(prev => ({
        ...prev,
        [cacheKey]: fxData
      }));
      
      return fxData;
    } catch (err) {
      console.error('Get FX rate error:', err);
      setError(err.message || 'Failed to get exchange rate');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fxRates]);

  /**
   * Convert amount from one currency to another
   */
  const convertAmount = useCallback(async (amount, fromCcy, toCcy) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fxService.convertAmount(amount, fromCcy, toCcy);
      
      // Cache the FX rate if it was fetched
      if (result.fxData && fromCcy !== toCcy) {
        const cacheKey = `${fromCcy}-${toCcy}`;
        setFxRates(prev => ({
          ...prev,
          [cacheKey]: result.fxData
        }));
      }
      
      return result;
    } catch (err) {
      console.error('Convert amount error:', err);
      setError(err.message || 'Failed to convert amount');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear cached FX rates
   */
  const clearFxCache = useCallback(() => {
    setFxRates({});
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    fxRates,
    getFxRate,
    convertAmount,
    clearFxCache,
    clearError
  };
};