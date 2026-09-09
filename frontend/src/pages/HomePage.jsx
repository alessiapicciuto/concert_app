import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/style.css';

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState(function () {
    const salvato = localStorage.getItem('currentUser');
    if (salvato) {
      try { return JSON.parse(salvato); } catch { return null; }
    }
    return null;
  });

  const [concerts, setConcerts] = useState([]);
  const [search, setSearch] = useState('');
  const [menuAperto, setMenuAperto] = useState(false);

  useEffect(function () {
    fetch('http://localhost:3000/api/concerts')
      .then(function (res) { return res.json(); })
      .then(function (dati) { setConcerts(dati); })
      .catch(function () {});
  }, []);

  function eseguiLogout() {
    if (window.confirm('Sei sicuro di voler uscire?')) {
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      setMenuAperto(false);
    }
  }

  const query = search.toLowerCase();
  const concertiFiltrati = concerts.filter(function (c) {
    const cittaOk = c.city && c.city.toLowerCase().includes(query);
    const genereOk = c.genre && c.genre.toLowerCase().includes(query);
    const titoloOk = c.title && c.title.toLowerCase().includes(query);
    const artistaOk = c.artist && c.artist.toLowerCase().includes(query);
    return cittaOk || genereOk || titoloOk || artistaOk;
  });

  return (
    <div className="home-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>CATALOGO CONCERTI</h1>

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
              Accedi
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