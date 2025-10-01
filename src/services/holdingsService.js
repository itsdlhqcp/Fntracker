import api from '../utils/api';

export const holdingsService = {
  async getHoldingsByPortfolio(portfolioId) {
    try {
      const response = await api.get(`/api/holdings?portfolioId=${portfolioId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio holdings:', error);
      
      if (error.response?.status === 404 || error.response?.status === 204) {
        return [];
      }
      
      throw error;
    }
  },
};