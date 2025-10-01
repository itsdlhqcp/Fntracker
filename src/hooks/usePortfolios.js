import { useState, useEffect, useCallback } from 'react';
import { portfolioService } from '../services/portfolioService';

export const usePortfolios = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPortfolios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await portfolioService.getAllPortfolios();
      
      if (response.status === 'OK' && Array.isArray(response.data)) {
        setPortfolios(response.data);
      } else {
        setPortfolios([]);
      }
    } catch (err) {
      console.error('Failed to load portfolios:', err);
      setError(err.message || 'Failed to load portfolios. Please try again.');
      setPortfolios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPortfolio = useCallback(async (portfolioData) => {
    try {
      const response = await portfolioService.createPortfolio(portfolioData);
      await loadPortfolios(); // Refresh the list
      return response;
    } catch (err) {
      console.error('Failed to create portfolio:', err);
      throw err;
    }
  }, [loadPortfolios]);

  const updatePortfolio = useCallback(async (portfolioId, portfolioData) => {
    try {
      const response = await portfolioService.updatePortfolio(portfolioId, portfolioData);
      await loadPortfolios(); // Refresh the list
      return response;
    } catch (err) {
      console.error('Failed to update portfolio:', err);
      throw err;
    }
  }, [loadPortfolios]);

  const deletePortfolio = useCallback(async (portfolioId) => {
    try {
      const response = await portfolioService.deletePortfolio(portfolioId);
      await loadPortfolios(); // Refresh the list
      return response;
    } catch (err) {
      console.error('Failed to delete portfolio:', err);
      throw err;
    }
  }, [loadPortfolios]);

  const getPortfolioById = useCallback(async (portfolioId) => {
    try {
      const response = await portfolioService.getPortfolioById(portfolioId);
      return response;
    } catch (err) {
      console.error('Failed to get portfolio:', err);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load portfolios on hook initialization
  useEffect(() => {
    loadPortfolios();
  }, [loadPortfolios]);

  return {
    portfolios,
    loading,
    error,
    loadPortfolios,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    getPortfolioById,
    clearError
  };
};