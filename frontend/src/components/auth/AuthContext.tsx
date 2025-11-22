import React, { createContext, useContext, useState, useEffect} from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  company: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = localStorage.getItem('greenchoice_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);


  // TODO: Implement real SSO login flow
  // Placeholder login - simulates SSO redirect
  const login = () => {

    // Simulate successful SSO callback with mock user data
    const mockUser: User = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email: 'demo@greenchoice.com',
      name: 'Demo User',
      avatar: 'src/assets/avatar.png',
      company: 'GreenChoice Inc.'
    };
    
    setUser(mockUser);
    localStorage.setItem('greenchoice_user', JSON.stringify(mockUser));
  };


  const logout = () => {
    setUser(null);
    localStorage.removeItem('greenchoice_user');
  };


  // TODO: Implement connection to API with token or session cookie

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

