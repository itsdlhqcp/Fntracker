import React, { useState, useRef, useEffect } from 'react';
import { useAssetSearch } from '../../../hooks/useAssetSearch';

const SymbolSearch = ({ value, onChange, disabled, placeholder, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  const {
    searchResults,
    loading,
    error: searchError,
    searchAssets,
    clearSearch,
    getAssetLogo
  } = useAssetSearch();

  // Handle input changes with debouncing
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (inputValue && inputValue.length >= 2) {
      timeoutRef.current = setTimeout(() => {
        searchAssets(inputValue);
        setIsOpen(true);
      }, 300); // 300ms debounce
    } else {
      clearSearch();
      setIsOpen(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inputValue, searchAssets, clearSearch]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Clear selected asset if user is typing
    if (selectedAsset && newValue !== selectedAsset.symbol) {
      setSelectedAsset(null);
      onChange('', null); // Clear the parent form
    }
  };

  const handleAssetSelect = (asset) => {
    setSelectedAsset(asset);
    setInputValue(asset.symbol);
    setIsOpen(false);
    clearSearch();
    
    // Pass both symbol and full asset data to parent
    onChange(asset.symbol, asset);
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Logo component with error handling
  const AssetLogo = ({ asset }) => {
    const [logoError, setLogoError] = useState(false);
    const logoUrl = getAssetLogo(asset.symbol, asset.exchange);

    if (logoError) {
      // Fallback to initials
      const initials = asset.symbol.slice(0, 2).toUpperCase();
      return (
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-gray-600">{initials}</span>
        </div>
      );
    }

    return (
      <img
        src={logoUrl}
        alt={`${asset.symbol} logo`}
        className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
        onError={() => setLogoError(true)}
        onLoad={() => setLogoError(false)}
      />
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder || "Search for symbols..."}
          className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        
        {/* Loading/Search Icon */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {loading ? (
            <div className="w-4 h-4 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {loading && searchResults.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                <span>Searching...</span>
              </div>
            </div>
          ) : searchError ? (
            <div className="px-4 py-3 text-sm text-red-600 text-center">
              {searchError}
            </div>
          ) : searchResults.length === 0 && inputValue.length >= 2 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No assets found for "{inputValue}"
            </div>
          ) : (
            <div className="py-1">
              {searchResults.map((asset, index) => (
                <button
                  key={`${asset.assetId}-${index}`}
                  type="button"
                  onClick={() => handleAssetSelect(asset)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {/* Asset Logo */}
                    <AssetLogo asset={asset} />
                    
                    {/* Asset Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 text-sm">
                          {asset.symbol}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {asset.exchange}
                        </span>
                        {asset.country && asset.country !== 'USA' && (
                          <span className="text-xs text-gray-500 bg-blue-100 px-2 py-0.5 rounded">
                            {asset.country}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 truncate mt-0.5">
                        {asset.nm}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {asset.visibleAssetType}
                        </span>
                        {asset.ccy && (
                          <span className="text-xs text-gray-500">
                            • {asset.ccy}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SymbolSearch;