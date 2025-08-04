import React, { useState } from 'react';
import { X, CreditCard, Shield, CheckCircle } from 'lucide-react';

interface CryptoOption {
  symbol: string;
  name: string;
  price: number;
  icon: string;
}

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete: (amount: number, crypto: string) => void;
  cryptoOptions: CryptoOption[];
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ 
  isOpen, 
  onClose, 
  onPurchaseComplete, 
  cryptoOptions 
}) => {
  const [step, setStep] = useState<'select' | 'payment' | 'processing' | 'success'>('select');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption | null>(null);
  const [usdAmount, setUsdAmount] = useState<number>(100);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const handleCryptoSelect = (crypto: CryptoOption) => {
    setSelectedCrypto(crypto);
    setStep('payment');
  };

  const handlePayment = async () => {
    setStep('processing');
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (selectedCrypto) {
      onPurchaseComplete(usdAmount, selectedCrypto.symbol);
    }
    
    setStep('success');
    
    // Auto close after success
    setTimeout(() => {
      onClose();
      resetModal();
    }, 2000);
  };

  const resetModal = () => {
    setStep('select');
    setSelectedCrypto(null);
    setUsdAmount(100);
    setPaymentData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: ''
    });
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-md border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">
            {step === 'select' && 'Select Cryptocurrency'}
            {step === 'payment' && 'Payment Details'}
            {step === 'processing' && 'Processing Payment'}
            {step === 'success' && 'Purchase Successful'}
          </h2>
          {step !== 'processing' && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Step 1: Select Crypto */}
          {step === 'select' && (
            <div className="space-y-4">
              <p className="text-gray-300 mb-6">Choose the cryptocurrency you want to purchase:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cryptoOptions.map((crypto) => (
                  <button
                    key={crypto.symbol}
                    onClick={() => handleCryptoSelect(crypto)}
                    className="bg-black/40 border border-white/10 rounded-xl p-4 hover:border-cyan-500/30 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-white">{crypto.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{crypto.symbol}</h3>
                        <p className="text-gray-400 text-sm">{crypto.name}</p>
                        <p className="text-cyan-400 font-semibold">${crypto.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 'payment' && selectedCrypto && (
            <div className="space-y-6">
              {/* Purchase Summary */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">You're buying:</span>
                  <span className="text-white font-semibold">{selectedCrypto.symbol}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">USD Amount:</span>
                  <input
                    type="number"
                    value={usdAmount}
                    onChange={(e) => setUsdAmount(Number(e.target.value))}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white text-right w-24"
                    min="10"
                    max="10000"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">You'll receive:</span>
                  <span className="text-cyan-400 font-semibold">
                    {(usdAmount / selectedCrypto.price).toFixed(6)} {selectedCrypto.symbol}
                  </span>
                </div>
              </div>

              {/* Payment Form */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Payment Information</span>
                </h3>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={paymentData.expiryDate}
                      onChange={(e) => setPaymentData({ ...paymentData, expiryDate: e.target.value })}
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                      placeholder="123"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={paymentData.cardName}
                    onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center space-x-2 text-gray-300 text-sm">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>Your payment information is encrypted and secure</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  Complete Purchase
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="relative mb-8">
                <div className="w-20 h-20 border-4 border-cyan-500/20 rounded-full animate-spin border-t-cyan-400 mx-auto"></div>
                <CreditCard className="w-8 h-8 text-cyan-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Processing Your Purchase</h3>
              <p className="text-gray-300">Please wait while we process your payment...</p>
              <div className="mt-8 flex justify-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && selectedCrypto && (
            <div className="text-center py-12">
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Purchase Successful!</h3>
              <p className="text-gray-300 mb-6">
                You've successfully purchased {(usdAmount / selectedCrypto.price).toFixed(6)} {selectedCrypto.symbol}
              </p>
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 text-sm">
                  Cryptocurrency has been deposited to your wallet
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;