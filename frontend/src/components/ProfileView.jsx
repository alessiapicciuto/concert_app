import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/profilo.css';

export default function ProfileView({
  currentUser,
  myCreatedTrips,
  myBookedTrips,
  allConcerts = [],
  allTrips = [],
  onModificaViaggio,
  onEliminaViaggio,
  onAnnullaPrenotazione,
  onLogout
}) {
  const [mostraCercaPassaggio, setMostraCercaPassaggio] = useState(false);
  const [filtroConcerto, setFiltroConcerto] = useState('');

  if (!currentUser) return null;

  function contaPassaggi(concerto) {
    const cId = String(concerto.id || concerto._id);
    const tit = (concerto.title || concerto.artist || '').toLowerCase().trim();
    return allTrips.filter(function (t) {
      if (t.concertId && String(t.concertId) === cId) return true;
      if (t.concertName) {
        const tripName = t.concertName.toLowerCase().trim();
        return tripName.includes(tit) || tit.includes(tripName);
      }
      return false;
    }).length;
  }

  const concertiFiltrati = allConcerts.filter(function (c) {
    const q = filtroConcerto.toLowerCase().trim();
    if (!q) return true;
    const nome = (c.title || c.artist || '').toLowerCase();
    const citta = (c.city || '').toLowerCase();
    const luogo = (c.venue || '').toLowerCase();
    return nome.includes(q) || citta.includes(q) || luogo.includes(q);
  });

  const concertiOrdinati = [...concertiFiltrati].sort(function (a, b) {
    const passaggiA = contaPassaggi(a);
    const passaggiB = contaPassaggi(b);
    return passaggiB - passaggiA;
  });

  return (
    <div className="profile-page">
      <div className="contenitore-profilo">
        
        <Link to="/" className="link-ritorno-profilo">← Torna al catalogo</Link>

        {/* Scheda Profilo */}
        <div className="scheda">
          <h2>AREA PERSONALE</h2>

          <div className="box-azioni-profilo">
            <Link to="/trips" className="btn-azione btn-offri">
              OFFRI PASSAGGIO
            </Link>
            <button 
              type="button" 
              className={'btn-azione btn-prenota' + (mostraCercaPassaggio ? ' chiudi-attivo' : '')}
              onClick={function () { setMostraCercaPassaggio(!mostraCercaPassaggio); }}
            >
              {mostraCercaPassaggio ? '✕ CHIUDI RICERCA' : 'CERCA E PRENOTA UN PASSAGGIO'}
            </button>
          </div>

          {/* Sezione selezione concerto per passaggi */}
          {mostraCercaPassaggio && (
            <div className="box-selezione-concerti">
              <h4 className="titolo-selezione">SCEGLI UN CONCERTO PER VEDERE I PASSAGGI</h4>
              <p className="descrizione-selezione">
                Seleziona un concerto per visualizzare i passaggi disponibili offerti dalla community o accedere alla chat:
              </p>

              <input
                type="text"
                className="input-cerca-concerto"
                placeholder="Cerca per artista, tour o città..."
                value={filtroConcerto}
                onChange={function (e) { setFiltroConcerto(e.target.value); }}
              />

              <div className="griglia-selezione-concerti">
                {concertiOrdinati.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '16px' }}>
                    Nessun concerto trovato con questo nome.
                  </p>
                ) : (
                  concertiOrdinati.map(function (c) {
                    const idConcerto = c.id || c._id;
                    const numPassaggi = contaPassaggi(c);
                    return (
                      <Link
                        key={idConcerto}
                        to={'/concert/' + idConcerto}
                        className="scheda-concerto-click"
                      >
                        <div className="dettagli-concerto-click">
                          <div className="nome-concerto-click">{c.title || c.artist}</div>
                          <div className="luogo-data-click">{c.city} ({c.venue}) • {c.date}</div>
                        </div>
                        <div className="badge-passaggi-wrapper">
                          {numPassaggi > 0 ? (
                            <span className="badge-passaggi-attivi">
                              {numPassaggi} passaggi{numPassaggi > 1 ? 'i' : 'o'}
                            </span>
                          ) : (
                            <span className="badge-passaggi-zero">
                              0 passaggi
                            </span>
                          )}
                          <span className="freccia-vai-concerto">→</span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Viaggi Pubblicati */}
        <div className="scheda">
          <h3>I MIEI VIAGGI PUBBLICATI</h3>
          {myCreatedTrips.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Non hai ancora offerto nessun passaggio.</p>
          ) : (
            <div className="lista-viaggi">
              {myCreatedTrips.map(function (t) {
                const idViaggio = t.id || t._id;
                // Cerca tutte le possibili chiavi con cui il backend potrebbe restituire il ritrovo
                const ritrovoVisualizzato = t.meetingPoint || t.luogoRitrovo || t.ritrovo || t.meeting || '-';

                return (
                  <div key={idViaggio} className="scheda-viaggio-singolo">
                    {t.concertId ? (
                      <Link to={'/concert/' + t.concertId} className="titolo-concerto-link">
                        {t.concertName} ↗
                      </Link>
                    ) : (
                      <div className="titolo-concerto">{t.concertName}</div>
                    )}
                    <div className="dettagli-viaggio">
                      Partenza da: {t.departureCity} | Ritrovo: {ritrovoVisualizzato} | Orario: {t.departureTime || '-'}
                      <br />
                      Posti: {t.availableSeats} | Quota: {t.pricePerSeat}€
                    </div>
                    <div className="azioni-viaggio">
                      <button
                        className="btn-modifica"
                        onClick={function () { onModificaViaggio(idViaggio); }}
                      >
                        MODIFICA
                      </button>
                      <button
                        className="btn-elimina"
                        onClick={function () { onEliminaViaggio(idViaggio); }}
                      >
                        ELIMINA
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Viaggi Prenotati */}
        <div className="scheda">
          <h3>I MIEI VIAGGI PRENOTATI</h3>
          {myBookedTrips.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Non hai ancora prenotato nessun passaggio.</p>
          ) : (
            <div className="lista-viaggi">
              {myBookedTrips.map(function (t) {
                const idViaggio = t.id || t._id;
                return (
                  <div key={idViaggio} className="scheda-viaggio-singolo">
                    {t.concertId ? (
                      <Link to={'/concert/' + t.concertId} className="titolo-concerto-link">
                        {t.concertName} ↗
                      </Link>
                    ) : (
                      <div className="titolo-concerto">{t.concertName}</div>
                    )}
                    <div className="dettagli-viaggio">
                      Autista: {t.driverName} | Partenza da: {t.departureCity}
                      <br />
                      Quota: {t.pricePerSeat}€
                    </div>
                    <div className="azioni-viaggio">
                      <button
                        className="btn-elimina"
                        onClick={function () { onAnnullaPrenotazione(idViaggio); }}
                      >
                        ANNULLA PRENOTAZIONE
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottone Disconnetti */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button className="btn-logout" onClick={onLogout}>
            DISCONNETTI
          </button>
        </div>

      </div>
    </div>
  );
}