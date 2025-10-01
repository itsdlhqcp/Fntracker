import { useState, useCallback } from 'react';
import { tradeService } from '../services/allTradesTransac';

export const useTrades = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState({});

  const fetchTrades = useCallback(async (portfolioId, assetId) => {
    if (!portfolioId || !assetId) {
      setTrades([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await tradeService.getTradesByHolding(portfolioId, assetId);
      
      let tradesData = [];
      
      if (Array.isArray(response)) {
        tradesData = response;
      } else if (response && Array.isArray(response.data)) {
        tradesData = response.data;
      }
      
      console.log('Processed trades data:', tradesData);
      setTrades(tradesData);
    } catch (err) {
      console.error('Trades fetch error:', err);
      setError('Failed to fetch trades');
      setTrades([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTrade = useCallback(async (portfolioId, txId) => {
    try {
      setDeleteLoading(prev => ({ ...prev, [txId]: true }));
      setError(null);
      
      await tradeService.deleteTrade(portfolioId, txId);
      
      setTrades(prevTrades => prevTrades.filter(trade => trade.txId !== txId));
      
      return { success: true, message: 'Transaction deleted successfully' };
    } catch (err) {
      console.error('Trade delete error:', err);
      setError('Failed to delete trade');
      return { success: false, message: 'Failed to delete transaction' };
    } finally {
      setDeleteLoading(prev => ({ ...prev, [txId]: false }));
    }
  }, []);

  const clearTrades = () => {
    setTrades([]);
    setError(null);
  };

  return {
    trades,
    loading,
    error,
    deleteLoading,
    fetchTrades,
    deleteTrade,
    clearTrades
  };
};