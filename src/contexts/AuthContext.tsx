import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, setCurrentUser, logoutUser, type UserData } from '@/lib/firebase';

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  login: (user: UserData) => void;
  logout: () => void;
  updateUser: (user: UserData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = (userData: UserData) => {
    setCurrentUser(userData);
    setUser(userData);
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const updateUser = (userData: UserData) => {
    setCurrentUser(userData);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
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
