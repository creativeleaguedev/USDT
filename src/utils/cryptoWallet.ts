import * as bip39 from 'bip39';
import * as bip32 from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import { Connection, PublicKey } from '@solana/web3.js';
import Web3 from 'web3';
import axios from 'axios';

export interface WalletAddresses {
  BTC: string;
  ETH: string;
  USDT: string;
  XRP: string;
  SOL: string;
}

export interface WalletKeys {
  mnemonic: string;
  seed: Buffer;
  addresses: WalletAddresses;
  privateKeys: {
    BTC: string;
    ETH: string;
    XRP: string;
    SOL: string;
  };
}

export interface CryptoBalance {
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

// Generate a new wallet with mnemonic phrase
export const generateCryptoWallet = async (): Promise<WalletKeys> => {
  try {
    // Generate 12-word mnemonic
    const mnemonic = bip39.generateMnemonic();
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const root = bip32.fromSeed(seed);

    // Bitcoin (BIP44: m/44'/0'/0'/0/0)
    const btcPath = "m/44'/0'/0'/0/0";
    const btcChild = root.derivePath(btcPath);
    const btcAddress = bitcoin.payments.p2pkh({ 
      pubkey: btcChild.publicKey,
      network: bitcoin.networks.bitcoin 
    }).address!;

    // Ethereum (BIP44: m/44'/60'/0'/0/0)
    const ethPath = "m/44'/60'/0'/0/0";
    const ethChild = root.derivePath(ethPath);
    const web3 = new Web3();
    const ethAccount = web3.eth.accounts.privateKeyToAccount('0x' + ethChild.privateKey!.toString('hex'));
    const ethAddress = ethAccount.address;

    // XRP (BIP44: m/44'/144'/0'/0/0)
    const xrpPath = "m/44'/144'/0'/0/0";
    const xrpChild = root.derivePath(xrpPath);
    // For XRP, we'll use a simplified address generation
    const xrpAddress = 'r' + ethAddress.slice(2, 27) + 'XRP'; // Simplified for demo

    // Solana (BIP44: m/44'/501'/0'/0)
    const solPath = "m/44'/501'/0'/0";
    const solChild = root.derivePath(solPath);
    const solKeypair = web3.eth.accounts.privateKeyToAccount('0x' + solChild.privateKey!.toString('hex'));
    const solAddress = solKeypair.address; // Simplified for demo

    return {
      mnemonic,
      seed,
      addresses: {
        BTC: btcAddress,
        ETH: ethAddress,
        USDT: ethAddress, // USDT runs on Ethereum
        XRP: xrpAddress,
        SOL: solAddress
      },
      privateKeys: {
        BTC: btcChild.privateKey!.toString('hex'),
        ETH: ethChild.privateKey!.toString('hex'),
        XRP: xrpChild.privateKey!.toString('hex'),
        SOL: solChild.privateKey!.toString('hex')
      }
    };
  } catch (error) {
    console.error('Error generating crypto wallet:', error);
    throw new Error('Failed to generate crypto wallet');
  }
};

// Restore wallet from mnemonic
export const restoreWalletFromMnemonic = async (mnemonic: string): Promise<WalletKeys> => {
  try {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    const seed = await bip39.mnemonicToSeed(mnemonic);
    const root = bip32.fromSeed(seed);

    // Same derivation paths as generation
    const btcPath = "m/44'/0'/0'/0/0";
    const btcChild = root.derivePath(btcPath);
    const btcAddress = bitcoin.payments.p2pkh({ 
      pubkey: btcChild.publicKey,
      network: bitcoin.networks.bitcoin 
    }).address!;

    const ethPath = "m/44'/60'/0'/0/0";
    const ethChild = root.derivePath(ethPath);
    const web3 = new Web3();
    const ethAccount = web3.eth.accounts.privateKeyToAccount('0x' + ethChild.privateKey!.toString('hex'));
    const ethAddress = ethAccount.address;

    const xrpPath = "m/44'/144'/0'/0/0";
    const xrpChild = root.derivePath(xrpPath);
    const xrpAddress = 'r' + ethAddress.slice(2, 27) + 'XRP';

    const solPath = "m/44'/501'/0'/0";
    const solChild = root.derivePath(solPath);
    const solKeypair = web3.eth.accounts.privateKeyToAccount('0x' + solChild.privateKey!.toString('hex'));
    const solAddress = solKeypair.address;

    return {
      mnemonic,
      seed,
      addresses: {
        BTC: btcAddress,
        ETH: ethAddress,
        USDT: ethAddress,
        XRP: xrpAddress,
        SOL: solAddress
      },
      privateKeys: {
        BTC: btcChild.privateKey!.toString('hex'),
        ETH: ethChild.privateKey!.toString('hex'),
        XRP: xrpChild.privateKey!.toString('hex'),
        SOL: solChild.privateKey!.toString('hex')
      }
    };
  } catch (error) {
    console.error('Error restoring wallet from mnemonic:', error);
    throw new Error('Failed to restore wallet from mnemonic');
  }
};

// Check Bitcoin balance
export const getBitcoinBalance = async (address: string): Promise<number> => {
  try {
    const response = await axios.get(`https://blockstream.info/api/address/${address}`);
    return response.data.chain_stats.funded_txo_sum / 100000000; // Convert satoshis to BTC
  } catch (error) {
    console.error('Error fetching Bitcoin balance:', error);
    return 0;
  }
};

// Check Ethereum balance
export const getEthereumBalance = async (address: string): Promise<number> => {
  try {
    const response = await axios.get(`https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=YourApiKeyToken`);
    if (response.data.status === '1') {
      return parseFloat(response.data.result) / Math.pow(10, 18); // Convert wei to ETH
    }
    return 0;
  } catch (error) {
    console.error('Error fetching Ethereum balance:', error);
    return 0;
  }
};

// Check USDT balance (ERC-20 token)
export const getUSDTBalance = async (address: string): Promise<number> => {
  try {
    const usdtContractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
    const response = await axios.get(`https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${usdtContractAddress}&address=${address}&tag=latest&apikey=YourApiKeyToken`);
    if (response.data.status === '1') {
      return parseFloat(response.data.result) / Math.pow(10, 6); // USDT has 6 decimals
    }
    return 0;
  } catch (error) {
    console.error('Error fetching USDT balance:', error);
    return 0;
  }
};

// Check XRP balance
export const getXRPBalance = async (address: string): Promise<number> => {
  try {
    const response = await axios.get(`https://api.xrpscan.com/api/v1/account/${address}`);
    return parseFloat(response.data.xrpBalance) || 0;
  } catch (error) {
    console.error('Error fetching XRP balance:', error);
    return 0;
  }
};

// Check Solana balance
export const getSolanaBalance = async (address: string): Promise<number> => {
  try {
    const connection = new Connection('https://api.mainnet-beta.solana.com');
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / Math.pow(10, 9); // Convert lamports to SOL
  } catch (error) {
    console.error('Error fetching Solana balance:', error);
    return 0;
  }
};

// Get current crypto prices
export const getCryptoPrices = async (): Promise<{ [key: string]: { price: number; change24h: number } }> => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,ripple,solana&vs_currencies=usd&include_24hr_change=true');
    return {
      BTC: { price: response.data.bitcoin.usd, change24h: response.data.bitcoin.usd_24h_change },
      ETH: { price: response.data.ethereum.usd, change24h: response.data.ethereum.usd_24h_change },
      USDT: { price: response.data.tether.usd, change24h: response.data.tether.usd_24h_change },
      XRP: { price: response.data.ripple.usd, change24h: response.data.ripple.usd_24h_change },
      SOL: { price: response.data.solana.usd, change24h: response.data.solana.usd_24h_change }
    };
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return {
      BTC: { price: 43000, change24h: 0 },
      ETH: { price: 2600, change24h: 0 },
      USDT: { price: 1, change24h: 0 },
      XRP: { price: 0.6, change24h: 0 },
      SOL: { price: 100, change24h: 0 }
    };
  }
};

