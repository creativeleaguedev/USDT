import React, { useState } from 'react';
import { CreditCard, Shield, Zap, ArrowRight } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import PurchaseModal from '../components/PurchaseModal';

const HomePage: React.FC = () => {
  const { wallet, updateBalance, addTransaction } = useWallet();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const cryptoOptions = [
    { symbol: 'USDT', name: 'Tether USD', price: wallet?.cryptoBalances.find(c => c.symbol === 'USDT')?.price || 1.00, icon: '₮' },
    { symbol: 'BTC', name: 'Bitcoin', price: wallet?.cryptoBalances.find(c => c.symbol === 'BTC')?.price || 43250.00, icon: '₿' },
    { symbol: 'XRP', name: 'Ripple', price: wallet?.cryptoBalances.find(c => c.symbol === 'XRP')?.price || 0.60, icon: '◉' },
    { symbol: 'SOL', name: 'Solana', price: wallet?.cryptoBalances.find(c => c.symbol === 'SOL')?.price || 100.00, icon: '◎' },
  ];

  const handlePurchaseComplete = (amount: number, crypto: string) => {
    // Update the wallet balance with the purchased amount
    updateBalance(amount, crypto);
    
    // Add transaction record
    addTransaction({
      type: 'purchase',
      amount: amount,
      currency: crypto,
      status: 'completed'
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6">
          Buy Crypto Instantly
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Purchase cryptocurrency with your debit or credit card and receive it directly in your wallet within seconds.
        </p>
        
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-green-400" />
            <span className="text-gray-300">Bank-Grade Security</span>
          </div>
          <div className="flex items-center space-x-3">
            <Zap className="w-6 h-6 text-yellow-400" />
            <span className="text-gray-300">Instant Processing</span>
          </div>
          <div className="flex items-center space-x-3">
            <CreditCard className="w-6 h-6 text-blue-400" />
            <span className="text-gray-300">All Cards Accepted</span>
          </div>
        </div>
      </div>

      {/* Wallet Balance Card */}
      {wallet && (
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Demo Balance</h3>
              <p className="text-yellow-400 text-xs mb-2">⚠️ Demo Mode - Not Real Cryptocurrency</p>
              <p className="text-3xl font-bold text-cyan-400">${(wallet.totalUsdValue || 0).toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Demo Wallet Address</p>
              <p className="text-white font-mono text-sm">
                {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Crypto Purchase Options */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cryptoOptions.map((crypto) => (
          <div
            key={crypto.symbol}
            className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300 transform hover:scale-105 cursor-pointer group"
            onClick={() => setShowPurchaseModal(true)}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-cyan-500/25 transition-all duration-300">
                <span className="text-2xl font-bold text-white">{crypto.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{crypto.symbol}</h3>
              <p className="text-gray-400 text-sm mb-4">{crypto.name}</p>
              <p className="text-2xl font-bold text-cyan-400 mb-4">
                ${crypto.price.toLocaleString()}
              </p>
              <button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span>Buy Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-white text-center mb-8">Why Choose USDT BANC?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Secure Trading</h3>
            <p className="text-gray-400">Advanced encryption and multi-layer security protocols protect your assets.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
            <p className="text-gray-400">Instant purchases and withdrawals with real-time processing.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Easy Payments</h3>
            <p className="text-gray-400">Use any Visa, Mastercard, or major debit/credit card.</p>
          </div>
        </div>
      </div>

      <PurchaseModal 
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchaseComplete={handlePurchaseComplete}
        cryptoOptions={cryptoOptions}
      />
    </div>
  );
};

export default HomePage;