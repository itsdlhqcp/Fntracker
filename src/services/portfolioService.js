import api from '../utils/api';

export const portfolioService = {
  // Get all portfolios for the authenticated user
  async getAllPortfolios() {
    try {
      const response = await api.get('/api/portfolios');
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      throw error;
    }
  },

  // Create a new portfolio
  async createPortfolio(portfolioData) {
    try {
      const response = await api.post('/api/portfolios', portfolioData);
      return response.data;
    } catch (error) {
      console.error('Error creating portfolio:', error);
      throw error;
    }
  },

  // Update an existing portfolio
  async updatePortfolio(portfolioId, portfolioData) {
    try {
      const response = await api.put(`/api/portfolios/${portfolioId}`, portfolioData);
      return response.data;
    } catch (error) {
      console.error('Error updating portfolio:', error);
      throw error;
    }
  },

  // Delete a portfolio
  async deletePortfolio(portfolioId) {
    try {
      const response = await api.delete(`/api/portfolios/${portfolioId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      throw error;
    }
  },

  // Get a specific portfolio by ID
  async getPortfolioById(portfolioId) {
    try {
      const response = await api.get(`/api/portfolios/${portfolioId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw error;
    }
  }
};