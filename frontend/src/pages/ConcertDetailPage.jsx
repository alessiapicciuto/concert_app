import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../styles/style.css';

export default function ConcertDetailPage() {
  const params = useParams();
  const concertId = params.id;
  const navigate = useNavigate();

  const [currentUser] = useState(function () {
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

  const [concert, setConcert] = useState(null);
  const [trips, setTrips] = useState([]);
  const [messages, setMessages] = useState([]);
  const [testoMessaggio, setTestoMessaggio] = useState('');
  const [caricamentoTrips, setCaricamentoTrips] = useState(true);

  const socketRef = useRef(null);
  const chatBoxRef = useRef(null);

  function aggiornaViaggi(titolo, artista) {
    fetch('http://localhost:3000/api/trips')
      .then(function (res) { return res.json(); })
      .then(function (tuttiTrips) {
        const tit = (titolo || '').toLowerCase();
        const art = (artista || '').toLowerCase();

        const viaggiFiltrati = tuttiTrips.filter(function (t) {
          if (t.concertId && String(t.concertId) === String(concertId)) return true;
          if (t.concertName) {
            const tripName = t.concertName.toLowerCase();
            const coincideTitolo = tit && (tripName.includes(tit) || tit.includes(tripName));
            const coincideArtista = art && (tripName.includes(art) || art.includes(tripName));
            return coincideTitolo || coincideArtista;
          }
          return false;
        });

        setTrips(viaggiFiltrati);
        setCaricamentoTrips(false);
      })
      .catch(function () {
        setCaricamentoTrips(false);
      });
  }

  useEffect(function () {
    const tripId = 'trip_' + concertId;
    const socket = io('http://localhost:3000');
    socketRef.current = socket;

    socket.emit('join_trip', tripId);

    socket.on('receive_message', function (data) {
      setMessages(function (prev) {
        return prev.concat({
          id: data.msgId,
          userName: data.sender,
          text: data.text,
          time: data.time || ''
        });
      });
    });

    socket.on('message_deleted', function (msgId) {
      setMessages(function (prev) {
        return prev.filter(function (m) {
          return m.id !== msgId;
        });
      });
    });

    fetch('http://localhost:3000/api/concerts/' + concertId)
      .then(function (res) { return res.json(); })
      .then(function (c) {
        setConcert(c);
        if (c.messages) setMessages(c.messages);
        aggiornaViaggi(c.title, c.artist);
      })
      .catch(function () {
        setCaricamentoTrips(false);
      });

    return function () {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concertId]);

  useEffect(function () {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  function prenotaPassaggio(idViaggio) {
    if (!currentUser) {
      alert("Effettua prima l'accesso per prenotare un passaggio.");
      navigate('/login');
      return;
    }

    fetch('http://localhost:3000/api/trips/' + idViaggio + '/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        userName: currentUser.name
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        alert(data.message);
        if (concert) aggiornaViaggi(concert.title, concert.artist);
      })
      .catch(function () {
        alert('Errore durante la prenotazione.');
      });
  }

  function annullaPassaggio(idViaggio) {
    if (!window.confirm('Vuoi davvero annullare la prenotazione di questo passaggio?')) return;

    fetch('http://localhost:3000/api/trips/' + idViaggio + '/cancel-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        alert(data.message);
        if (concert) aggiornaViaggi(concert.title, concert.artist);
      })
      .catch(function () {
        alert("Errore durante l'annullamento.");
      });
  }

  function inviaMessaggio() {
    if (!currentUser) {
      alert("Effettua prima l'accesso per partecipare alla chat.");
      navigate('/login');
      return;
    }

    const testoPulito = testoMessaggio.trim();
    if (!testoPulito) return;

    const mittente = currentUser.name;

    fetch('http://localhost:3000/api/concerts/' + concertId + '/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: mittente, text: testoPulito })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          const ultimoMessaggio = data.messages[data.messages.length - 1];
          if (socketRef.current) {
            socketRef.current.emit('send_message', {
              tripId: 'trip_' + concertId,
              sender: mittente,
              text: testoPulito,
              time: ultimoMessaggio.time,
              msgId: ultimoMessaggio.id
            });
          }
          setTestoMessaggio('');
        }
      })
      .catch(function () {
        alert("Errore nell'invio del messaggio.");
      });
  }

  function eliminaMessaggio(msgId) {
    if (!window.confirm('Sei sicuro di voler eliminare questo messaggio?')) return;

    fetch('http://localhost:3000/api/concerts/' + concertId + '/messages/' + msgId, {
      method: 'DELETE'
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          if (socketRef.current) {
            socketRef.current.emit('delete_message', {
              tripId: 'trip_' + concertId,
              msgId: msgId
            });
          }
          setMessages(function (prev) {
            return prev.filter(function (m) { return m.id !== msgId; });
          });
        }
      })
      .catch(function () {
        alert("Errore durante l'eliminazione.");
      });
  }

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

              const eAutista = currentUser && String(t.driverId) === String(currentUser.id);
              const giaPrenotato = currentUser && t.passengers && t.passengers.some(function (p) {
                return String(p.userId) === String(currentUser.id);
              });

              return (
                <div key={idViaggio} className="riga-passaggio">
                  <div className="info-passaggio">
                    <p><strong>Partenza da:</strong> {citta} | <strong>Autista:</strong> {autista}</p>
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