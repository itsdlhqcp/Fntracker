import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import PortfolioCard from '../components/portfolio/PortfolioCard';
import PortfolioModal from '../components/models/portfolio/PortfolioModal';
import TradeModal from '../components/models/portfolio/TradeModal';
import HoldingsTable from '../components/HoldingsTable';
import { usePortfolios } from '../hooks/usePortfolios';
import { useHoldings } from '../hooks/useHoldings';
import { useTrades } from '../hooks/useTrades';

function Dashboard() {
  const { idToken } = useAuth();
  const {
    portfolios,
    loading,
    error,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    clearError
  } = usePortfolios();

  const {
    holdings,
    loading: holdingsLoading,
    error: holdingsError,
    fetchHoldings,
    clearHoldings
  } = useHoldings();

  const {
    createTrade,
    deleteTradesByAsset,
    loading: tradeLoading,
    error: tradeError
  } = useTrades();

  const [modalState, setModalState] = useState({
    isOpen: false,
    portfolio: null,
    isLoading: false
  });

  // Add Trade Modal State
  const [tradeModalState, setTradeModalState] = useState({
    isOpen: false,
    portfolio: null,
    isLoading: false
  });

  const [deletingPortfolioId, setDeletingPortfolioId] = useState(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  
  // Add delete confirmation state
  const [deleteConfirmState, setDeleteConfirmState] = useState({
    isOpen: false,
    portfolio: null,
    isDeleting: false
  });

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const carouselRef = useRef(null);

  // Calculate cards per view based on screen size
  useEffect(() => {
    const updateCardsPerView = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setCardsPerView(3); // Large screen
      } else if (width >= 768) {
        setCardsPerView(2); // Medium screen
      } else {
        setCardsPerView(1); // Small screen
      }
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  // Reset current index when cards per view changes or portfolios change
  useEffect(() => {
    setCurrentIndex(0);
  }, [cardsPerView, portfolios.length]);

  const maxIndex = Math.max(0, Math.ceil(portfolios.length / cardsPerView) - 1);
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < maxIndex;

  const scrollLeft = () => {
    if (canScrollLeft) {
      setCurrentIndex(prev => Math.max(0, prev - 1));
    }
  };

  const scrollRight = () => {
    if (canScrollRight) {
      setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
    }
  };

  const handleCreatePortfolio = () => {
    setModalState({
      isOpen: true,
      portfolio: null,
      isLoading: false
    });
  };

  const handleEditPortfolio = (portfolio) => {
    setModalState({
      isOpen: true,
      portfolio,
      isLoading: false
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      portfolio: null,
      isLoading: false
    });
  };

  const handleSavePortfolio = async (portfolioData) => {
    try {
      setModalState(prev => ({ ...prev, isLoading: true }));
      
      if (modalState.portfolio) {
        await updatePortfolio(modalState.portfolio.pid, portfolioData);
      } else {
        await createPortfolio(portfolioData);
      }
      
      handleCloseModal();
      
    } catch (err) {
      console.error('Failed to save portfolio:', err);
    } finally {
      setModalState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Handle portfolio selection
  const handleSelectPortfolio = (portfolio) => {
    setSelectedPortfolio(portfolio);
    fetchHoldings(portfolio.pid, idToken);
  };

  // Handle delete request (show confirmation)
  const handleDeleteRequest = (portfolio) => {
    setDeleteConfirmState({
      isOpen: true,
      portfolio,
      isDeleting: false
    });
  };

  // Handle confirmed delete
  const handleConfirmDelete = async () => {
    try {
      setDeleteConfirmState(prev => ({ ...prev, isDeleting: true }));
      await deletePortfolio(deleteConfirmState.portfolio.pid);
      
      // Clear holdings if deleting selected portfolio
      if (selectedPortfolio && selectedPortfolio.pid === deleteConfirmState.portfolio.pid) {
        setSelectedPortfolio(null);
        clearHoldings();
      }
      
      setDeleteConfirmState({
        isOpen: false,
        portfolio: null,
        isDeleting: false
      });
    } catch (err) {
      console.error('Failed to delete portfolio:', err);
      setDeleteConfirmState(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirmState({
      isOpen: false,
      portfolio: null,
      isDeleting: false
    });
  };

  // Handle add trade button click 
  const handleAddTrade = () => {
    if (!selectedPortfolio) {
      console.error('No portfolio selected');
      return;
    }

    setTradeModalState({
      isOpen: true,
      portfolio: selectedPortfolio,
      isLoading: false
    });
  };

  // Handle trade modal close
  const handleCloseTradeModal = () => {
    setTradeModalState({
      isOpen: false,
      portfolio: null,
      isLoading: false
    });
  };

const handleAddTradeSubmit = async (tradeData) => {
  try {
    setTradeModalState(prev => ({ ...prev, isLoading: true }));
    
    await createTrade(tradeData, selectedPortfolio);
    
    if (selectedPortfolio) {
      await fetchHoldings(selectedPortfolio.pid, idToken);
    }
    
    handleCloseTradeModal();
    
  } catch (error) {
    console.error('Failed to add trade:', error);
  } finally {
    setTradeModalState(prev => ({ ...prev, isLoading: false }));
  }
};

const handleDeleteTrade = async (assetId, portfolioId) => {
  try {
    await deleteTradesByAsset(assetId, portfolioId);
    
    // Refresh holdings after deleting trades
    if (selectedPortfolio && selectedPortfolio.pid === portfolioId) {
      await fetchHoldings(portfolioId, idToken);
    }
    
    // Optionally show success message
    console.log('Successfully deleted all trades for asset');
    
  } catch (error) {
    console.error('Failed to delete trades:', error);
    // Optionally show error message to user
  }
};

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 border-b-2 border-blue-600 rounded-full animate-spin mx-auto"></div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">Loading Portfolios...</h2>
              <p className="mt-2 text-gray-600">Please wait while we fetch your portfolios.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCreatePortfolio={handleCreatePortfolio} />

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start justify-between">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
              <button
                onClick={clearError}
                className="flex-shrink-0 ml-4 text-red-400 hover:text-red-600 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Portfolio Content */}
        {portfolios.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a1 1 0 011-1h1a1 1 0 011 1v1m-4 0h4m0 0v1a1 1 0 001 1h1a1 1 0 001-1V7a1 1 0 00-1-1h-1a1 1 0 00-1-1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Portfolios Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by creating your first investment portfolio. You can track different markets and currencies separately.
            </p>
            <button
              onClick={handleCreatePortfolio}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-lg"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Your First Portfolio
            </button>
          </div>
        ) : (
          // Portfolio Carousel
          <div className="relative mb-8">
            {/* Carousel Container */}
            <div className="overflow-hidden" ref={carouselRef}>
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(-${(currentIndex * 100)}%)`,
                }}
              >
                {portfolios.map((portfolio) => (
                  <div 
                    key={portfolio.pid}
                    className="flex-shrink-0 px-3"
                    style={{ width: `${100 / cardsPerView}%` }}
                  >
                    <PortfolioCard
                      portfolio={portfolio}
                      onEdit={handleEditPortfolio}
                      onDelete={handleDeleteRequest}
                      onSelect={handleSelectPortfolio}
                      isSelected={selectedPortfolio?.pid === portfolio.pid}
                      isDeleting={deleteConfirmState.isDeleting && deleteConfirmState.portfolio?.pid === portfolio.pid}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            {portfolios.length > cardsPerView && (
              <>
                {/* Left Arrow */}
                <button
                  onClick={scrollLeft}
                  disabled={!canScrollLeft}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 ${
                    canScrollLeft 
                      ? 'hover:bg-gray-50 hover:shadow-xl text-gray-700 hover:text-gray-900' 
                      : 'text-gray-300 cursor-not-allowed opacity-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Right Arrow */}
                <button
                  onClick={scrollRight}
                  disabled={!canScrollRight}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 ${
                    canScrollRight 
                      ? 'hover:bg-gray-50 hover:shadow-xl text-gray-700 hover:text-gray-900' 
                      : 'text-gray-300 cursor-not-allowed opacity-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Pagination Dots */}
            {portfolios.length > cardsPerView && (
              <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: maxIndex + 1 }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      index === currentIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Holdings Table */}
        <HoldingsTable
          holdings={holdings}
          loading={holdingsLoading}
          error={holdingsError}
          portfolioId={selectedPortfolio?.pid}
          onAddTrade={handleAddTrade}
          onDeleteTrade={handleDeleteTrade}
        />
      </main>

      {/* Portfolio Modal */}
      <PortfolioModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSave={handleSavePortfolio}
        portfolio={modalState.portfolio}
        isLoading={modalState.isLoading}
      />

      {/* Trade Modal */}
      <TradeModal
        isOpen={tradeModalState.isOpen}
        onClose={handleCloseTradeModal}
        onAddTrade={handleAddTradeSubmit}
        portfolio={tradeModalState.portfolio}
        isLoading={tradeModalState.isLoading}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={!deleteConfirmState.isDeleting ? handleCancelDelete : undefined}></div>
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl mx-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Delete Portfolio
            </h3>
            
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete "{deleteConfirmState.portfolio?.nm}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-center space-x-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleteConfirmState.isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              
              <button
                onClick={handleConfirmDelete}
                disabled={deleteConfirmState.isDeleting}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteConfirmState.isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Portfolio'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default Dashboard;