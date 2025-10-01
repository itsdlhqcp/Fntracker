import React, { useState } from 'react';

const AddIncomeModal = ({ isOpen, onClose, onSubmit, loading, portfolioId, assetId, assetType }) => {
  const [formData, setFormData] = useState({
    source: 'WEB',
    notes: '',
    incomeType: 'DIVIDEND',
    paidDate: new Date().toISOString().split('T')[0],
    exDate: new Date().toISOString().split('T')[0],
    grossAmnt: {
      amountStr: '',
      ccy: 'USD'
    },
    taxRate: 0,
    taxAble: false
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const incomeData = {
      pid: portfolioId,
      assetId: assetId,
      assetType: assetType,
      ...formData,
      grossAmnt: {
        ...formData.grossAmnt,
        amountStr: formData.grossAmnt.amountStr.toString()
      }
    };

    const result = await onSubmit(incomeData);
    if (result.success) {
      onClose();
      setFormData({
        source: 'WEB',
        notes: '',
        incomeType: 'DIVIDEND',
        paidDate: new Date().toISOString().split('T')[0],
        exDate: new Date().toISOString().split('T')[0],
        grossAmnt: {
          amountStr: '',
          ccy: 'USD'
        },
        taxRate: 0,
        taxAble: false
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('grossAmnt.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        grossAmnt: {
          ...prev.grossAmnt,
          [field]: field === 'amountStr' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Add Income</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Income Type</label>
              <select
                name="incomeType"
                value={formData.incomeType}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              >
                <option value="DIVIDEND">Dividend</option>
                <option value="RENTAL">Rental</option>
                <option value="INTEREST">Interest</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <select
                  name="grossAmnt.ccy"
                  value={formData.grossAmnt.ccy}
                  onChange={handleChange}
                  className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm"
                >
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                  <option value="EUR">EUR</option>
                </select>
                <input
                  type="number"
                  name="grossAmnt.amountStr"
                  value={formData.grossAmnt.amountStr}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Enter notes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Paid Date</label>
              <input
                type="date"
                name="paidDate"
                value={formData.paidDate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ex-Date</label>
              <input
                type="date"
                name="exDate"
                value={formData.exDate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
              <input
                type="number"
                name="taxRate"
                value={formData.taxRate}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="100"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="taxAble"
                checked={formData.taxAble}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Taxable</label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Income'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddIncomeModal;