import { Link } from 'react-router-dom';
import '../styles/style.css';

export default function ConcertDetailView({
  concert,
  trips,
  caricamentoTrips,
  currentUser,
  messages,
  testoMessaggio,
  setTestoMessaggio,
  chatBoxRef,
  prenotaPassaggio,
  annullaPassaggio,
  inviaMessaggio,
  eliminaMessaggio
}) {
  return (
    <div className="detail-wrapper">
      <Link to="/" className="back-link">← Torna al catalogo</Link>

      {/* Intestazione Concerto */}
      <div className="header-card">
        {concert ? (
          <div>
            <h1>{concert.title || concert.artist}</h1>
            <p><strong>Luogo:</strong> {concert.city} ({concert.venue})</p>
            <p><strong>Data:</strong> {concert.date} | <strong>Genere:</strong> {concert.genre}</p>
          </div>
        ) : (
          <p style={{ color: '#94a3b8' }}>Caricamento dettagli...</p>
        )}
      </div>

      {/* Viaggi e Passaggi */}
      <div className="header-card">
        <h3>Viaggi e Passaggi Disponibili</h3>
        <div>
          {caricamentoTrips ? (
            <p style={{ color: '#94a3b8' }}>Caricamento viaggi...</p>
          ) : trips.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>Nessun passaggio ancora offerto per questo concerto.</p>
          ) : (
            trips.map(function (t) {
              const idViaggio = t.id || t._id;
              const citta = t.departureCity || t.fromCity || '-';
              const prezzo = t.pricePerSeat || t.price || 0;
              const posti = t.availableSeats !== undefined ? t.availableSeats : 0;
              const autista = t.driverName || 'Autista';
              const ritrovo = t.meetingPoint || t.luogoRitrovo || t.ritrovo || '-';

              const eAutista = currentUser && String(t.driverId) === String(currentUser.id);
              const giaPrenotato = currentUser && t.passengers && t.passengers.some(function (p) {
                return String(p.userId) === String(currentUser.id);
              });

              return (
                <div key={idViaggio} className="riga-passaggio">
                  <div className="info-passaggio">
                    <p><strong>Partenza da:</strong> {citta} | <strong>Punto di ritrovo:</strong> {ritrovo}  |  <strong>Autista:</strong> {autista}</p>
                    <p><strong>Posti:</strong> {posti} | <strong>Costo:</strong> {prezzo}€</p>
                  </div>
                  <div>
                    {eAutista ? (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>Tuo passaggio</span>
                    ) : giaPrenotato ? (
                      <button
                        className="btn-annulla-mini"
                        onClick={function () { annullaPassaggio(idViaggio); }}
                      >
                        Annulla Prenotazione
                      </button>
                    ) : posti > 0 ? (
                      <button
                        className="btn-prenota-mini"
                        onClick={function () { prenotaPassaggio(idViaggio); }}
                      >
                        PRENOTA
                      </button>
                    ) : (
                      <span style={{ color: '#f87171', fontWeight: 'bold', fontSize: '13px' }}>ESAURITO</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sezione Chat */}
      <div className="chat-container">
        <h3>Chat di Gruppo</h3>
        
        <div className="chat-box" ref={chatBoxRef}>
          {messages.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>Nessun messaggio presente. Inizia la conversazione!</p>
          ) : (
            messages.map(function (m) {
              const eMio = currentUser && m.userName === currentUser.name;
              return (
                <div key={m.id} className="chat-riga-messaggio">
                  <span>
                    <strong style={{ color: '#38bdf8' }}>{m.userName}:</strong> {m.text}{' '}
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>({m.time})</span>
                  </span>
                  {eMio && (
                    <button
                      type="button"
                      className="btn-elimina-msg"
                      onClick={function () { eliminaMessaggio(m.id); }}
                    >
                      Elimina
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="chat-input-group">
          <input
            type="text"
            placeholder="Scrivi un messaggio..."
            value={testoMessaggio}
            onChange={function (e) { setTestoMessaggio(e.target.value); }}
            onKeyUp={function (e) { if (e.key === 'Enter') inviaMessaggio(); }}
          />
          <button onClick={inviaMessaggio}>Invia</button>
        </div>
      </div>
    </div>
  );
}