import React from 'react';

const PortfolioCard = ({ 
  portfolio, 
  onEdit, 
  onDelete, 
  onSelect,
  isSelected = false,
  isDeleting = false 
}) => {
  const getCurrencySymbol = (currency) => {
    const symbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'AUD': 'A$',
      'SGD': 'S$',
      'CAD': 'C$'
    };
    return symbols[currency] || currency;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleDeleteClick = () => {
    onDelete(portfolio);
  };

  const handleCardClick = () => {
    onSelect(portfolio);
  };

  return (
    <div 
      className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 p-6 cursor-pointer ${
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {portfolio.nm}
            </h3>
            {portfolio.defalt && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Default
              </span>
            )}
            {isSelected && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Selected
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {portfolio.desc}
          </p>
          
          <div className="space-y-1 text-sm text-gray-500">
            <div className="flex items-center justify-between">
              <span>Currency:</span>
              <span className="font-medium text-gray-900">
                {getCurrencySymbol(portfolio.ccy)} {portfolio.ccy}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tax Residence:</span>
              <span className="font-medium text-gray-900">{portfolio.taxRes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Financial Year:</span>
              <span className="font-medium text-gray-900">
                {formatDate(portfolio.finYr)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Created:</span>
              <span className="font-medium text-gray-900">
                {formatDate(portfolio.crdDt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(portfolio);
          }}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick();
          }}
          disabled={isDeleting}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? (
            <>
              <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin mr-1"></div>
              Deleting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PortfolioCard;