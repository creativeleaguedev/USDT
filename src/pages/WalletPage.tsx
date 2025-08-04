import React, { useState } from 'react';
import { Copy, QrCode, Send, Eye, EyeOff, CheckCircle, AlertCircle, RefreshCw, ArrowLeft, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { generateQRCode } from '../utils/walletGenerator';
import WithdrawalModal from '../components/WithdrawalModal';
import DepositModal from '../components/DepositModal';

const WalletPage: React.FC = () => {
  const { wallet, transactions, refreshBalances, isRefreshing } = useWallet();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedPrivateKey, setCopiedPrivateKey] = useState(false);
  const [showAllAssets, setShowAllAssets] = useState(false);
  const [showWalletDetails, setShowWalletDetails] = useState(false);

  const copyToClipboard = async (text: string, type: 'address' | 'privateKey') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'address') {
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
      } else {
        setCopiedPrivateKey(true);
        setTimeout(() => setCopiedPrivateKey(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDeposit = (crypto: string) => {
    setSelectedCrypto(crypto);
    setShowDepositModal(true);
  };

  if (!wallet) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Loading wallet...</p>
      </div>
    );
  }

  const usdtBalance = wallet.cryptoBalances.find(crypto => crypto.symbol === 'USDT');
  const otherAssets = wallet.cryptoBalances.filter(crypto => crypto.symbol !== 'USDT');

  if (showWalletDetails) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setShowWalletDetails(false)}
          className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Wallet</span>
        </button>

        {/* Wallet Security Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Main Wallet Address */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <QrCode className="w-5 h-5" />
              <span>Main Wallet Address</span>
            </h3>
            
            <div className="text-center mb-4">
              <img
                src={generateQRCode(wallet.address)}
                alt="Wallet QR Code"
                className="w-48 h-48 md:w-56 md:h-56 mx-auto mb-4 rounded-lg border border-white/10"
              />
            </div>
            
            <div className="bg-white/5 rounded-lg p-3 mb-4">
              <p className="text-gray-300 text-xs md:text-sm font-mono break-all">{wallet.address}</p>
            </div>
            
            <button
              onClick={() => copyToClipboard(wallet.address, 'address')}
              className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {copiedAddress ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAddress ? 'Copied!' : 'Copy Address'}</span>
            </button>
          </div>

          {/* Private Key */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Private Key</span>
            </h3>
            
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <p className="text-yellow-400 text-sm">Keep your private key secure!</p>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3 mb-4">
              <p className="text-gray-300 text-xs md:text-sm font-mono break-all">
                {showPrivateKey ? wallet.privateKey : '•'.repeat(64)}
              </p>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="w-full bg-gray-600/20 hover:bg-gray-600/30 border border-gray-600/30 text-gray-300 font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showPrivateKey ? 'Hide' : 'Show'} Private Key</span>
              </button>
              
              {showPrivateKey && (
                <button
                  onClick={() => copyToClipboard(wallet.privateKey, 'privateKey')}
                  className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {copiedPrivateKey ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPrivateKey ? 'Copied!' : 'Copy Private Key'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Transaction History</h2>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white/5 rounded-lg p-3 md:p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Send className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold capitalize text-sm md:text-base">{transaction.type}</p>
                        <p className="text-gray-400 text-xs md:text-sm">{transaction.timestamp}</p>
                        {transaction.network && (
                          <p className="text-gray-500 text-xs">{transaction.network} Network</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-sm md:text-base ${
                        transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-gray-400 text-xs md:text-sm">{transaction.currency}</p>
                      {transaction.confirmations && (
                        <p className="text-gray-500 text-xs">{transaction.confirmations} confirmations</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Wallet</h1>
        <button
          onClick={refreshBalances}
          disabled={isRefreshing}
          className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Demo Portfolio Value */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Demo Portfolio Value</h2>
        <p className="text-yellow-400 text-sm font-medium mb-4">⚠️ (Not Real)</p>
        <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          ${wallet.totalUsdValue.toFixed(2)}
        </div>
      </div>

      {/* Deposit / Withdraw Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => handleDeposit('USDT')}
          className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Deposit</span>
        </button>
        <button
          onClick={() => setShowWithdrawalModal(true)}
          disabled={!usdtBalance || usdtBalance.usdValue === 0}
          className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
          <span>Withdraw</span>
        </button>
      </div>

      {/* USDT Balance (Always Shown) */}
      {usdtBalance && (
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img
                src={usdtBalance.image}
                alt={usdtBalance.name}
                className="w-12 h-12 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48/00D9FF/FFFFFF?text=USDT';
                }}
              />
              <div>
                <h3 className="text-white font-semibold text-lg">{usdtBalance.symbol}</h3>
                <p className="text-gray-400 text-sm">{usdtBalance.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {usdtBalance.balance.toFixed(4)} USDT
              </p>
              <p className="text-cyan-400 font-semibold">
                ${usdtBalance.usdValue.toFixed(2)}
              </p>
              <p className="text-gray-400 text-sm">
                ${usdtBalance.price.toFixed(2)} per USDT
              </p>
            </div>
          </div>
          
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${usdtBalance.networkColor}`}>
            <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
            {usdtBalance.network} Network
          </div>
        </div>
      )}

      {/* Show All Assets Button */}
      <button
        onClick={() => setShowAllAssets(!showAllAssets)}
        className="w-full bg-gray-600/20 hover:bg-gray-600/30 border border-gray-600/30 text-gray-300 font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <span>Show All Assets</span>
        {showAllAssets ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {/* Other Assets (Hidden by Default) */}
      {showAllAssets && (
        <div className="space-y-4">
          {otherAssets.map((crypto) => (
            <div
              key={crypto.symbol}
              className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={crypto.image}
                    alt={crypto.name}
                    className="w-12 h-12 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48/00D9FF/FFFFFF?text=' + crypto.symbol;
                    }}
                  />
                  <div>
                    <h3 className="text-white font-semibold">{crypto.symbol}</h3>
                    <p className="text-gray-400 text-sm">{crypto.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">
                    {crypto.balance.toFixed(crypto.symbol === 'BTC' ? 8 : 4)} {crypto.symbol}
                  </p>
                  <p className="text-cyan-400 font-semibold">
                    ${crypto.usdValue.toFixed(2)}
                  </p>
                  <p className="text-gray-400 text-sm">
                    ${crypto.price.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2 mb-3">
                <button
                  onClick={() => handleDeposit(crypto.symbol)}
                  className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 font-semibold py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Deposit</span>
                </button>
                <button
                  onClick={() => setShowWithdrawalModal(true)}
                  disabled={crypto.usdValue === 0}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-semibold py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
              
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${crypto.networkColor}`}>
                <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                {crypto.network}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wallet Details Button */}
      <button
        onClick={() => setShowWalletDetails(true)}
        className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <QrCode className="w-5 h-5" />
        <span>View Wallet Details & QR Code</span>
      </button>

      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        crypto={selectedCrypto}
        wallet={wallet}
      />

      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        wallet={wallet}
      />
    </div>
  );
};

export default WalletPage;