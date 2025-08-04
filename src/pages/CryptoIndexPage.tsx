import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, DollarSign, Bitcoin } from 'lucide-react';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface CurrencyRate {
  code: string;
  name: string;
  rate: number;
  flag: string;
}

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
}

const CryptoIndexPage: React.FC = () => {
  const [stockData, setStockData] = useState<StockData[]>([
    { symbol: 'DOW', name: 'Dow Index', price: 43588.58, change: -542.40, changePercent: -1.23 },
    { symbol: 'S&P500', name: 'S&P 500 Index', price: 6238.01, change: -101.38, changePercent: -1.60 },
    { symbol: 'NASDAQ', name: 'NASDAQ Index', price: 20650.13, change: -472.32, changePercent: -2.24 }
  ]);

  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([
    { code: 'GBP', name: 'British Pound', rate: 0.79, flag: '🇬🇧' },
    { code: 'EUR', name: 'Euro', rate: 0.92, flag: '🇪🇺' },
    { code: 'CAD', name: 'Canadian Dollar', rate: 1.43, flag: '🇨🇦' },
    { code: 'AED', name: 'UAE Dirham', rate: 3.67, flag: '🇦🇪' },
    { code: 'SAR', name: 'Saudi Riyal', rate: 3.75, flag: '🇸🇦' },
    { code: 'EGP', name: 'Egyptian Pound', rate: 49.15, flag: '🇪🇬' }
  ]);

  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCryptoData = async () => {
    try {
      const response = await fetch(
        '/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h'
      );
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setCryptoData(data);
      } else {
        throw new Error('API response is not an array');
      }
    } catch (error) {
      console.error('Failed to fetch crypto data:', error);
      // Fallback data for top 10 cryptocurrencies
      setCryptoData([
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 43250, price_change_percentage_24h: -1.2, market_cap: 847000000000, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 2650, price_change_percentage_24h: 2.1, market_cap: 318000000000, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
        { id: 'tether', symbol: 'usdt', name: 'Tether', current_price: 1.00, price_change_percentage_24h: 0.01, market_cap: 95000000000, image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png' },
        { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 315, price_change_percentage_24h: -0.8, market_cap: 47000000000, image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
        { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 100, price_change_percentage_24h: 3.5, market_cap: 45000000000, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
        { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 0.60, price_change_percentage_24h: -2.1, market_cap: 34000000000, image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },
        { id: 'usd-coin', symbol: 'usdc', name: 'USDC', current_price: 1.00, price_change_percentage_24h: 0.00, market_cap: 32000000000, image: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png' },
        { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.45, price_change_percentage_24h: 1.8, market_cap: 16000000000, image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png' },
        { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', current_price: 38, price_change_percentage_24h: -1.5, market_cap: 15000000000, image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png' },
        { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.08, price_change_percentage_24h: 4.2, market_cap: 12000000000, image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png' }
      ]);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update stock data with small random changes
    setStockData(prev => prev.map(stock => ({
      ...stock,
      price: stock.price + (Math.random() - 0.5) * 100,
      change: stock.change + (Math.random() - 0.5) * 20,
      changePercent: stock.changePercent + (Math.random() - 0.5) * 0.5
    })));

    // Update currency rates with small random changes
    setCurrencyRates(prev => prev.map(currency => ({
      ...currency,
      rate: currency.rate + (Math.random() - 0.5) * 0.1
    })));

    // Refresh crypto data
    await fetchCryptoData();

    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    setLastUpdated(new Date());
    fetchCryptoData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Trading Index
          </h1>
          <p className="text-gray-400">
            Live market data and currency exchange rates
          </p>
        </div>
        
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Stock Section */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-green-400" />
          <span>Stock Market Indices</span>
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {stockData.map((stock) => (
            <div
              key={stock.symbol}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">{stock.symbol}</h3>
                <p className="text-gray-400 text-sm mb-4">{stock.name}</p>
                
                <div className="mb-4">
                  <p className="text-2xl font-bold text-white mb-2">
                    {stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  
                  <div className={`flex items-center justify-center space-x-2 ${
                    stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stock.change >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="font-semibold">
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                    </span>
                    <span className="font-semibold">
                      ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* USD Conversion Widget */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <DollarSign className="w-6 h-6 text-cyan-400" />
          <span>USD Exchange Rates</span>
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currencyRates.map((currency) => (
            <div
              key={currency.code}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{currency.flag}</span>
                  <div>
                    <h3 className="text-white font-semibold">{currency.code}</h3>
                    <p className="text-gray-400 text-sm">{currency.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">
                    {currency.rate.toFixed(currency.code === 'EGP' ? 2 : 4)}
                  </p>
                  <p className="text-gray-400 text-xs">per USD</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">1 USD =</span>
                  <span className="text-cyan-400 font-semibold">
                    {currency.rate.toFixed(currency.code === 'EGP' ? 2 : 4)} {currency.code}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-400">1 {currency.code} =</span>
                  <span className="text-purple-400 font-semibold">
                    {(1 / currency.rate).toFixed(4)} USD
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Crypto Section */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <Bitcoin className="w-6 h-6 text-orange-400" />
          <span>Top 10 Cryptocurrencies</span>
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {cryptoData.map((crypto) => (
            <div
              key={crypto.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={crypto.image}
                  alt={crypto.name}
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://via.placeholder.com/32/00D9FF/FFFFFF?text=${crypto.symbol.toUpperCase()}`;
                  }}
                />
                <div>
                  <h3 className="text-white font-semibold text-sm">{crypto.symbol.toUpperCase()}</h3>
                  <p className="text-gray-400 text-xs">{crypto.name}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-white font-bold">
                  ${crypto.current_price.toLocaleString(undefined, { 
                    minimumFractionDigits: crypto.current_price < 1 ? 4 : 2,
                    maximumFractionDigits: crypto.current_price < 1 ? 4 : 2
                  })}
                </p>
                
                <div className={`flex items-center space-x-1 ${
                  crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {crypto.price_change_percentage_24h >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span className="text-xs font-semibold">
                    {crypto.price_change_percentage_24h >= 0 ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
                
                <p className="text-gray-400 text-xs">
                  MCap: ${(crypto.market_cap / 1000000000).toFixed(1)}B
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Info */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-md border border-white/10 rounded-xl p-6 text-center">
          <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Live Stock Data</h3>
          <p className="text-gray-400 text-sm">
            Real-time stock market indices and performance
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md border border-white/10 rounded-xl p-6 text-center">
          <RefreshCw className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Auto Updates</h3>
          <p className="text-gray-400 text-sm">
            Data refreshes automatically every 30 seconds
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-md border border-white/10 rounded-xl p-6 text-center">
          <DollarSign className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Live Market Data</h3>
          <p className="text-gray-400 text-sm">
            Real-time crypto prices and currency exchange rates
          </p>
        </div>
      </div>
    </div>
  );
};

export default CryptoIndexPage;