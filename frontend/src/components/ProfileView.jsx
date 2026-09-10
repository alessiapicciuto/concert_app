import { Link } from 'react-router-dom';
import '../styles/profilo.css';

export default function ProfileView({
  currentUser,
  myCreatedTrips,
  myBookedTrips,
  onModificaViaggio,
  onEliminaViaggio,
  onAnnullaPrenotazione,
  onLogout
}) {
  if (!currentUser) return null;

  return (
    <div className="profile-page">
      <div className="contenitore-profilo">
        
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
                // Cerca tutte le possibili chiavi con cui il backend potrebbe restituire il ritrovo
                const ritrovoVisualizzato = t.meetingPoint || t.luogoRitrovo || t.ritrovo || t.meeting || '-';

                return (
                  <div key={idViaggio} className="scheda-viaggio-singolo">
                    <div className="titolo-concerto">{t.concertName}</div>
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
                    <div className="titolo-concerto">{t.concertName}</div>
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
        <div className="box-logout-bottom">
          <button className="btn-logout" onClick={onLogout}>
            DISCONNETTI
          </button>
        </div>

      </div>
    </div>
  );
}