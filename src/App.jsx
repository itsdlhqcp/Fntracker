import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HoldingDetail from './pages/HoldingDetail'; 
import { AuthProvider } from './contexts/AuthContext';
import AssetLogoPage from './pages/AssetLogoPage';
import './App.css';


const OAuthCallback = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-b-2 border-blue-600 rounded-full animate-spin mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Processing Authentication...</h2>
        <p className="mt-2 text-gray-600">Please wait while we complete your sign-in.</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* OAuth callback route */}
          <Route path="/auth/google/callback" element={<OAuthCallback />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/logox" element={
            <ProtectedRoute>
              <AssetLogoPage />
            </ProtectedRoute>
          } />
          
          <Route path="/portfolio/:portfolioId/holding/:assetId" element={
            <ProtectedRoute>
              <HoldingDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;