import React, { useState, useEffect, useMemo } from 'react';
import SymbolSearch from '../portfolio/SymbolSearch';
import CompanyLogo from '../../../components/companyLogo'; 
import { useFx } from '../../../hooks/useFx';
import { assetSearchService } from '../../../services/assetService';

const TradeModal = ({ 
  isOpen, 
  onClose, 
  onAddTrade, 
  portfolio, 
  isLoading = false 
}) => {
  const [tradeData, setTradeData] = useState({
    symbol: '',
    assetId: '',
    assetData: null,
    quantity: '',
    price: '',
    tradeType: 'buy', 
    tradeDate: new Date().toISOString().split('T')[0],
    fee: '',
    feeExchangeRate: '',
    brokerage: '',
    notes: ''
  });

  // New state for asset price
  const [assetPrice, setAssetPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState(null);

  const [formErrors, setFormErrors] = useState({});
  const [showFeeExchangeRateField, setShowFeeExchangeRateField] = useState(false);
  const [autoFetchingFxRate, setAutoFetchingFxRate] = useState(false);
  const [conversionDirection, setConversionDirection] = useState('USD/INR');

  // Use the FX hook
  const { getFxRate, loading: fxLoading, error: fxError } = useFx();

  // Trade type options for dropdown
  const tradeTypeOptions = [
    { value: 'buy', label: 'Buy' },
    { value: 'sell', label: 'Sell' },
    { value: 'split', label: 'Split' },
    { value: 'bonus', label: 'Bonus' },
    { value: 'open_balance', label: 'Opening Balance' },
    { value: 'consolidate', label: 'Consolidate' },
    { value: 'cancellation', label: 'Cancellation' },
    { value: 'demerger', label: 'Demerger' },
    { value: 'roc', label: 'Return of Capital' }
  ];

  // Function to fetch asset price
  const fetchAssetPrice = async (assetId) => {
    if (!assetId) return;

    try {
      setPriceLoading(true);
      setPriceError(null);
      
      const priceData = await assetSearchService.getAssetPrice(assetId);
      
      if (priceData && priceData.data) {
        setAssetPrice(priceData.data);
        
        // Auto-fill price field if it's empty
        if (!tradeData.price) {
          setTradeData(prev => ({
            ...prev,
            price: priceData.data.amount.toString()
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch asset price:', error);
      setPriceError('Failed to fetch current price');
      setAssetPrice(null);
    } finally {
      setPriceLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Check if exchange rate field should be shown
  const checkExchangeRateRequirement = (assetData, portfolio) => {
    if (!assetData || !portfolio) return false;

    const assetCcy = assetData.ccy;
    const portfolioCcy = portfolio.ccy;

    return assetCcy && portfolioCcy && assetCcy !== portfolioCcy;
  };

  // Auto-fetch exchange rate for fee (brokerage uses same rate)
  const autoFetchExchangeRate = async (fromCcy, toCcy) => {
    if (!fromCcy || !toCcy || fromCcy === toCcy) return;

    try {
      setAutoFetchingFxRate(true);
      
      // Determine conversion direction based on currencies
      let direction = '';
      if ((fromCcy === 'USD' && toCcy === 'INR') || (fromCcy === 'INR' && toCcy === 'USD')) {
        direction = `${fromCcy}/${toCcy}`;
        setConversionDirection(direction);
      }

      const fxData = await getFxRate(fromCcy, toCcy);
      
      if (fxData && fxData.rate) {
        setTradeData(prev => ({
          ...prev,
          feeExchangeRate: fxData.rate.toString()
        }));
      }
    } catch (error) {
      console.error('Failed to auto-fetch exchange rate:', error);
      // Don't show error to user for auto-fetch, they can manually enter
    } finally {
      setAutoFetchingFxRate(false);
    }
  };

  // Memoized calculations that update when relevant fields change
  const calculations = useMemo(() => {
    const quantity = parseFloat(tradeData.quantity) || 0;
    const price = parseFloat(tradeData.price) || 0;
    const fee = parseFloat(tradeData.fee) || 0;
    const brokerage = parseFloat(tradeData.brokerage) || 0;
    const feeExchangeRate = parseFloat(tradeData.feeExchangeRate) || 1;

    const totalAmount = quantity * price;
    
    // Convert fees and brokerage to portfolio currency if needed (using same exchange rate)
    let feeInPortfolioCurrency = fee;
    let brokerageInPortfolioCurrency = brokerage;

    if (showFeeExchangeRateField && (fee > 0 || brokerage > 0)) {
      // Apply conversion based on direction for both fee and brokerage
      if (conversionDirection.startsWith(tradeData.assetData?.ccy)) {
        feeInPortfolioCurrency = fee * feeExchangeRate;
        brokerageInPortfolioCurrency = brokerage * feeExchangeRate;
      } else {
        feeInPortfolioCurrency = fee / feeExchangeRate;
        brokerageInPortfolioCurrency = brokerage / feeExchangeRate;
      }
    }

    return {
      totalAmount,
      feeInPortfolioCurrency,
      brokerageInPortfolioCurrency,
      totalCosts: feeInPortfolioCurrency + brokerageInPortfolioCurrency
    };
  }, [
    tradeData.quantity, 
    tradeData.price, 
    tradeData.fee, 
    tradeData.brokerage,
    tradeData.feeExchangeRate,
    showFeeExchangeRateField,
    conversionDirection,
    tradeData.assetData?.ccy
  ]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTradeData({
        symbol: '',
        assetId: '',
        assetData: null,
        quantity: '',
        price: '',
        tradeType: 'buy',
        tradeDate: new Date().toISOString().split('T')[0],
        fee: '',
        feeExchangeRate: '',
        brokerage: '',
        notes: ''
      });
      setFormErrors({});
      setShowFeeExchangeRateField(false);
      setConversionDirection('USD/INR');
      
      // Reset price state
      setAssetPrice(null);
      setPriceLoading(false);
      setPriceError(null);
    }
  }, [isOpen]);

  // Updated useEffect for setting initial conversion direction
  useEffect(() => {
    const shouldShowExchangeRate = checkExchangeRateRequirement(tradeData.assetData, portfolio);
    
    setShowFeeExchangeRateField(shouldShowExchangeRate);

    // Set initial conversion direction and auto-fetch exchange rate if needed
    if (shouldShowExchangeRate && tradeData.assetData?.ccy && portfolio?.ccy) {
      const assetCcy = tradeData.assetData.ccy;
      const portfolioCcy = portfolio.ccy;
      
      // Set default direction (asset currency to portfolio currency)
      const initialDirection = `${assetCcy}/${portfolioCcy}`;
      setConversionDirection(initialDirection);
      
      // Auto-fetch rate
      autoFetchExchangeRate(assetCcy, portfolioCcy);
    }
  }, [tradeData.assetData, portfolio]);

  // Fetch price when asset is selected
  useEffect(() => {
    if (tradeData.assetId && tradeData.assetData) {
      fetchAssetPrice(tradeData.assetId);
    } else {
      setAssetPrice(null);
      setPriceError(null);
    }
  }, [tradeData.assetId]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setTradeData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear specific field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle conversion direction toggle
  const handleConversionToggle = () => {
    if (!tradeData.assetData?.ccy || !portfolio?.ccy) return;
  
    const assetCcy = tradeData.assetData.ccy;
    const portfolioCcy = portfolio.ccy;
  
    if (assetCcy !== portfolioCcy) {
      const currentDirectionParts = conversionDirection.split('/');
      const newDirection = `${currentDirectionParts[1]}/${currentDirectionParts[0]}`;
      setConversionDirection(newDirection);
      
      // Fetch rate for the new direction
      const [fromCcy, toCcy] = newDirection.split('/');
      autoFetchExchangeRate(fromCcy, toCcy);
    }
  };

  // Handle symbol selection from search
  const handleSymbolSelect = (symbol, assetData) => {
    setTradeData(prev => ({
      ...prev,
      symbol: symbol,
      assetId: assetData?.assetId || '',
      assetData: assetData,
      feeExchangeRate: '', // Reset exchange rate when symbol changes
      price: '' // Reset price when symbol changes
    }));

    // Clear symbol error when user selects
    if (formErrors.symbol) {
      setFormErrors(prev => ({
        ...prev,
        symbol: ''
      }));
    }
  };

  // Function to use current price
  const useCurrentPrice = () => {
    if (assetPrice && assetPrice.amount) {
      setTradeData(prev => ({
        ...prev,
        price: assetPrice.amount.toString()
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!tradeData.symbol.trim()) {
      errors.symbol = 'Symbol is required';
    }

    if (!tradeData.assetId) {
      errors.symbol = 'Please select a valid asset';
    }

    if (!tradeData.quantity || tradeData.quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }

    if (!tradeData.price || tradeData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    if (!tradeData.tradeDate) {
      errors.tradeDate = 'Trade date is required';
    }

    // Validate fee if provided
    if (tradeData.fee && tradeData.fee < 0) {
      errors.fee = 'Fee cannot be negative';
    }

    // Validate brokerage if provided
    if (tradeData.brokerage && tradeData.brokerage < 0) {
      errors.brokerage = 'Brokerage cannot be negative';
    }

    // Validate fee exchange rate if required and (fee or brokerage) is provided
    if (showFeeExchangeRateField && (tradeData.fee || tradeData.brokerage) && 
        (parseFloat(tradeData.fee) > 0 || parseFloat(tradeData.brokerage) > 0) && 
        (!tradeData.feeExchangeRate || tradeData.feeExchangeRate <= 0)) {
      errors.feeExchangeRate = 'Exchange rate is required when fee or brokerage is provided';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const tradePayload = {
        symbol: tradeData.symbol,
        assetId: tradeData.assetId,
        assetData: tradeData.assetData,
        quantity: parseFloat(tradeData.quantity),
        price: parseFloat(tradeData.price),
        tradeType: tradeData.tradeType,
        tradeDate: tradeData.tradeDate,
        fee: tradeData.fee ? parseFloat(tradeData.fee) : 0,
        feeExchangeRate: showFeeExchangeRateField && (tradeData.fee || tradeData.brokerage) ? parseFloat(tradeData.feeExchangeRate) : null,
        brokerage: tradeData.brokerage ? parseFloat(tradeData.brokerage) : 0,
        notes: tradeData.notes || '',
        // Additional metadata
        portfolioId: portfolio?.pid,
        portfolioName: portfolio?.nm,
        totalAmount: calculations.totalAmount,
        totalCosts: calculations.totalCosts
      };

      await onAddTrade(tradePayload);
    } catch (error) {
      console.error('Error adding trade:', error);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // Exchange Rate Input Component (used for both fee and brokerage)
  const ExchangeRateInput = ({ 
    value, 
    onChange, 
    fromCcy, 
    toCcy, 
    error, 
    disabled,
    conversionDir,
    onToggle 
  }) => {
    const canToggle = fromCcy && toCcy && fromCcy !== toCcy;
    
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Exchange Rate ({conversionDir}) *
          </label>
          {canToggle && (
            <button
              type="button"
              onClick={onToggle}
              disabled={disabled || autoFetchingFxRate}
              className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Switch to {conversionDir === `${fromCcy}/${toCcy}` ? `${toCcy}/${fromCcy}` : `${fromCcy}/${toCcy}`}
            </button>
          )}
        </div>
        
        <div className="relative">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder="Exchange rate will be auto-fetched from API"
            min="0"
            step="any"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              error ? 'border-red-300' : 'border-gray-300'
            } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
          />
          {autoFetchingFxRate && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        
        {/* Display current rate info */}
        {value && fromCcy && toCcy && (
          <div className="mt-1 text-xs text-gray-600">
            {conversionDir === `${fromCcy}/${toCcy}` ? 
              `${fromCcy} 1 = ${toCcy} ${value}` : 
              `${toCcy} 1 = ${fromCcy} ${value}`
            }
          </div>
        )}
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40" 
        onClick={!isLoading ? handleCancel : undefined}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Add New Trade</h3>
            {portfolio && (
              <p className="text-sm text-gray-600">
                Portfolio: {portfolio.nm} {portfolio.ccy && `(${portfolio.ccy})`}
              </p>
            )}
          </div>
          
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* First Row: Trade Type and Symbol */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Trade Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trade Type</label>
              <select
                value={tradeData.tradeType}
                onChange={(e) => handleInputChange('tradeType', e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
              >
                {tradeTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Symbol Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Symbol *</label>
              <SymbolSearch
                value={tradeData.symbol}
                onChange={handleSymbolSelect}
                disabled={isLoading}
                placeholder="Search for symbols (e.g., AAPL, MSFT, TCS)"
                error={formErrors.symbol}
              />
              {formErrors.symbol && (
                <p className="mt-1 text-sm text-red-600">{formErrors.symbol}</p>
              )}
            </div>
          </div>

          {/* Selected Asset Info */}
          {tradeData.assetData && (
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex items-center space-x-3">
                <CompanyLogo 
                  symbol={tradeData.symbol} 
                  assetData={tradeData.assetData}
                  className="w-8 h-8 flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-blue-900 truncate">
                    {tradeData.assetData.nm}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-blue-700">
                    <span>{tradeData.assetData.exchange}</span>
                    {tradeData.assetData.country && (
                      <>
                        <span>•</span>
                        <span>{tradeData.assetData.country}</span>
                      </>
                    )}
                    {tradeData.assetData.ccy && (
                      <>
                        <span>•</span>
                        <span>{tradeData.assetData.ccy}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Price and Updated Date Display */}
                <div className="flex flex-col items-end space-y-1">
                  {priceLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-blue-600">Loading price...</span>
                    </div>
                  ) : priceError ? (
                    <span className="text-xs text-red-600">{priceError}</span>
                  ) : assetPrice ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-green-600">
                          {assetPrice.ccy} {assetPrice.amount}
                        </span>
                        <button
                          type="button"
                          onClick={useCurrentPrice}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                          title="Use current price"
                        >
                          Use
                        </button>
                      </div>
                      {tradeData.assetData.updatedDate && (
                        <span className="text-xs text-gray-500">
                          Updated: {formatDate(tradeData.assetData.updatedDate)}
                        </span>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* Second Row: Quantity, Price, Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                value={tradeData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                disabled={isLoading}
                placeholder="0"
                min="0"
                step="any"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                  formErrors.quantity ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.quantity && (
                <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price * {tradeData.assetData?.ccy && `(${tradeData.assetData.ccy})`}
              </label>
              <input
                type="number"
                value={tradeData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                disabled={isLoading}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                  formErrors.price ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.price && (
                <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
              )}
            </div>

            {/* Trade Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={tradeData.tradeDate}
                onChange={(e) => handleInputChange('tradeDate', e.target.value)}
                disabled={isLoading}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                  formErrors.tradeDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.tradeDate && (
                <p className="mt-1 text-sm text-red-600">{formErrors.tradeDate}</p>
              )}
            </div>
          </div>

          {/* Third Row: Fee and Brokerage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee {portfolio?.ccy && `(${portfolio.ccy})`}
              </label>
              <input
                type="number"
                value={tradeData.fee}
                onChange={(e) => handleInputChange('fee', e.target.value)}
                disabled={isLoading}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                  formErrors.fee ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.fee && (
                <p className="mt-1 text-sm text-red-600">{formErrors.fee}</p>
              )}
            </div>

            {/* Brokerage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brokerage -Optional {portfolio?.ccy && `(${portfolio.ccy})`}
              </label>
              <input
                type="number"
                value={tradeData.brokerage}
                onChange={(e) => handleInputChange('brokerage', e.target.value)}
                disabled={isLoading}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 ${
                  formErrors.brokerage ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.brokerage && (
                <p className="mt-1 text-sm text-red-600">{formErrors.brokerage}</p>
              )}
            </div>
          </div>

          {/* Exchange Rate (when needed and fee OR brokerage is provided) */}
          {showFeeExchangeRateField && ((tradeData.fee && parseFloat(tradeData.fee) > 0) || (tradeData.brokerage && parseFloat(tradeData.brokerage) > 0)) && (
            <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-orange-800 mb-2">Exchange Rate</h4>
                  <p className="text-xs text-orange-700 mb-3">
                    This rate will be used to convert both fee and brokerage to portfolio currency.
                  </p>
                  
                  <ExchangeRateInput
                    value={tradeData.feeExchangeRate}
                    onChange={(rate) => handleInputChange('feeExchangeRate', rate)}
                    fromCcy={tradeData.assetData?.ccy}
                    toCcy={portfolio?.ccy}
                    error={formErrors.feeExchangeRate}
                    disabled={isLoading || autoFetchingFxRate}
                    conversionDir={conversionDirection}
                    onToggle={handleConversionToggle}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Total Amount Display - Enhanced with real-time calculations */}
          {tradeData.quantity && tradeData.price && (
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Trade Amount:</span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {tradeData.assetData?.ccy || 'USD'} {calculations.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Fee breakdown */}
              {tradeData.fee && parseFloat(tradeData.fee) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Fee:</span>
                  <div className="text-right">
                    <div className="text-gray-700">
                      {portfolio?.ccy || 'USD'} {calculations.feeInPortfolioCurrency.toFixed(2)}
                    </div>
                    {showFeeExchangeRateField && (
                      <div className="text-xs text-gray-500">
                        ({tradeData.assetData?.ccy || 'USD'} {parseFloat(tradeData.fee).toFixed(2)} × {tradeData.feeExchangeRate || '1'})
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Brokerage breakdown */}
              {tradeData.brokerage && parseFloat(tradeData.brokerage) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Brokerage:</span>
                  <div className="text-right">
                    <div className="text-gray-700">
                      {portfolio?.ccy || 'USD'} {calculations.brokerageInPortfolioCurrency.toFixed(2)}
                    </div>
                    {showFeeExchangeRateField && (
                      <div className="text-xs text-gray-500">
                        ({tradeData.assetData?.ccy || 'USD'} {parseFloat(tradeData.brokerage).toFixed(2)} × {tradeData.feeExchangeRate || '1'})
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Total costs */}
              {calculations.totalCosts > 0 && (
                <div className="flex justify-between items-center text-sm pt-1 border-t border-gray-300">
                  <span className="text-gray-600">Total Costs:</span>
                  <div className="text-gray-700 font-medium">
                    {portfolio?.ccy || 'USD'} {calculations.totalCosts.toFixed(2)}
                  </div>
                </div>
              )}

              {/* Grand total for buy trades */}
              {tradeData.tradeType === 'buy' && (
                <div className="flex justify-between items-center pt-2 border-t border-gray-400">
                  <span className="text-sm font-semibold text-gray-900">Net Amount:</span>
                  <div className="text-right">
                    <div className="text-base font-bold text-gray-900">
                      {portfolio?.ccy || 'USD'} {(calculations.totalAmount + calculations.totalCosts).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      (Trade + Costs)
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={tradeData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              disabled={isLoading}
              placeholder="Add any additional notes..."
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isLoading || autoFetchingFxRate}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || autoFetchingFxRate ? (
                <>
                  <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  {autoFetchingFxRate ? 'Fetching Rate...' : 'Adding Trade...'}
                </>
              ) : (
                'Add Trade'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeModal;