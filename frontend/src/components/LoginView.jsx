import { Link } from 'react-router-dom';
import '../styles/auth.css';

export default function LoginView({
  isRegistrazione,
  setIsRegistrazione,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  erroreLogin,
  setErroreLogin,
  handleLogin,
  regNome,
  setRegNome,
  regEmail,
  setRegEmail,
  regPassword,
  setRegPassword,
  erroreRegistrazione,
  setErroreRegistrazione,
  handleRegister
}) {
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
              <span
                style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}
                onClick={function () {
                  setIsRegistrazione(true);
                  setErroreLogin('');
                }}
              >
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
              <span
                style={{ color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}
                onClick={function () {
                  setIsRegistrazione(false);
                  setErroreRegistrazione('');
                }}
              >
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