import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginView from '../components/LoginView';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // <-- Estratta la funzione login dal contesto globale
  
  const [isRegistrazione, setIsRegistrazione] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [erroreLogin, setErroreLogin] = useState('');

  const [regNome, setRegNome] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [erroreRegistrazione, setErroreRegistrazione] = useState('');

  function handleLogin(e) {
    e.preventDefault();
    setErroreLogin('');
    fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail, password: loginPassword })
    })
      .then(function (res) { return res.json().then(function (d) { return { ok: res.ok, d: d }; }); })
      .then(function (r) {
        if (!r.ok) return setErroreLogin(r.d.message);
        
        // Usiamo la funzione login del contesto: 
        // aggiorna sia lo stato globale React che il localStorage
        login(r.d.user, r.d.token);
        
        navigate('/profile');
      })
      .catch(function () { setErroreLogin('Errore di connessione'); });
  }

  function handleRegister(e) {
    e.preventDefault();
    setErroreRegistrazione('');
    fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: regNome, email: regEmail, password: regPassword })
    })
      .then(function (res) { return res.json().then(function (d) { return { ok: res.ok, d: d }; }); })
      .then(function (r) {
        if (!r.ok) return setErroreRegistrazione(r.d.message);
        
        // Se il backend restituisce il token anche alla registrazione, passa r.d.token
        // altrimenti passa r.d.token || null per registrare l'utente nel contesto
        login(r.d.user, r.d.token || null);
        
        navigate('/profile');
      })
      .catch(function () { setErroreRegistrazione('Errore di connessione'); });
  }

  return (
    <LoginView
      isRegistrazione={isRegistrazione}
      setIsRegistrazione={setIsRegistrazione}
      loginEmail={loginEmail}
      setLoginEmail={setLoginEmail}
      loginPassword={loginPassword}
      setLoginPassword={setLoginPassword}
      erroreLogin={erroreLogin}
      setErroreLogin={setErroreLogin}
      handleLogin={handleLogin}
      regNome={regNome}
      setRegNome={setRegNome}
      regEmail={regEmail}
      setRegEmail={setRegEmail}
      regPassword={regPassword}
      setRegPassword={setRegPassword}
      erroreRegistrazione={erroreRegistrazione}
      setErroreRegistrazione={setErroreRegistrazione}
      handleRegister={handleRegister}
    />
  );
}