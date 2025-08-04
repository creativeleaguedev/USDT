import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { generateCryptoWallet, restoreWalletFromMnemonic, getAllBalances, WalletKeys, WalletAddresses } from '../utils/cryptoWallet';

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
  mnemonic: string;
  addresses: WalletAddresses;
  cryptoBalances: CryptoBalance[];
  totalUsdValue: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'purchase';
  amount: number;
  currency: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  toAddress?: string;
  txHash?: string;
  confirmations?: number;
  network?: string;
}

interface WalletContextType {
  wallet: Wallet | null;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  updateBalance: (amount: number, currency?: string) => void;
  withdrawFunds: (amount: number, toAddress: string, walletPassword: string) => Promise<boolean>;
  refreshBalances: () => Promise<void>;
  isRefreshing: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshBalances = async () => {
    if (!wallet || !user) return;
    
    setIsRefreshing(true);
    try {
      const cryptoBalances = await getAllBalances(wallet.addresses);
      const totalUsdValue = cryptoBalances.reduce((sum, crypto) => sum + crypto.usdValue, 0);

      const updatedWallet = {
        ...wallet,
        cryptoBalances,
        totalUsdValue
      };

      setWallet(updatedWallet);
      localStorage.setItem(`usdtbanc_wallet_${user.email}`, JSON.stringify(updatedWallet));
    } catch (error) {
      console.error('Failed to refresh balances:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && !wallet) {
      // Generate or retrieve wallet for user  
      const storedWallet = localStorage.getItem(`usdtbanc_wallet_${user.email}`);
      if (storedWallet) {
        const parsedWallet = JSON.parse(storedWallet);
        // Check if it's an old wallet format and needs migration
        if (!parsedWallet.mnemonic || !parsedWallet.addresses) {
          // Generate new wallet with mnemonic
          generateCryptoWallet().then(walletKeys => {
            const newWallet = {
              address: walletKeys.addresses.ETH, // Use ETH address as main address
              privateKey: walletKeys.privateKeys.ETH,
              mnemonic: walletKeys.mnemonic,
              addresses: walletKeys.addresses,
              cryptoBalances: [],
              totalUsdValue: 0
            };
            setWallet(newWallet);
            localStorage.setItem(`usdtbanc_wallet_${user.email}`, JSON.stringify(newWallet));
          });
        } else {
          setWallet(parsedWallet);
        }
      } else {
        // Generate new wallet with real crypto addresses
        generateCryptoWallet().then(walletKeys => {
          const newWallet = {
            address: walletKeys.addresses.ETH, // Use ETH address as main address
            privateKey: walletKeys.privateKeys.ETH,
            mnemonic: walletKeys.mnemonic,
            addresses: walletKeys.addresses,
            cryptoBalances: [],
            totalUsdValue: 0
          };
          setWallet(newWallet);
          localStorage.setItem(`usdtbanc_wallet_${user.email}`, JSON.stringify(newWallet));
        });
      }

      // Load transactions
      const storedTransactions = localStorage.getItem(`usdtbanc_transactions_${user.email}`);
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
    }
  }, [user, wallet]);

  // Auto-refresh balances every minute
  useEffect(() => {
    if (wallet && user) {
      // Initial load with delay to allow wallet to be fully set
      setTimeout(() => {
        refreshBalances();
      }, 1000);
      
      // Refresh every 2 minutes to avoid rate limiting
      const interval = setInterval(refreshBalances, 120000);
      return () => clearInterval(interval);
    }
  }, [wallet?.addresses, user]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    if (!user) return;

    const newTransaction: Transaction = {
      ...transaction,
      id: 'tx_' + Date.now(),
      timestamp: new Date().toISOString()
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem(`usdtbanc_transactions_${user.email}`, JSON.stringify(updatedTransactions));
  };

  const updateBalance = (amount: number, currency: string = 'USDT') => {
    if (!wallet || !user) return;

    const updatedCryptoBalances = wallet.cryptoBalances.map(crypto => {
      if (crypto.symbol === currency) {
        // For purchases, amount is in USD, so convert to crypto amount
        const cryptoAmount = amount / crypto.price;
        const newBalance = crypto.balance + cryptoAmount;
        return {
          ...crypto,
          balance: Math.max(0, newBalance),
          usdValue: Math.max(0, newBalance * crypto.price)
        };
      }
      return crypto;
    });

    const totalUsdValue = updatedCryptoBalances.reduce((sum, crypto) => sum + crypto.usdValue, 0);

    const updatedWallet = {
      ...wallet,
      cryptoBalances: updatedCryptoBalances,
      totalUsdValue
    };
    setWallet(updatedWallet);
    localStorage.setItem(`usdtbanc_wallet_${user.email}`, JSON.stringify(updatedWallet));
  };

  const withdrawFunds = async (amount: number, toAddress: string, walletPassword: string): Promise<boolean> => {
    if (!wallet || !user) return false;

    try {
      // Verify wallet password
      const storedWalletPassword = localStorage.getItem('usdtbanc_wallet_password');
      if (storedWalletPassword !== walletPassword) {
        return false;
      }

      // Check sufficient balance
      const usdtBalance = wallet.cryptoBalances.find(crypto => crypto.symbol === 'USDT');
      if (!usdtBalance || usdtBalance.usdValue < amount) {
        return false;
      }

      // Simulate withdrawal processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update balance
      updateBalance(-amount);

      // Add transaction
      addTransaction({
        type: 'withdrawal',
        amount: -amount,
        currency: 'USDT',
        status: 'completed',
        toAddress,
        txHash: 'tx_' + Math.random().toString(36).substr(2, 9),
        confirmations: 12,
        network: 'Ethereum'
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <WalletContext.Provider 
      value={{
        wallet,
        transactions,
        addTransaction,
        updateBalance,
        withdrawFunds,
        refreshBalances,
        isRefreshing
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};