// Get all balances for a wallet
export const getAllBalances = async (addresses: WalletAddresses): Promise<CryptoBalance[]> => {
  try {
    const [btcBalance, ethBalance, usdtBalance, xrpBalance, solBalance, prices] = await Promise.all([
      getBitcoinBalance(addresses.BTC),
      getEthereumBalance(addresses.ETH),
      getUSDTBalance(addresses.USDT),
      getXRPBalance(addresses.XRP),
      getSolanaBalance(addresses.SOL),
      getCryptoPrices()
    ]);

    return [
      {
        symbol: 'USDT',
        name: 'Tether USD',
        balance: usdtBalance,
        usdValue: usdtBalance * prices.USDT.price,
        price: prices.USDT.price,
        change24h: prices.USDT.change24h,
        address: addresses.USDT,
        icon: '₮',
        image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
        network: 'Ethereum',
        networkColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      },
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        balance: btcBalance,
        usdValue: btcBalance * prices.BTC.price,
        price: prices.BTC.price,
        change24h: prices.BTC.change24h,
        address: addresses.BTC,
        icon: '₿',
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        network: 'Bitcoin',
        networkColor: 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
      },
      {
        symbol: 'XRP',
        name: 'Ripple',
        balance: xrpBalance,
        usdValue: xrpBalance * prices.XRP.price,
        price: prices.XRP.price,
        change24h: prices.XRP.change24h,
        address: addresses.XRP,
        icon: '◉',
        image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
        network: 'XRP Ledger',
        networkColor: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        balance: solBalance,
        usdValue: solBalance * prices.SOL.price,
        price: prices.SOL.price,
        change24h: prices.SOL.change24h,
        address: addresses.SOL,
        icon: '◎',
        image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
        network: 'Solana',
        networkColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
      }
    ];
  } catch (error) {
    console.error('Error fetching all balances:', error);
    throw new Error('Failed to fetch wallet balances');
  }
};