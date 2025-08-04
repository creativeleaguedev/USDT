import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, countryCode: string, password: string, walletPassword: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('usdtbanc_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if login is with phone number or email
      let userData;
      if (email.startsWith('+') || /^\d+$/.test(email)) {
        // Phone number login
        const storedUsers = JSON.parse(localStorage.getItem('usdtbanc_users') || '[]');
        const user = storedUsers.find((u: any) => u.phone === email);
        if (user && password) {
          userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt
          };
        }
      } else {
        // Email login - for demo purposes, any valid email/password combo works
        if (email && password) {
          userData = {
            id: 'user_' + Date.now(),
            email,
            name: email.split('@')[0],
            createdAt: new Date().toISOString()
          };
        }
      }
      
      if (userData) {
        setUser(userData);
        localStorage.setItem('usdtbanc_user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string, 
    email: string, 
    phone: string,
    countryCode: string,
    password: string, 
    walletPassword: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userData = {
        id: 'user_' + Date.now(),
        email,
        name,
        phone: `${countryCode}${phone}`,
        createdAt: new Date().toISOString()
      };
      
      // Store user data for phone login
      const existingUsers = JSON.parse(localStorage.getItem('usdtbanc_users') || '[]');
      existingUsers.push(userData);
      localStorage.setItem('usdtbanc_users', JSON.stringify(existingUsers));
      
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        createdAt: userData.createdAt
      });
      localStorage.setItem('usdtbanc_user', JSON.stringify({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        createdAt: userData.createdAt
      }));
      localStorage.setItem('usdtbanc_wallet_password', walletPassword);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('usdtbanc_user');
    localStorage.removeItem('usdtbanc_wallet_password');
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        resetPassword,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};