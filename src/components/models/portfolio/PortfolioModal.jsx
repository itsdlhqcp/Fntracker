import React, { useState, useEffect } from 'react';

const PortfolioModal = ({ isOpen, onClose, onSave, portfolio = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    nm: '',
    desc: '',
    taxRes: 'IN',
    finYr: '2025-03-31'
  });
  
  const [errors, setErrors] = useState({});

  // Pre-populate form if editing existing portfolio
  useEffect(() => {
    if (portfolio) {
      setFormData({
        nm: portfolio.nm || '',
        desc: portfolio.desc || '',
        taxRes: portfolio.taxRes || 'IN',
        finYr: portfolio.finYr || '2025-03-31'
      });
    } else {
      setFormData({
        nm: '',
        desc: '',
        taxRes: 'IN',
        finYr: '2025-03-31'
      });
    }
    setErrors({});
  }, [portfolio, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nm.trim()) {
      newErrors.nm = 'Portfolio name is required';
    } else if (formData.nm.length < 2) {
      newErrors.nm = 'Portfolio name must be at least 2 characters';
    } else if (formData.nm.length > 50) {
      newErrors.nm = 'Portfolio name must be less than 50 characters';
    }

    if (!formData.desc.trim()) {
      newErrors.desc = 'Description is required';
    } else if (formData.desc.length > 200) {
      newErrors.desc = 'Description must be less than 200 characters';
    }

    if (!formData.taxRes) {
      newErrors.taxRes = 'Tax residence is required';
    }

    if (!formData.finYr) {
      newErrors.finYr = 'Financial year is required';
    } else {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.finYr)) {
        newErrors.finYr = 'Financial year must be in YYYY-MM-DD format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    // For exchange rate field, handle it differently to prevent cursor jumping
    if (field === 'feeExchangeRate') {
      setTradeData(prev => ({
        ...prev,
        [field]: value
      }));
      
      // Clear error immediately for better UX
      if (formErrors[field]) {
        setFormErrors(prev => ({
          ...prev,
          [field]: ''
        }));
      }
      return;
    }
  
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  const handleClose = () => {
    setFormData({
      nm: '',
      desc: '',
      taxRes: 'IN',
      finYr: '2025-03-31'
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {portfolio ? 'Edit Portfolio' : 'Create New Portfolio'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Portfolio Name */}
            <div>
              <label htmlFor="nm" className="block text-sm font-medium text-gray-700 mb-1">
                Portfolio Name *
              </label>
              <input
                type="text"
                id="nm"
                name="nm"
                value={formData.nm}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nm ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter portfolio name"
                disabled={isLoading}
              />
              {errors.nm && <p className="text-red-500 text-sm mt-1">{errors.nm}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="desc" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="desc"
                name="desc"
                value={formData.desc}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.desc ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter portfolio description"
                disabled={isLoading}
              />
              {errors.desc && <p className="text-red-500 text-sm mt-1">{errors.desc}</p>}
            </div>

            {/* Tax Residence */}
            <div>
              <label htmlFor="taxRes" className="block text-sm font-medium text-gray-700 mb-1">
                Tax Residence *
              </label>
              <select
                id="taxRes"
                name="taxRes"
                value={formData.taxRes}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.taxRes ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              >
                <option value="IN">India (IN)</option>
                <option value="US">United States (US)</option>
                <option value="AU">Australia (AU)</option>
                <option value="SR">Singapore (SR)</option>
                <option value="UK">United Kingdom (UK)</option>
                <option value="CA">Canada (CA)</option>
              </select>
              {errors.taxRes && <p className="text-red-500 text-sm mt-1">{errors.taxRes}</p>}
            </div>

            {/* Financial Year */}
            <div>
              <label htmlFor="finYr" className="block text-sm font-medium text-gray-700 mb-1">
                Financial Year End Date *
              </label>
              <input
                type="date"
                id="finYr"
                name="finYr"
                value={formData.finYr}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.finYr ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.finYr && <p className="text-red-500 text-sm mt-1">{errors.finYr}</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    {portfolio ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  portfolio ? 'Update Portfolio' : 'Create Portfolio'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PortfolioModal;