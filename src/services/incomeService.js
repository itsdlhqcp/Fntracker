import api from '../utils/api';

export const incomeService = {
  async getIncomes(portfolioId, assetId) {
    try {
      const response = await api.get(`/api/income?portfolioId=${portfolioId}&assetId=${assetId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching incomes:', error);
      throw error;
    }
  },

  async createIncome(incomeData) {
    try {
      const response = await api.post('/api/income', incomeData);
      return response.data;
    } catch (error) {
      console.error('Error creating income:', error);
      throw error;
    }
  },

  async deleteIncome(incomeId, portfolioId) {
    try {
      const response = await api.delete(`/api/income/${incomeId}?portfolioId=${portfolioId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting income:', error);
      throw error;
    }
  }
};