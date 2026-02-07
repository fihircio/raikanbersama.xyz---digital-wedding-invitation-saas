import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  role: string;
  membership_tier: string;
  phone_number?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => void;
  handleOAuthCallback: (token: string, refreshToken: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: User) => void;
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
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, recaptchaToken?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, recaptchaToken }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        const userData = data.data.user;
        const tokenData = data.data.token;

        setUser(userData);
        setToken(tokenData);

        localStorage.setItem('token', tokenData);
        localStorage.setItem('user', JSON.stringify(userData));

        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const register = async (name: string, email: string, password: string, recaptchaToken?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, recaptchaToken }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        const userData = data.data.user;
        const tokenData = data.data.token;

        setUser(userData);
        setToken(tokenData);

        localStorage.setItem('token', tokenData);
        localStorage.setItem('user', JSON.stringify(userData));

        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An error occurred during registration' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const loginWithGoogle = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = '/api/users/auth/google';
  };

  const handleOAuthCallback = async (token: string, refreshToken: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Call backend to verify and complete OAuth
      const response = await fetch('/api/users/oauth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, refreshToken }),
      });

      const data = await response.json();

      if (data.success) {
        const userData = data.data.user;
        const tokenData = data.data.token;
        const refreshTokenData = data.data.refreshToken;

        setUser(userData);
        setToken(tokenData);

        localStorage.setItem('token', tokenData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('refreshToken', refreshTokenData);

        return { success: true };
      } else {
        return { success: false, error: data.error || 'OAuth callback failed' };
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      return { success: false, error: 'An error occurred during OAuth callback' };
    }
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    loginWithGoogle,
    handleOAuthCallback,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};