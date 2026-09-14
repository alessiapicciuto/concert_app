import { Link } from 'react-router-dom';
import '../styles/navbar.css';
import '../styles/home.css';

export default function HomeView({
  currentUser,
  menuAperto,
  setMenuAperto,
  eseguiLogout,
  search,
  setSearch,
  concertiFiltrati
}) {
  return (
    <div className="home-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em', textAlign: 'left' }}>
            CATALOGO CONCERTI
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: '4px 0 0 0', textAlign: 'left' }}>
            Trova i tuoi compagni di viaggio e condividi l'esperienza dei tuoi concerti preferiti!
          </p>
        </div>

        <div>
          {currentUser ? (
            <div className="dropdown">
              <button 
                type="button" 
                className="dropdown-btn"
                onClick={function () { setMenuAperto(!menuAperto); }}
              >
                Ciao, {currentUser.name} ▼
              </button>
              {menuAperto && (
                <div className="dropdown-content show">
                  <Link to="/profile">Area Personale</Link>
                  <a href="#" onClick={function (e) { e.preventDefault(); eseguiLogout(); }}>Esci</a>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="dropdown-btn" style={{ textDecoration: 'none' }}>
              Accedi / Registrati
            </Link>
          )}
        </div>
      </div>

      <input
        type="text"
        className="search-box"
        placeholder="Cerca per città o genere..."
        value={search}
        onChange={function (e) { setSearch(e.target.value); }}
      />

      <div className="grid">
        {concertiFiltrati.map(function (c) {
          const idConcerto = c.id || c._id;
          return (
            <div className="card" key={idConcerto}>
              {c.imageUrl && (
                <img 
                  src={c.imageUrl} 
                  alt={c.title || c.artist} 
                  style={{ 
                    width: '100%', 
                    height: '160px', 
                    objectFit: 'cover', 
                    borderRadius: '6px', 
                    marginBottom: '10px' 
                  }} 
                />
              )}

              <div>
                <h3>{c.title || c.artist}</h3>
                <p>{c.city} ({c.venue})</p>
                <p>{c.genre}</p>
                <p>{c.date}</p>
              </div>
              <Link to={'/concert/' + idConcerto} className="btn">
                Vedi Dettagli e Chat
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}