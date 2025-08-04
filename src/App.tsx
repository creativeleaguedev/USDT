import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';
import AuthWrapper from './components/AuthWrapper';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import WalletPage from './pages/WalletPage';
import CryptoIndexPage from './pages/CryptoIndexPage';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'wallet' | 'crypto'>('home');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'wallet':
        return <WalletPage />;
      case 'crypto':
        return <CryptoIndexPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <AuthProvider>
      <WalletProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
          <AuthWrapper>
            <div className="flex flex-col min-h-screen">
              <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
              <main className="flex-1 container mx-auto px-4 py-8">
                {renderCurrentPage()}
              </main>
            </div>
          </AuthWrapper>
        </div>
      </WalletProvider>
    </AuthProvider>
  );
}

export default App;