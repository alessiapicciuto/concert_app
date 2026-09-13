import { useState, useEffect } from 'react';
import HomeView from '../components/HomeView';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function HomePage() {
  const { user: currentUser, logout } = useAuth();

  const [concerts, setConcerts] = useState([]);
  const [search, setSearch] = useState('');
  const [menuAperto, setMenuAperto] = useState(false);

  useEffect(function () {
    fetch(`${API_URL}/api/concerts`)
      .then(function (res) { return res.json(); })
      .then(function (dati) { setConcerts(dati); })
      .catch(function () {});
  }, []);

  function eseguiLogout() {
    if (window.confirm('Sei sicuro di voler uscire?')) {
      logout();
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
    <HomeView
      currentUser={currentUser}
      menuAperto={menuAperto}
      setMenuAperto={setMenuAperto}
      eseguiLogout={eseguiLogout}
      search={search}
      setSearch={setSearch}
      concertiFiltrati={concertiFiltrati}
    />
  );
}