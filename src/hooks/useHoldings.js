import { useState, useCallback } from 'react';
import { holdingsService } from '../services/holdingsService';

export const useHoldings = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHoldings = useCallback(async (portfolioId) => {
    if (!portfolioId) {
      setHoldings([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await holdingsService.getHoldingsByPortfolio(portfolioId);
      
      let holdingsData = [];
      
      if (Array.isArray(response)) {
        holdingsData = response;
      } else if (response && Array.isArray(response.data)) {
        holdingsData = response.data;
      } else if (response && response.holdings && Array.isArray(response.holdings)) {
        holdingsData = response.holdings;
      }
      
      console.log('Processed holdings data:', holdingsData);
      setHoldings(holdingsData);
    } catch (err) {
      console.error('Holdings fetch error:', err);
      setError('Failed to fetch holdings');
      setHoldings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearHoldings = () => {
    setHoldings([]);
    setError(null);
  };

  return {
    holdings,
    loading,
    error,
    fetchHoldings,
    clearHoldings
  };
};