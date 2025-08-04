import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { generateWallet } from '../utils/walletGenerator';

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

  // Fetch real crypto prices and balances
  const fetchCryptoData = async (addresses: { [key: string]: string }) => {
    try {
      // Fetch current prices from CoinGecko
      const priceResponse = await fetch(
        '/api/v3/coins/markets?vs_currency=usd&ids=tether,bitcoin,ripple,solana&order=market_cap_desc&per_page=4&page=1&sparkline=false&price_change_percentage=24h'
      );
      const priceData = await priceResponse.json();

      // Ensure priceData is an array before using find method
      if (!Array.isArray(priceData)) {
        throw new Error('API response is not an array');
      }

      // Demo Mode: Simulated balances for demonstration purposes
      const cryptoBalances: CryptoBalance[] = [
        {
          symbol: 'USDT',
          name: 'Tether USD',
          balance: 0, // Demo balance - not real blockchain data
          usdValue: 0,
          price: priceData.find(coin => coin.id === 'tether')?.current_price || 1.00,
          change24h: priceData.find(coin => coin.id === 'tether')?.price_change_percentage_24h || 0,
          address: addresses.USDT,
          icon: '₮',
          image: priceData.find(coin => coin.id === 'tether')?.image || 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
          network: 'Ethereum',
          networkColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        },
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          balance: 0, // Demo balance - not real blockchain data
          usdValue: 0,
          price: priceData.find(coin => coin.id === 'bitcoin')?.current_price || 43000,
          change24h: priceData.find(coin => coin.id === 'bitcoin')?.price_change_percentage_24h || 0,
          address: addresses.BTC,
          icon: '₿',
          image: priceData.find(coin => coin.id === 'bitcoin')?.image || 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
          network: 'Bitcoin',
          networkColor: 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
        },
        {
          symbol: 'XRP',
          name: 'Ripple',
          balance: 0, // Demo balance - not real blockchain data
          usdValue: 0,
          price: priceData.find(coin => coin.id === 'ripple')?.current_price || 0.60,
          change24h: priceData.find(coin => coin.id === 'ripple')?.price_change_percentage_24h || 0,
          address: addresses.XRP,
          icon: '◉',
          image: priceData.find(coin => coin.id === 'ripple')?.image || 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
          network: 'XRP Ledger',
          networkColor: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
        },
        {
          symbol: 'SOL',
          name: 'Solana',
          balance: 0, // Demo balance - not real blockchain data
          usdValue: 0,
          price: priceData.find(coin => coin.id === 'solana')?.current_price || 100,
          change24h: priceData.find(coin => coin.id === 'solana')?.price_change_percentage_24h || 0,
          address: addresses.SOL,
          icon: '◎',
          image: priceData.find(coin => coin.id === 'solana')?.image || 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
          network: 'Solana',
          networkColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
        }
      ];

      // Demo Mode: Simulate blockchain balance fetching for demonstration
      // This is NOT connected to real blockchain networks
      for (const crypto of cryptoBalances) {
        try {
          // Simulate demo blockchain API calls with realistic delays
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Demo Mode: All balances are simulated for demonstration purposes
          // These are NOT real cryptocurrency balances
          switch (crypto.symbol) {
            case 'USDT':
              crypto.balance = 0; // Demo USDT balance - not real
              break;
            case 'BTC':
              crypto.balance = 0; // Demo BTC balance - not real
              break;
            case 'XRP':
              crypto.balance = 0; // Demo XRP balance - not real
              break;
            case 'SOL':
              crypto.balance = 0; // Demo SOL balance - not real
              break;
          }
        } catch (error) {
          console.error(`Demo: Failed to simulate ${crypto.symbol} balance:`, error);
          crypto.balance = 0; // Default to 0 on error
        }
      }

      // Calculate USD values
      cryptoBalances.forEach(crypto => {
        crypto.usdValue = crypto.balance * crypto.price;
      });

      return cryptoBalances;
    } catch (error) {
      console.error('Failed to fetch crypto data:', error);
      // Return fallback data
      return [
        {
          symbol: 'USDT',
          name: 'Tether USD',
          balance: 1000,
          usdValue: 1000,
          price: 1.00,
          change24h: 0,
          address: addresses.USDT,
          icon: '₮',
          image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
          network: 'Ethereum',
          networkColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        },
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          balance: 0,
          usdValue: 0,
          price: 43000,
          change24h: 0,
          address: addresses.BTC,
          icon: '₿',
          image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
          network: 'Bitcoin',
          networkColor: 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
        },
        {
          symbol: 'XRP',
          name: 'Ripple',
          balance: 0,
          usdValue: 0,
          price: 0.60,
          change24h: 0,
          address: addresses.XRP,
          icon: '◉',
          image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
          network: 'XRP Ledger',
          networkColor: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
        },
        {
          symbol: 'SOL',
          name: 'Solana',
          balance: 0,
          usdValue: 0,
          price: 100,
          change24h: 0,
          address: addresses.SOL,
          icon: '◎',
          image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
          network: 'Solana',
          networkColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
        }
      ];
    }
  };

  const refreshBalances = async () => {
    if (!wallet || !user) return;
    
    setIsRefreshing(true);
    try {
      const addresses = {
        USDT: wallet.address,
        BTC: generateWallet().address,
        XRP: generateWallet().address,
        SOL: generateWallet().address
      };

      const cryptoBalances = await fetchCryptoData(addresses);
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
        setWallet(JSON.parse(storedWallet));
      } else {
        // Generate a deterministic wallet based on user email for persistence
        const deterministicSeed = user.email + 'usdtbanc_seed';
        const hash = deterministicSeed.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        
        // Generate deterministic addresses
        const baseAddress = '0x' + Math.abs(hash).toString(16).padStart(40, '0').slice(0, 40);
        const privateKey = Math.abs(hash * 2).toString(16).padStart(64, '0').slice(0, 64);
        
        const addresses = {
          USDT: baseAddress,
          BTC: '1' + Math.abs(hash * 3).toString(16).padStart(33, '0').slice(0, 33),
          XRP: 'r' + Math.abs(hash * 4).toString(16).padStart(33, '0').slice(0, 33),
          SOL: Math.abs(hash * 5).toString(16).padStart(44, '0').slice(0, 44)
        };

        const walletData = {
          address: baseAddress,
          privateKey: privateKey,
          cryptoBalances: [
            {
              symbol: 'USDT',
              name: 'Tether USD',
              balance: 1000,
              usdValue: 1000,
              price: 1.00,
              change24h: 0,
              address: addresses.USDT,
              icon: '₮',
              image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
              network: 'Ethereum',
              networkColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            },
            {
              symbol: 'BTC',
              name: 'Bitcoin',
              balance: 0,
              usdValue: 0,
              price: 43000,
              change24h: 0,
              address: addresses.BTC,
              icon: '₿',
              image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
              network: 'Bitcoin',
              networkColor: 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
            },
            {
              symbol: 'XRP',
              name: 'Ripple',
              balance: 0,
              usdValue: 0,
              price: 0.60,
              change24h: 0,
              address: addresses.XRP,
              icon: '◉',
              image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
              network: 'XRP Ledger',
              networkColor: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            },
            {
              symbol: 'SOL',
              name: 'Solana',
              balance: 0,
              usdValue: 0,
              price: 100,
              change24h: 0,
              address: addresses.SOL,
              icon: '◎',
              image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
              network: 'Solana',
              networkColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            }
          ],
          totalUsdValue: 1000
        };
        setWallet(walletData);
        localStorage.setItem(`usdtbanc_wallet_${user.email}`, JSON.stringify(walletData));
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
      refreshBalances(); // Initial load
      const interval = setInterval(refreshBalances, 30000); // Every 30 seconds to avoid rate limiting
      return () => clearInterval(interval);
    }
  }, [wallet?.address, user]);

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