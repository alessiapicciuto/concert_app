import { createContext, useState, useContext } from 'react';

// crea il contesto
const AuthContext = createContext();

// Il Provider che gestisce lo stato, i token, il login, il logout e l'authFetch
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken') || null);

  const login = (userData, accessToken, jwtRefreshToken) => {
    setUser(userData);
    setToken(accessToken);
    setRefreshToken(jwtRefreshToken);
    
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('token', accessToken);
    if (jwtRefreshToken) {
      localStorage.setItem('refreshToken', jwtRefreshToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  const authFetch = async (url, options = {}) => {
    let currentToken = localStorage.getItem('token');

    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${currentToken}`,
      'Content-Type': 'application/json'
    };

    let response = await fetch(url, options);

    //  401 e 403 come token scaduto o non valido
    if (response.status === 401 || response.status === 403) {
      const currentRefreshToken = localStorage.getItem('refreshToken');
      
      if (!currentRefreshToken) {
        logout();
        throw new Error('Sessione scaduta. Effettua nuovamente il login.');
      }

      try {
        const refreshRes = await fetch('http://localhost:3000/api/refresh-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: currentRefreshToken })
        });

        if (!refreshRes.ok) {
          throw new Error('Refresh token non valido');
        }

        const data = await refreshRes.json();
        
        setToken(data.accessToken);
        localStorage.setItem('token', data.accessToken);

        options.headers['Authorization'] = `Bearer ${data.accessToken}`;
        response = await fetch(url, options);

      } catch (err) {
        logout();
        throw new Error('Sessione scaduta. Effettua nuovamente il login.', { cause: err });
      }
    }

    return response;
  };

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

// L'hook personalizzato (inserisco il commento per il warning di ESLint 
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}