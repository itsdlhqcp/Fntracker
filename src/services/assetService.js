import api from '../utils/api';

export const assetSearchService = {
  async searchAssets(searchText) {
    try {
      const response = await api.get(`/api/asset/search?text=${encodeURIComponent(searchText)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching assets:', error);
      throw error;
    }
  },

  async getAssetLogo(symbol, exchange) {
    try {
      return `/api/asset/logos?symbol=${encodeURIComponent(symbol)}&exchange=${encodeURIComponent(exchange)}`;
    } catch (error) {
      console.error('Error getting asset logo:', error);
      throw error;
    }
  },

  async getAssetDetails(assetId) {
    try {
      const response = await api.get(`/api/asset/${assetId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching asset details:', error);
      throw error;
    }
  },

  async getAssetPrice(assetId) {
    try {
      const response = await api.get(`/api/asset/price?assetId=${assetId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching asset price:', error);
      throw error;
    }
  }
};