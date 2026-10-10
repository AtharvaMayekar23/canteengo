import { createContext, useState, useContext, useEffect } from 'react';
import { fetchCurrentUser, loginAccount } from '../services/api';

const AuthContext = createContext();
const AUTH_STORAGE_KEY = 'canteengo_auth';

function readAuthSession() {
  try {
    const storedSession = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null');
    return storedSession?.token ? { token: storedSession.token, user: null } : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readAuthSession);
  const user = session?.user || null;
  const isLoading = Boolean(session?.token && !session.user);

  useEffect(() => {
    if (!session?.token || session.user) return;

    fetchCurrentUser()
      .then((response) => {
        const verifiedSession = { token: session.token, user: response.data };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(verifiedSession));
        setSession(verifiedSession);
      })
      .catch(() => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setSession(null);
      });
  }, [session]);

  const login = async (credentials) => {
    const response = await loginAccount(credentials);
    const nextSession = {
      token: response.data.token,
      user: {
        name: response.data.name,
        email: response.data.email,
        contactNumber: response.data.contactNumber,
        role: response.data.role,
      },
    };
    localStorage.removeItem('canteengo_orders');
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    return nextSession.user;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isAuthenticated: Boolean(session?.token && user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}