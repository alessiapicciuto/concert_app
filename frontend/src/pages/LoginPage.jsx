import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginView from '../components/LoginView';

export default function LoginPage() {
  const navigate = useNavigate();
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
        localStorage.setItem('currentUser', JSON.stringify(r.d.user));
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
        localStorage.setItem('currentUser', JSON.stringify(r.d.user));
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