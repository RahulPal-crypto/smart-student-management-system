import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Student, Teacher, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: Student | Teacher | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  loginAsDemo: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smart_sms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState<Student | Teacher | null>(() => {
    const saved = localStorage.getItem('smart_sms_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('smart_sms_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const currentToken = localStorage.getItem('smart_sms_token');
    if (!currentToken) {
      setIsLoading(false);
      return;
    }

    try {
      const res: any = await api.get('/auth/me');
      if (res.success && res.data) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        localStorage.setItem('smart_sms_user', JSON.stringify(res.data.user));
        if (res.data.profile) {
          localStorage.setItem('smart_sms_profile', JSON.stringify(res.data.profile));
        }
      }
    } catch (err) {
      console.warn('Session check failed:', err);
      setUser(null);
      setProfile(null);
      setToken(null);
      localStorage.removeItem('smart_sms_token');
      localStorage.removeItem('smart_sms_user');
      localStorage.removeItem('smart_sms_profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleUnauthorized = () => {
      setUser(null);
      setProfile(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const res: any = await api.post('/auth/login', { email, password, role });
      if (res.success && res.data) {
        const { token: newToken, user: newUser, profile: newProfile } = res.data;
        setToken(newToken);
        setUser(newUser);
        setProfile(newProfile);
        localStorage.setItem('smart_sms_token', newToken);
        localStorage.setItem('smart_sms_user', JSON.stringify(newUser));
        if (newProfile) {
          localStorage.setItem('smart_sms_profile', JSON.stringify(newProfile));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async (role: UserRole) => {
    if (role === 'admin') {
      await login('sonampachb20p5@gmail.com', 'Admin@123', 'admin');
    } else if (role === 'teacher') {
      await login('teacher@smartedu.org', 'Teacher@123', 'teacher');
    } else {
      await login('student@smartedu.org', 'Student@123', 'student');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      setProfile(null);
      setToken(null);
      localStorage.removeItem('smart_sms_token');
      localStorage.removeItem('smart_sms_user');
      localStorage.removeItem('smart_sms_profile');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        login,
        loginAsDemo,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
