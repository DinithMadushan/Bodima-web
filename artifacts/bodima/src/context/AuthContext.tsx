import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGetMe, UserProfile, setAuthTokenGetter } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  token: string | null;
  setAuth: (token: string, user: UserProfile) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('cn_token'));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('cn_user');
    return saved ? JSON.parse(saved) : null;
  });
  const queryClient = useQueryClient();

  // Wire the token into the API client so every request gets Authorization: Bearer <token>
  useEffect(() => {
    setAuthTokenGetter(token ? () => token : null);
  }, [token]);

  const { data: meData, isLoading } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (meData) {
      setUser(meData);
      localStorage.setItem('cn_user', JSON.stringify(meData));
    }
  }, [meData]);

  const setAuth = (newToken: string, newUser: UserProfile) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('cn_token', newToken);
    localStorage.setItem('cn_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cn_token');
    localStorage.removeItem('cn_user');
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!token, token, setAuth, logout: handleLogout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
