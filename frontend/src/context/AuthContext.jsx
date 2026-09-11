import { createContext, useState, useContext } from 'react';

// 1. Creiamo il contesto
const AuthContext = createContext();

// 2. Creiamo il Provider (il componente che avvolge l'intera app)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  // Funzione per effettuare il login ovunque nell'app
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
  };

  // Funzione per effettuare il logout ovunque nell'app
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Hook personalizzato per usare il contesto facilmente
export function useAuth() {
  return useContext(AuthContext);
}