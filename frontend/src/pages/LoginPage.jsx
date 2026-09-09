import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';

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
    <div className="auth-page">
      <div className="scheda-autenticazione">
        {!isRegistrazione ? (
          <div>
            <h2>ACCEDI</h2>
            <form onSubmit={handleLogin}>
              <div className="campo">
                <label>Email</label>
                <input
                  type="email"
                  required
                  placeholder="es.: mario.rossi@email.com"
                  value={loginEmail}
                  onChange={function (e) { setLoginEmail(e.target.value); }}
                />
              </div>
              <div className="campo">
                <label>Password</label>
                <input
                  type="password"
                  required
                  placeholder="******"
                  value={loginPassword}
                  onChange={function (e) { setLoginPassword(e.target.value); }}
                />
              </div>
              <button type="submit">Entra</button>
              {erroreLogin && <div className="messaggio-errore">{erroreLogin}</div>}
            </form>
            <p className="testo-cambio">
              Non hai un account?{' '}
              <span onClick={function () { setIsRegistrazione(true); setErroreLogin(''); }}>
                Registrati
              </span>
            </p>
          </div>
        ) : (
          <div>
            <h2>REGISTRATI</h2>
            <form onSubmit={handleRegister}>
              <div className="campo">
                <label>Nome</label>
                <input
                  type="text"
                  required
                  placeholder="es.: Mario Rossi"
                  value={regNome}
                  onChange={function (e) { setRegNome(e.target.value); }}
                />
              </div>
              <div className="campo">
                <label>Email</label>
                <input
                  type="email"
                  required
                  placeholder="es.: mario.rossi@email.com"
                  value={regEmail}
                  onChange={function (e) { setRegEmail(e.target.value); }}
                />
              </div>
              <div className="campo">
                <label>Password</label>
                <input
                  type="password"
                  required
                  placeholder="almeno 6 caratteri"
                  value={regPassword}
                  onChange={function (e) { setRegPassword(e.target.value); }}
                />
              </div>
              <button type="submit">Crea Account</button>
              {erroreRegistrazione && <div className="messaggio-errore">{erroreRegistrazione}</div>}
            </form>
            <p className="testo-cambio">
              Hai già un account?{' '}
              <span onClick={function () { setIsRegistrazione(false); setErroreRegistrazione(''); }}>
                Accedi
              </span>
            </p>
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <Link to="/" style={{ color: '#38bdf8', fontSize: '13px', textDecoration: 'none' }}>
            ← Torna al catalogo
          </Link>
        </div>
      </div>
    </div>
  );
}