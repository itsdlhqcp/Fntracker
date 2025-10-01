import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTrades } from '../hooks/useAllTradeTrasns';
import { useIncome } from '../hooks/useIncome';
import AddIncomeModal from '../components/AddIncomeModal';

const HoldingDetail = () => {
  const { portfolioId, assetId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const holding = location.state?.holding;
  
  const { trades, loading: tradesLoading, error: tradesError, deleteLoading: tradeDeleteLoading, fetchTrades, deleteTrade } = useTrades();
  const { incomes, loading: incomesLoading, error: incomesError, deleteLoading: incomeDeleteLoading, createLoading: incomeCreateLoading, fetchIncomes, createIncome, deleteIncome } = useIncome();
  
  const [notification, setNotification] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, type: null });
  const [addIncomeModal, setAddIncomeModal] = useState(false);

  useEffect(() => {
    if (portfolioId && assetId) {
      fetchTrades(portfolioId, assetId);
      fetchIncomes(portfolioId, assetId);
    }
  }, [portfolioId, assetId, fetchTrades, fetchIncomes]);

  const handleBackToPortfolio = () => {
    navigate('/dashboard');
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteItem = async () => {
    if (!deleteModal.item) return;
    
    let result;
    
    if (deleteModal.type === 'trade') {
      result = await deleteTrade(portfolioId, deleteModal.item.txId);
    } else if (deleteModal.type === 'income') {
      result = await deleteIncome(portfolioId, deleteModal.item.txId);
    }

    showNotification(result.success ? 'success' : 'error', result.message);
    setDeleteModal({ isOpen: false, item: null, type: null });
  };

  const handleAddIncome = async (incomeData) => {
    const result = await createIncome(incomeData);
    showNotification(result.success ? 'success' : 'error', result.message);
    return result;
  };

  const openDeleteModal = (item, type) => {
    setDeleteModal({ isOpen: true, item, type });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, item: null, type: null });
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return 'N/A';
    return `${currency === 'USD' ? '$' : currency === 'INR' ? '₹' : ''}${Number(amount).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification */}
        {notification && (
          <div className={`mb-4 p-4 rounded-md ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleBackToPortfolio}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Portfolio
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {holding?.asset?.symbol || 'Holding Detail'}
            </h1>
            <p className="text-gray-600">
              {holding?.asset?.nm || 'Asset Details'}
            </p>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <span>Portfolio ID: {portfolioId}</span>
              <span>Asset ID: {assetId}</span>
            </div>
          </div>
        </div>

        {/* Holding Overview */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Holding Overview
            </h3>
            
            {holding ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {(holding.qty || 0).toLocaleString()}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Average Buy Price</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    ${(holding.avgBuyPrice?.amount || 0).toFixed(2)}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Current Price</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    ${(holding.currentPrice || 0).toFixed(2)}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Market Value</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    ${parseFloat(holding.currentValueInTradeCcy?.amountStr || holding.currentValueInProfileCcy?.amountStr || '0').toFixed(2)}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Unrealized P&L</dt>
                  <dd className={`mt-1 text-2xl font-semibold ${
                    parseFloat(holding.unrealizedGainInTradeCcy?.amountStr || '0') >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {parseFloat(holding.unrealizedGainInTradeCcy?.amountStr || '0') >= 0 ? '+' : ''}
                    ${parseFloat(holding.unrealizedGainInTradeCcy?.amountStr || '0').toFixed(2)}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Asset Type</dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {holding.asset?.visibleAssetType || holding.asset?.assetType || 'N/A'}
                    </span>
                  </dd>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No holding data available</p>
                <p className="text-sm text-gray-400 mt-2">
                  Portfolio ID: {portfolioId} | Asset ID: {assetId}
                </p>
              </div>
            )}
          </div>
        </div>

          {/* Trade History */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Transaction History
            </h3>
            
            {tradesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : tradesError ? (
              <div className="text-center py-8">
                <p className="text-red-600">{tradesError}</p>
              </div>
            ) : trades.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No transactions found for this holding</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {trades.map((trade) => (
                      <tr key={trade.txId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(trade.trdDt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            trade.trdTyp === 'BUY' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {trade.trdTyp}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {trade.qty?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(trade.tradePrice?.amount, trade.tradePrice?.ccy)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency((trade.tradePrice?.amount || 0) * (trade.qty || 0), trade.tradePrice?.ccy)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(trade.fee?.amount, trade.fee?.ccy)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            trade.status === 'CONFIRMED' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {trade.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openDeleteModal(trade, 'trade')}
                            disabled={tradeDeleteLoading[trade.txId]}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {tradeDeleteLoading[trade.txId] ? (
                              <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Income Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Income History
              </h3>
              <button
                onClick={() => setAddIncomeModal(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Income
              </button>
            </div>
            
            {incomesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : incomesError ? (
              <div className="text-center py-8">
                <p className="text-red-600">{incomesError}</p>
              </div>
            ) : incomes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No income records found for this holding</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gross Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {incomes.map((income) => (
                      <tr key={income.txId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(income.paidDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {income.incomeType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(income.grossAmnt?.amount, income.grossAmnt?.ccy)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(income.netAmnt?.amount, income.netAmnt?.ccy)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {income.taxRate}%
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {income.notes || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            income.status === 'CONFIRMED' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {income.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openDeleteModal(income, 'income')}
                            disabled={incomeDeleteLoading[income.txId]}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {incomeDeleteLoading[income.txId] ? (
                              <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
      
      </div>

      {/* Add Income Modal */}
      <AddIncomeModal
        isOpen={addIncomeModal}
        onClose={() => setAddIncomeModal(false)}
        onSubmit={handleAddIncome}
        loading={incomeCreateLoading}
        portfolioId={portfolioId}
        assetId={assetId}
        assetType={holding?.asset?.assetType}
      />

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                Delete {deleteModal.type === 'trade' ? 'Transaction' : 'Income'}
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this {deleteModal.type}?
                </p>
                {deleteModal.item && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-3">
                    <div className="text-left space-y-2">
                      {deleteModal.type === 'trade' ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Type:</span>
                            <span className={`text-sm font-medium ${
                              deleteModal.item.trdTyp === 'BUY' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {deleteModal.item.trdTyp}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Quantity:</span>
                            <span className="text-sm font-medium">{deleteModal.item.qty}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Price:</span>
                            <span className="text-sm font-medium">
                              {formatCurrency(deleteModal.item.tradePrice?.amount, deleteModal.item.tradePrice?.ccy)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Type:</span>
                            <span className="text-sm font-medium text-purple-600">
                              {deleteModal.item.incomeType}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Amount:</span>
                            <span className="text-sm font-medium">
                              {formatCurrency(deleteModal.item.grossAmnt?.amount, deleteModal.item.grossAmnt?.ccy)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Date:</span>
                            <span className="text-sm font-medium">{formatDate(deleteModal.item.paidDate)}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Date:</span>
                        <span className="text-sm font-medium">
                          {formatDate(deleteModal.type === 'trade' ? deleteModal.item.trdDt : deleteModal.item.paidDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-xs text-red-600 mt-3">
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 px-4 py-3">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteItem}
                  disabled={deleteModal.type === 'trade' ? tradeDeleteLoading[deleteModal.item?.txId] : incomeDeleteLoading[deleteModal.item?.txId]}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {(deleteModal.type === 'trade' ? tradeDeleteLoading[deleteModal.item?.txId] : incomeDeleteLoading[deleteModal.item?.txId]) ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoldingDetail;