import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('arthack_token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('arthack_user'));
    } catch {
      return null;
    }
  });

  const login = useCallback(async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { token: tok, user: usr } = res.data;
    localStorage.setItem('arthack_token', tok);
    localStorage.setItem('arthack_user', JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
    return usr;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('arthack_token');
    localStorage.removeItem('arthack_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
