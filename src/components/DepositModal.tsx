import React from 'react';
import { X, QrCode, Copy, CheckCircle, ArrowLeft } from 'lucide-react';
import { generateQRCode } from '../utils/walletGenerator';

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

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  crypto: string;
  wallet: Wallet;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, crypto, wallet }) => {
  const [copiedAddress, setCopiedAddress] = React.useState(false);

  const selectedCrypto = wallet.cryptoBalances.find(c => c.symbol === crypto);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!isOpen || !selectedCrypto) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-md border border-white/10 rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-white">Deposit {selectedCrypto.symbol}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 md:p-6">
          {/* Crypto Info */}
          <div className="text-center mb-6">
            <img
              src={selectedCrypto.image}
              alt={selectedCrypto.name}
              className="w-16 h-16 rounded-full mx-auto mb-4"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64/00D9FF/FFFFFF?text=' + selectedCrypto.symbol;
              }}
            />
            <h3 className="text-xl font-bold text-white mb-2">{selectedCrypto.name}</h3>
            <div className="space-y-2">
              <p className="text-gray-400">Send {selectedCrypto.symbol} to this address</p>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${selectedCrypto.networkColor}`}>
                <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                {selectedCrypto.network} Network
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center mb-6 flex justify-center">
            <img
              src={generateQRCode(selectedCrypto.address)}
              alt={`${selectedCrypto.symbol} QR Code`}
              className="w-48 h-48 md:w-56 md:h-56 rounded-lg border border-white/10"
            />
          </div>

          {/* Address */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              {selectedCrypto.symbol} Address ({selectedCrypto.network})
            </label>
            <div className="bg-white/5 rounded-lg p-3 mb-4">
              <p className="text-gray-300 text-xs md:text-sm font-mono break-all">{selectedCrypto.address}</p>
            </div>
            
            <button
              onClick={() => copyToClipboard(selectedCrypto.address)}
              className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {copiedAddress ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAddress ? 'Copied!' : 'Copy Address'}</span>
            </button>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <h4 className="text-yellow-400 font-semibold mb-2">⚠️ DEMO MODE - Important Notes:</h4>
            <ul className="text-yellow-400 text-xs md:text-sm space-y-1">
              <li>• <strong>THIS IS A DEMO - DO NOT SEND REAL CRYPTOCURRENCY</strong></li>
              <li>• This wallet is for demonstration purposes only</li>
              <li>• Only send {selectedCrypto.symbol} to this address</li>
              <li>• Use {selectedCrypto.network} network only</li>
              <li>• Minimum deposit: 0.001 {selectedCrypto.symbol}</li>
              <li>• Deposits require network confirmations</li>
              <li>• Demo addresses are not connected to real blockchain</li>
            </ul>
          </div>

          {/* Current Balance */}
          <div className="bg-black/40 border border-white/10 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Current Balance:</span>
              <div className="text-right">
                <p className="text-white font-semibold">
                  {selectedCrypto.balance.toFixed(selectedCrypto.symbol === 'BTC' ? 8 : 4)} {selectedCrypto.symbol}
                </p>
                <p className="text-cyan-400 text-sm">${selectedCrypto.usdValue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-600/30 text-gray-300 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => copyToClipboard(selectedCrypto.address)}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {copiedAddress ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAddress ? 'Copied!' : 'Copy Address'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;