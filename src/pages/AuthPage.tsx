import React, { useState } from 'react';
import { Eye, EyeOff, Coins, Shield, CreditCard, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TermsModal from '../components/TermsModal';

const AuthPage: React.FC = () => {
  const { login, signup, resetPassword, isLoading } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showWalletPassword, setShowWalletPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+1',
    password: '',
    walletPassword: '',
    resetEmail: ''
  });

  const countryCodes = [
    { code: '+1', country: 'US', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+49', country: 'DE', flag: '🇩🇪' },
    { code: '+33', country: 'FR', flag: '🇫🇷' },
    { code: '+39', country: 'IT', flag: '🇮🇹' },
    { code: '+34', country: 'ES', flag: '🇪🇸' },
    { code: '+81', country: 'JP', flag: '🇯🇵' },
    { code: '+86', country: 'CN', flag: '🇨🇳' },
    { code: '+91', country: 'IN', flag: '🇮🇳' },
    { code: '+55', country: 'BR', flag: '🇧🇷' },
    { code: '+61', country: 'AU', flag: '🇦🇺' },
    { code: '+7', country: 'RU', flag: '🇷🇺' },
    { code: '+82', country: 'KR', flag: '🇰🇷' },
    { code: '+65', country: 'SG', flag: '🇸🇬' },
    { code: '+971', country: 'AE', flag: '🇦🇪' },
  ];

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (isSignup && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (isSignup && !formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (isSignup && !/^\d{7,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!isReset && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!isReset && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignup && !formData.walletPassword.trim()) {
      newErrors.walletPassword = 'Wallet password is required';
    } else if (isSignup && formData.walletPassword.length < 6) {
      newErrors.walletPassword = 'Wallet password must be at least 6 characters';
    }

    if (isSignup && !agreedToTerms) {
      newErrors.terms = 'You must agree to the Terms & Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    let success = false;

    if (isReset) {
      success = await resetPassword(formData.resetEmail);
      if (success) {
        alert('Password reset email sent! Check your inbox.');
        setIsReset(false);
      } else {
        setErrors({ resetEmail: 'Failed to send reset email' });
      }
    } else if (isSignup) {
      success = await signup(formData.name, formData.email, formData.phone, formData.countryCode, formData.password, formData.walletPassword);
      if (success) {
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 3000);
      } else {
        setErrors({ submit: 'Signup failed. Please try again.' });
      }
    } else {
      success = await login(formData.email, formData.password);
      if (!success) {
        setErrors({ submit: 'Invalid email or password' });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      countryCode: '+1',
      password: '',
      walletPassword: '',
      resetEmail: ''
    });
    setErrors({});
    setAgreedToTerms(false);
  };

  const switchMode = (mode: 'login' | 'signup' | 'reset') => {
    resetForm();
    setIsSignup(mode === 'signup');
    setIsReset(mode === 'reset');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to USDT BANC!</h2>
            <p className="text-gray-300 text-lg">Your Trusted Gateway to Stable Crypto Finance</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl flex items-center justify-center">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-6">
              <Coins className="w-12 h-12 text-cyan-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                USDT BANC
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-8">
              The Future of Stable Cryptocurrency Banking
            </p>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center space-x-4">
                <Shield className="w-8 h-8 text-cyan-400" />
                <div>
                  <h3 className="text-white font-semibold">Bank-Grade Security</h3>
                  <p className="text-gray-400">Multi-layer encryption and secure wallet generation</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <CreditCard className="w-8 h-8 text-purple-400" />
                <div>
                  <h3 className="text-white font-semibold">Instant Purchases</h3>
                  <p className="text-gray-400">Buy crypto with any debit or credit card</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <div>
                  <h3 className="text-white font-semibold">Live Market Data</h3>
                  <p className="text-gray-400">Real-time cryptocurrency prices and trends</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {isReset ? 'Reset Password' : isSignup ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-400">
                {isReset 
                  ? 'Enter your email to reset your password' 
                  : isSignup 
                  ? 'Join the future of crypto banking' 
                  : 'Sign in to your account'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isReset ? (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.resetEmail}
                    onChange={(e) => setFormData({ ...formData, resetEmail: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200"
                    placeholder="Enter your email"
                  />
                  {errors.resetEmail && <p className="text-red-400 text-sm mt-1">{errors.resetEmail}</p>}
                </div>
              ) : (
                <>
                  {isSignup && (
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200"
                        placeholder="Enter your full name"
                      />
                      {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200"
                      placeholder="Enter your email"
                    />
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                  </div>

                  {isSignup && (
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <div className="flex space-x-2">
                        <select
                          value={formData.countryCode}
                          onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                          className="px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200"
                        >
                          {countryCodes.map((country) => (
                            <option key={country.code} value={country.code} className="bg-gray-800">
                              {country.flag} {country.code}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                  </div>

                  {isSignup && (
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Wallet Withdrawal Password
                      </label>
                      <div className="relative">
                        <input
                          type={showWalletPassword ? 'text' : 'password'}
                          value={formData.walletPassword}
                          onChange={(e) => setFormData({ ...formData, walletPassword: e.target.value })}
                          className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200"
                          placeholder="Create wallet password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowWalletPassword(!showWalletPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showWalletPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.walletPassword && <p className="text-red-400 text-sm mt-1">{errors.walletPassword}</p>}
                      <p className="text-gray-400 text-xs mt-1">
                        This password will be required for all withdrawals
                      </p>
                    </div>
                  )}

                  {isSignup && (
                    <div>
                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-1 w-4 h-4 text-cyan-400 bg-transparent border-gray-300 rounded focus:ring-cyan-400"
                        />
                        <span className="text-gray-300 text-sm">
                          I agree to the{' '}
                          <button
                            type="button"
                            onClick={() => setShowTerms(true)}
                            className="text-cyan-400 hover:text-cyan-300 underline"
                          >
                            Terms & Conditions
                          </button>
                        </span>
                      </label>
                      {errors.terms && <p className="text-red-400 text-sm mt-1">{errors.terms}</p>}
                    </div>
                  )}
                </>
              )}

              {errors.submit && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{errors.submit}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  isReset ? 'Send Reset Email' : isSignup ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center space-y-4">
              {!isReset && (
                <button
                  onClick={() => switchMode('reset')}
                  className="text-cyan-400 hover:text-cyan-300 text-sm underline"
                >
                  Forgot your password?
                </button>
              )}

              <div className="border-t border-white/10 pt-4">
                {isReset ? (
                  <button
                    onClick={() => switchMode('login')}
                    className="text-gray-300 hover:text-white"
                  >
                    Back to Sign In
                  </button>
                ) : (
                  <p className="text-gray-400">
                    {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                      onClick={() => switchMode(isSignup ? 'login' : 'signup')}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      {isSignup ? 'Sign In' : 'Create Account'}
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};

export default AuthPage;