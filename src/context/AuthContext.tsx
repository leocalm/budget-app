import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { fetchCurrentUser, type User } from '@/api/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, rememberMe: boolean) => void;
  logout: () => void;
  refreshUser: (rememberMe?: boolean, showToast?: boolean) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(
    async (rememberMe = false, showToast = false) => {
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(currentUser));
        return true;
      } catch (error) {
        setUser(null);
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        if (showToast) {
          notifications.show({
            title: t('common.error'),
            message: t('auth.session.refreshFailed'),
            color: 'red',
          });
        }
        return false;
      }
    },
    [setUser, t]
  );

  useEffect(() => {
    // Check for stored user on mount for quick hydration, then validate via cookie.
    const checkAuth = async () => {
      let rememberMe = false;
      let hasStoredUser = false;
      try {
        const localUser = localStorage.getItem('user');
        const sessionUser = sessionStorage.getItem('user');
        const storedUser = localUser || sessionUser;
        rememberMe = Boolean(localUser);
        hasStoredUser = Boolean(storedUser);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
      }

      await refreshUser(rememberMe, hasStoredUser);
      setIsLoading(false);
    };

    void checkAuth();
  }, [refreshUser]);

  const login = (userData: User, rememberMe: boolean) => {
    setUser(userData);
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
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
