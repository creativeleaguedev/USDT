import React from 'react';
import { X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-md border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Terms & Conditions</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4 text-gray-300">
            <h3 className="text-lg font-semibold text-white">1. Acceptance of Terms</h3>
            <p>By using USDT BANC, you agree to be bound by these Terms and Conditions.</p>

            <h3 className="text-lg font-semibold text-white">2. Service Description</h3>
            <p>USDT BANC provides cryptocurrency trading, wallet services, and market data to registered users.</p>

            <h3 className="text-lg font-semibold text-white">3. User Responsibilities</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for all activities under your account</li>
              <li>You must comply with all applicable laws and regulations</li>
            </ul>

            <h3 className="text-lg font-semibold text-white">4. Security</h3>
            <p>We implement industry-standard security measures, but you are responsible for keeping your private keys and passwords secure.</p>

            <h3 className="text-lg font-semibold text-white">5. Risk Disclosure</h3>
            <p>Cryptocurrency trading involves substantial risk of loss. Past performance does not guarantee future results.</p>

            <h3 className="text-lg font-semibold text-white">6. Privacy</h3>
            <p>We protect your personal information in accordance with our Privacy Policy.</p>

            <h3 className="text-lg font-semibold text-white">7. Limitation of Liability</h3>
            <p>USDT BANC shall not be liable for any indirect, incidental, or consequential damages.</p>

            <h3 className="text-lg font-semibold text-white">8. Modifications</h3>
            <p>We reserve the right to modify these terms at any time with notice to users.</p>
          </div>
        </div>

        <div className="p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;