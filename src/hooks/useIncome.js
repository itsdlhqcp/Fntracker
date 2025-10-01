import { useState, useCallback } from 'react';
import { incomeService } from '../services/incomeService';

export const useIncome = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [createLoading, setCreateLoading] = useState(false);

  const fetchIncomes = useCallback(async (portfolioId, assetId) => {
    if (!portfolioId || !assetId) {
      setIncomes([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await incomeService.getIncomes(portfolioId, assetId);
      
      let incomesData = [];
      
      if (Array.isArray(response)) {
        incomesData = response;
      } else if (response && Array.isArray(response.data)) {
        incomesData = response.data;
      }
      
      console.log('Processed incomes data:', incomesData);
      setIncomes(incomesData);
    } catch (err) {
      console.error('Incomes fetch error:', err);
      setError('Failed to fetch incomes');
      setIncomes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createIncome = useCallback(async (incomeData) => {
    try {
      setCreateLoading(true);
      setError(null);
      
      const response = await incomeService.createIncome(incomeData);
      
      // Refresh incomes after creation
      if (incomeData.pid && incomeData.assetId) {
        await fetchIncomes(incomeData.pid, incomeData.assetId);
      }
      
      return { success: true, message: 'Income created successfully', data: response };
    } catch (err) {
      console.error('Income creation error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create income';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setCreateLoading(false);
    }
  }, [fetchIncomes]);

  const deleteIncome = useCallback(async (portfolioId, incomeId) => {
    try {
      setDeleteLoading(prev => ({ ...prev, [incomeId]: true }));
      setError(null);
      
      await incomeService.deleteIncome(incomeId, portfolioId);
      
      setIncomes(prevIncomes => prevIncomes.filter(income => income.txId !== incomeId));
      
      return { success: true, message: 'Income deleted successfully' };
    } catch (err) {
      console.error('Income delete error:', err);
      setError('Failed to delete income');
      return { success: false, message: 'Failed to delete income' };
    } finally {
      setDeleteLoading(prev => ({ ...prev, [incomeId]: false }));
    }
  }, []);

  const clearIncomes = () => {
    setIncomes([]);
    setError(null);
  };

  return {
    incomes,
    loading,
    error,
    deleteLoading,
    createLoading,
    fetchIncomes,
    createIncome,
    deleteIncome,
    clearIncomes
  };
};