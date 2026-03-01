import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, settingsService } from '../services/dataService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const tokens = localStorage.getItem('tokens');
    if (stored && tokens) {
      setUser(JSON.parse(stored));
    }
    
    // Fetch and apply settings
    const fetchSettings = async () => {
      try {
        const res = await settingsService.get();
        if (res.data.success) {
          const s = res.data.data;
          setSettings(s);
          if (s.theme_colors) {
            const colors = JSON.parse(s.theme_colors);
            const root = document.documentElement;
            root.style.setProperty('--primary', colors[0]);
            root.style.setProperty('--primary-light', colors[1] || colors[0]);
            root.style.setProperty('--primary-dark', colors[0]);
            root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${colors.join(', ')})`);
          }
        }
      } catch (e) { console.error('Settings error:', e); }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { user: userData, employee, tokens } = res.data.data;
    const fullUser = { ...userData, employee };
    localStorage.setItem('user', JSON.stringify(fullUser));
    localStorage.setItem('tokens', JSON.stringify(tokens));
    setUser(fullUser);
    return fullUser;
  };

  const signup = async (data) => {
    const res = await authService.signup(data);
    const { tokens } = res.data.data;
    // After signup, login automatically
    localStorage.setItem('tokens', JSON.stringify(tokens));
    return res.data;
  };

  const logout = () => {
    authService.logout().catch(() => {});
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, settings }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
