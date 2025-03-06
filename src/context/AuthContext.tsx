import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';

type AuthContextType = {
  isAuthenticated: boolean;
  login: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const login = async () => {
    const authClient = await AuthClient.create();
    await authClient.login({
      identityProvider: 'https://identity.ic0.app',
      onSuccess: () => {
        console.log('User logged in successfully!');
        setIsAuthenticated(true);
      },
      onError: (err) => {
        console.error('Login failed:', err);
      },
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
