import { useState, useCallback, useRef } from 'react';
import { assetSearchService } from '../services/assetService';

export const useAssetSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchRequestRef = useRef(null);

  const searchAssets = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setError(null);
      setSearchQuery('');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearchQuery(query);

      const requestId = Date.now();
      searchRequestRef.current = requestId;

      const response = await assetSearchService.searchAssets(query.trim());
      
      if (searchRequestRef.current === requestId) {
        let assets = [];
        
        if (response && response.data && Array.isArray(response.data)) {
          assets = response.data;
        } else if (Array.isArray(response)) {
          assets = response;
        }
        
        setSearchResults(assets);
      }
    } catch (err) {
      if (searchRequestRef.current === searchRequestRef.current) {
        console.error('Asset search error:', err);
        setError('Failed to search assets');
        setSearchResults([]);
      }
    } finally {
      if (searchRequestRef.current === searchRequestRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setError(null);
    setSearchQuery('');
    setLoading(false);
    searchRequestRef.current = null;
  }, []);

  const getAssetLogo = useCallback((symbol, exchange) => {
    return assetSearchService.getAssetLogo(symbol, exchange);
  }, []);

  return {
    searchResults,
    loading,
    error,
    searchQuery,
    searchAssets,
    clearSearch,
    getAssetLogo
  };
};