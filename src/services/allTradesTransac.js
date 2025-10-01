import api from '../utils/api';

export const tradeService = {
  async getTradesByHolding(portfolioId, assetId) {
    try {
      const response = await api.get(`/api/trades?portfolioId=${portfolioId}&assetId=${assetId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trades:', error);
      throw error;
    }
  },

  async deleteTrade(portfolioId, txId) {
    try {
      const response = await api.delete(`/api/trades/${txId}?portfolioId=${portfolioId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting trade:', error);
      throw error;
    }
  }
};