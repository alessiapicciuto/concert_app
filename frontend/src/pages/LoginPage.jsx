import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginView from '../components/LoginView';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  
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
        
        // Passiamo utente, access token e refresh token al contesto/localStorage
        login(r.d.user, r.d.accessToken, r.d.refreshToken);
        
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
        
        // Se alla registrazione viene restituito il token, lo gestiamo, altrimenti passiamo null
        login(r.d.user, r.d.accessToken || null, r.d.refreshToken || null);
        
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