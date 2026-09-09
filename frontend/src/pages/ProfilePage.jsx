import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/profilo.css';

export default function ProfilePage() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(function () {
    const salvato = localStorage.getItem('currentUser');
    if (salvato) {
      try {
        return JSON.parse(salvato);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [myCreatedTrips, setMyCreatedTrips] = useState([]);
  const [myBookedTrips, setMyBookedTrips] = useState([]);

  useEffect(function () {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:3000/api/trips')
      .then(function (res) { return res.json(); })
      .then(function (trips) {
        const creati = trips.filter(function (t) {
          return String(t.driverId) === String(currentUser.id);
        });
        const prenotati = trips.filter(function (t) {
          return t.passengers && t.passengers.some(function (p) {
            return String(p.userId) === String(currentUser.id);
          });
        });
        setMyCreatedTrips(creati);
        setMyBookedTrips(prenotati);
      })
      .catch(function () {});
  }, [currentUser, navigate]);

  function eseguiLogout() {
    if (window.confirm('Sei sicuro di voler uscire?')) {
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      navigate('/');
    }
  }

  function eliminaViaggio(idViaggio) {
    if (!window.confirm('Vuoi davvero cancellare questo viaggio?')) return;

    fetch('http://localhost:3000/api/trips/' + idViaggio, {
      method: 'DELETE'
    })
      .then(function (res) { return res.json(); })
      .then(function () {
        setMyCreatedTrips(function (prev) {
          return prev.filter(function (t) { return (t.id || t._id) !== idViaggio; });
        });
      })
      .catch(function () {
        alert('Errore durante la cancellazione del viaggio');
      });
  }

  if (!currentUser) return null;

  return (
    <div className="profile-page">
      <div className="contenitore-profilo">
        
        {/* Link dentro contenitore-profilo: non scapperà a sinistra */}
        <Link to="/" className="link-ritorno-profilo">← Torna al catalogo</Link>

        {/* Scheda Profilo */}
        <div className="scheda">
          <h2>AREA PERSONALE</h2>
          <div className="info-riga">
            <strong>NOME:</strong> {currentUser.name}
          </div>
          <div className="info-riga">
            <strong>EMAIL:</strong> {currentUser.email}
          </div>

          <div className="box-azioni-profilo">
            <Link to="/trips" className="btn-azione btn-offri">
              OFFRI PASSAGGIO
            </Link>
            <Link to="/" className="btn-azione btn-prenota">
              CERCA E PRENOTA UN PASSAGGIO
            </Link>
          </div>
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
                return (
                  <div key={idViaggio} className="scheda-viaggio-singolo">
                    <div className="titolo-concerto">{t.concertName}</div>
                    <div className="dettagli-viaggio">
                      Partenza da: {t.departureCity} | Ritrovo: {t.meetingPoint || '-'} | Orario: {t.departureTime || '-'}
                      <br />
                      Posti: {t.availableSeats} | Quota: {t.pricePerSeat}€
                    </div>
                    <div className="azioni-viaggio">
                      <button
                        className="btn-modifica"
                        onClick={function () { navigate('/trips?editId=' + idViaggio); }}
                      >
                        Modifica
                      </button>
                      <button
                        className="btn-elimina"
                        onClick={function () { eliminaViaggio(idViaggio); }}
                      >
                        Elimina
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
                    <div className="titolo-concerto">{t.concertName}</div>
                    <div className="dettagli-viaggio">
                      Autista: {t.driverName} | Partenza da: {t.departureCity}
                      <br />
                      Quota: {t.pricePerSeat}€
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottone Disconnetti */}
        <div className="box-logout-bottom">
          <button className="btn-logout" onClick={eseguiLogout}>
            DISCONNETTI
          </button>
        </div>

      </div>
    </div>
  );
}