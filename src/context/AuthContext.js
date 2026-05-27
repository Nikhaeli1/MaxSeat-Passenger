import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loginPassenger, logoutPassenger,
  saveToken, clearToken,
} from '../api/apiService';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on launch ─────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [token, profile] = await Promise.all([
          AsyncStorage.getItem('pax_token'),
          AsyncStorage.getItem('pax_profile'),
        ]);
        if (token && profile) setUser(JSON.parse(profile));
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (username, password) => {
    const data = await loginPassenger(username, password);
    await saveToken(data.token);
    await AsyncStorage.setItem('pax_profile', JSON.stringify(data));
    setUser(data);
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    await logoutPassenger();
    await clearToken();
    await AsyncStorage.removeItem('pax_profile');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}