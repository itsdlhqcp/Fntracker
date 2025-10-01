import { useState, useCallback } from 'react';
import { tradeService } from '../services/tradeService';

export const useTrades = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create a new trade with proper API payload
  const createTrade = useCallback(async (tradeData, portfolio) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the updated tradeService.createTrade method that builds the API payload
      const newTrade = await tradeService.createTrade(tradeData, portfolio);
      
      // Add the new trade to the trades list
      setTrades(prevTrades => [newTrade, ...prevTrades]);
      
      return newTrade;
    } catch (err) {
      console.error('Create trade error:', err);
      setError(err.message || 'Failed to create trade');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

   // Fetch trades for a portfolio
  const fetchTrades = useCallback(async (portfolioId) => {
    if (!portfolioId) {
      setTrades([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await tradeService.getTradesByPortfolio(portfolioId);
      
      let tradesData = [];
      
      if (Array.isArray(response)) {
        tradesData = response;
      } else if (response && Array.isArray(response.data)) {
        tradesData = response.data;
      } else if (response && response.trades && Array.isArray(response.trades)) {
        tradesData = response.trades;
      }
      
      console.log('Fetched trades data:', tradesData);
      setTrades(tradesData);
      
      return tradesData;
    } catch (err) {
      console.error('Fetch trades error:', err);
      setError('Failed to fetch trades');
      setTrades([]);
    } finally {
      setLoading(false);
    }
  }, []);

 // Update an existing trade
  const updateTrade = useCallback(async (tradeId, tradeData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedTrade = await tradeService.updateTrade(tradeId, tradeData);
      
      // Update the trade in the trades list
      setTrades(prevTrades => 
        prevTrades.map(trade => 
          trade.id === tradeId ? updatedTrade : trade
        )
      );
      
      return updatedTrade;
    } catch (err) {
      console.error('Update trade error:', err);
      setError(err.message || 'Failed to update trade');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

 // Delete a trade
  const deleteTrade = useCallback(async (tradeId) => {
    try {
      setLoading(true);
      setError(null);
      
      await tradeService.deleteTrade(tradeId);
      
      // Remove the trade from the trades list
      setTrades(prevTrades => 
        prevTrades.filter(trade => trade.id !== tradeId)
      );
      
    } catch (err) {
      console.error('Delete trade error:', err);
      setError(err.message || 'Failed to delete trade');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete all trades for a specific asset
  const deleteTradesByAsset = useCallback(async (assetId, portfolioId) => {
    try {
      setLoading(true);
      setError(null);
      
      await tradeService.deleteTradesByAsset(assetId, portfolioId);
      
      // Remove trades for this asset from the trades list
      // Note: This assumes your trade objects have an assetId field
      setTrades(prevTrades => 
        prevTrades.filter(trade => trade.assetId !== assetId)
      );
      
    } catch (err) {
      console.error('Delete trades by asset error:', err);
      setError(err.message || 'Failed to delete trades for this asset');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get trades for a specific asset
  const fetchTradesByAsset = useCallback(async (assetId, portfolioId) => {
    try {
      setLoading(true);
      setError(null);
      
      const trades = await tradeService.getTradesByAsset(assetId, portfolioId);
      return trades;
    } catch (err) {
      console.error('Fetch trades by asset error:', err);
      setError('Failed to fetch trades for this asset');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch trade history for a symbol
  const fetchTradeHistory = useCallback(async (portfolioId, symbol) => {
    try {
      setLoading(true);
      setError(null);
      
      const history = await tradeService.getTradeHistory(portfolioId, symbol);
      return history;
    } catch (err) {
      console.error('Fetch trade history error:', err);
      setError('Failed to fetch trade history');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

 // Clear trades data
  const clearTrades = useCallback(() => {
    setTrades([]);
    setError(null);
  }, []);

 //  Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    trades,
    loading,
    error,
    createTrade,
    fetchTrades,
    updateTrade,
    deleteTrade,
    deleteTradesByAsset,
    fetchTradesByAsset,
    fetchTradeHistory,
    clearTrades,
    clearError
  };
};