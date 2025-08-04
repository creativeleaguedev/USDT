import React, { useState } from 'react';
import { X, Send, AlertTriangle, CheckCircle } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

interface CryptoBalance {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  price: number;
  change24h: number;
  address: string;
  icon: string;
  image: string;
  network: string;
  networkColor: string;
}

interface Wallet {
  address: string;
  privateKey: string;
  cryptoBalances: CryptoBalance[];
  totalUsdValue: number;
}

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose, wallet }) => {
  const { withdrawFunds } = useWallet();
  const [amount, setAmount] = useState<number>(0);
  const [toAddress, setToAddress] = useState('');
  const [walletPassword, setWalletPassword] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState<string>('USDT');
  const [withdrawalType, setWithdrawalType] = useState<'main' | 'external'>('external');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Predefined main wallet address
  const mainWalletAddress = '0x742d35Cc6464A2d1C8c5b8e8fE3c1234567890ab';

  const selectedCryptoData = wallet.cryptoBalances.find(c => c.symbol === selectedCrypto);
  const maxAmount = selectedCryptoData ? selectedCryptoData.usdValue : 0;

  const handleWithdraw = async () => {
    setError('');
    
    if (amount <= 0 || amount > maxAmount) {
      setError('Invalid amount');
      return;
    }

    if (withdrawalType === 'external' && !toAddress.trim()) {
      setError('Please enter a destination address');
      return;
    }

    if (!walletPassword.trim()) {
      setError('Please enter your wallet password');
      return;
    }

    setIsProcessing(true);

    const targetAddress = withdrawalType === 'main' ? mainWalletAddress : toAddress;
    const success = await withdrawFunds(amount, targetAddress, walletPassword);

    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        resetModal();
      }, 2000);
    } else {
      setError('Withdrawal failed. Please check your wallet password and try again.');
    }

    setIsProcessing(false);
  };

  const resetModal = () => {
    setAmount(0);
    setToAddress('');
    setWalletPassword('');
    setSelectedCrypto('USDT');
    setWithdrawalType('external');
    setIsProcessing(false);
    setIsSuccess(false);
    setError('');
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-md border border-white/10 rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-white">Withdraw Funds</h2>
            </div>
            <p className="text-green-400 text-sm">✅ Real Blockchain Transactions</p>
          </div>
          {!isProcessing && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="p-4 md:p-6">
          {isSuccess ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Withdrawal Successful!</h3>
              <p className="text-gray-300">Your funds have been sent successfully.</p>
            </div>
          ) : isProcessing ? (
            <div className="text-center py-8">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full animate-spin border-t-purple-400 mx-auto"></div>
                <Send className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Processing Withdrawal</h3>
              <p className="text-gray-300">Please wait while we process your withdrawal...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Crypto Selection */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Select Cryptocurrency & Network
                </label>
                <select
                  value={selectedCrypto}
                  onChange={(e) => setSelectedCrypto(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                >
                  {wallet.cryptoBalances.map((crypto) => (
                    <option key={crypto.symbol} value={crypto.symbol} className="bg-gray-800">
                      {crypto.symbol} ({crypto.network}) - ${crypto.usdValue.toFixed(2)} available
                    </option>
                  ))}
                </select>
                {selectedCryptoData && (
                  <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${selectedCryptoData.networkColor}`}>
                    <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                    {selectedCryptoData.network} Network
                  </div>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Amount (USD Value)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    max={maxAmount}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                    placeholder="Enter amount"
                  />
                  <button
                    onClick={() => setAmount(maxAmount)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
                  >
                    MAX
                  </button>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  Available: ${maxAmount.toFixed(2)} ({selectedCryptoData?.balance.toFixed(selectedCrypto === 'BTC' ? 8 : 4)} {selectedCrypto})
                </p>
              </div>

              {/* Withdrawal Type */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-3">
                  Withdrawal Destination
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      value="main"
                      checked={withdrawalType === 'main'}
                      onChange={() => setWithdrawalType('main')}
                      className="text-cyan-400"
                    />
                    <div>
                      <span className="text-white font-medium">Main Wallet</span>
                      <p className="text-gray-400 text-sm">
                        {mainWalletAddress.slice(0, 10)}...{mainWalletAddress.slice(-8)}
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      value="external"
                      checked={withdrawalType === 'external'}
                      onChange={() => setWithdrawalType('external')}
                      className="text-cyan-400"
                    />
                    <span className="text-white font-medium">External Wallet</span>
                  </label>
                </div>
              </div>

              {/* External Address Input */}
              {withdrawalType === 'external' && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Destination Address ({selectedCryptoData?.network} Network)
                  </label>
                  <input
                    type="text"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                    placeholder="0x..."
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Make sure the address supports {selectedCryptoData?.network} network
                  </p>
                </div>
              )}

              {/* Wallet Password */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Wallet Password
                </label>
                <input
                  type="password"
                  value={walletPassword}
                  onChange={(e) => setWalletPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                  placeholder="Enter wallet password"
                />
                <div className="flex items-center space-x-2 mt-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <p className="text-yellow-400 text-xs">
                    This is the special wallet password you created during signup
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-600/30 text-gray-300 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={amount <= 0 || amount > maxAmount}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Withdraw</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalModal;