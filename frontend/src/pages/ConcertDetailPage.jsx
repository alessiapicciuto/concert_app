import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../styles/style.css';

export default function ConcertDetailPage() {
  const params = useParams();
  const concertId = params.id;
  const navigate = useNavigate();

  // ================= PARTE 1: STATO E LOGICA =================

  // Utente loggato dal localStorage
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

  // Funzione per ricaricare la lista dei viaggi
  function aggiornaViaggi(titolo, artista) {
    fetch('http://localhost:3000/api/trips')
      .then(function (res) {
        return res.json();
      })
      .then(function (tuttiTrips) {
        const tit = (titolo || '').toLowerCase();
        const art = (artista || '').toLowerCase();

        const viaggiFiltrati = tuttiTrips.filter(function (t) {
          if (t.concertId && String(t.concertId) === String(concertId)) {
            return true;
          }
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

  // Caricamento iniziale dei dettagli del concerto e configurazione Socket.IO
  useEffect(function () {
    const tripId = 'trip_' + concertId;

    // Connessione Socket.IO
    const socket = io('http://localhost:3000');
    socketRef.current = socket;

    socket.emit('join_trip', tripId);

    // Ricezione messaggio in tempo reale
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

    // Eliminazione messaggio in tempo reale
    socket.on('message_deleted', function (msgId) {
      setMessages(function (prev) {
        return prev.filter(function (m) {
          return m.id !== msgId;
        });
      });
    });

    // Chiamata API concerto
    fetch('http://localhost:3000/api/concerts/' + concertId)
      .then(function (res) {
        return res.json();
      })
      .then(function (c) {
        setConcert(c);
        if (c.messages) {
          setMessages(c.messages);
        }

        // Chiamata per recuperare i viaggi collegati
        fetch('http://localhost:3000/api/trips')
          .then(function (resTrips) {
            return resTrips.json();
          })
          .then(function (tuttiTrips) {
            const tit = (c.title || '').toLowerCase();
            const art = (c.artist || '').toLowerCase();

            const viaggiFiltrati = tuttiTrips.filter(function (t) {
              if (t.concertId && String(t.concertId) === String(concertId)) {
                return true;
              }
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
      })
      .catch(function () {
        setCaricamentoTrips(false);
      });

    // Pulizia socket quando si esce dalla pagina
    return function () {
      socket.disconnect();
    };
  }, [concertId]);

  // Autoscroll della chat verso il basso
  useEffect(function () {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Prenotazione passaggio
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
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        alert(data.message);
        if (concert) {
          aggiornaViaggi(concert.title, concert.artist);
        }
      })
      .catch(function () {
        alert('Errore durante la prenotazione.');
      });
  }

  // Annullamento prenotazione
  function annullaPassaggio(idViaggio) {
    if (!window.confirm('Vuoi davvero annullare la prenotazione di questo passaggio?')) {
      return;
    }

    fetch('http://localhost:3000/api/trips/' + idViaggio + '/cancel-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id
      })
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        alert(data.message);
        if (concert) {
          aggiornaViaggi(concert.title, concert.artist);
        }
      })
      .catch(function () {
        alert("Errore durante l'annullamento.");
      });
  }

  // Invio messaggio in chat
  function inviaMessaggio() {
    if (!currentUser) {
      alert("Effettua prima l'accesso per partecipare alla chat.");
      navigate('/login');
      return;
    }

    const testoPulito = testoMessaggio.trim();
    if (!testoPulito) {
      return;
    }

    const mittente = currentUser.name;

    fetch('http://localhost:3000/api/concerts/' + concertId + '/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: mittente, text: testoPulito })
    })
      .then(function (res) {
        return res.json();
      })
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

  // Eliminazione messaggio
  function eliminaMessaggio(msgId) {
    if (!window.confirm('Sei sicuro di voler eliminare questo messaggio?')) {
      return;
    }

    fetch('http://localhost:3000/api/concerts/' + concertId + '/messages/' + msgId, {
      method: 'DELETE'
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (data.success) {
          if (socketRef.current) {
            socketRef.current.emit('delete_message', {
              tripId: 'trip_' + concertId,
              msgId: msgId
            });
          }
          setMessages(function (prev) {
            return prev.filter(function (m) {
              return m.id !== msgId;
            });
          });
        }
      })
      .catch(function () {
        alert("Errore durante l'eliminazione.");
      });
  }

  // ================= PARTE 2: STRUTTURA VISIVA (HTML/JSX) =================

  return (
    <div>
      <Link to="/" className="back-link">← Torna al catalogo</Link>

      {/* Dettagli del Concerto */}
      <div id="detail" className="header-card">
        {concert ? (
          <div>
            <h1>{concert.title || concert.artist}</h1>
            <p><b>Luogo:</b> {concert.city} ({concert.venue})</p>
            <p><b>Data:</b> {concert.date} | <b>Genere:</b> {concert.genre}</p>
          </div>
        ) : (
          <p style={{ color: '#aaa' }}>Caricamento dettagli concerto...</p>
        )}
      </div>

      {/* Elenco Viaggi e Passaggi */}
      <div className="header-card" style={{ marginTop: '15px' }}>
        <h3 style={{ marginTop: 0, color: '#38bdf8' }}>Viaggi e Passaggi Disponibili</h3>
        <div id="tripsList">
          {caricamentoTrips ? (
            <p style={{ color: '#aaa' }}>Caricamento viaggi...</p>
          ) : trips.length === 0 ? (
            <p style={{ color: '#aaa' }}>Nessun passaggio ancora offerto per questo concerto.</p>
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
                <div
                  key={idViaggio}
                  style={{
                    borderBottom: '1px solid #333',
                    padding: '10px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <p style={{ margin: '2px 0' }}><b>Partenza da:</b> {citta} | <b>Autista:</b> {autista}</p>
                    <p style={{ margin: '2px 0' }}><b>Posti:</b> {posti} | <b>Costo:</b> {prezzo}€</p>
                  </div>
                  <div>
                    {eAutista ? (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Tuo passaggio</span>
                    ) : giaPrenotato ? (
                      <button
                        onClick={function () { annullaPassaggio(idViaggio); }}
                        style={{
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Annulla Prenotazione
                      </button>
                    ) : posti > 0 ? (
                      <button
                        onClick={function () { prenotaPassaggio(idViaggio); }}
                        style={{
                          backgroundColor: '#059669',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        PRENOTA
                      </button>
                    ) : (
                      <span style={{ color: '#f87171', fontWeight: 'bold' }}>ESAURITO</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat di Gruppo */}
      <div className="chat-container">
        <h3 style={{ marginTop: 0, color: '#38bdf8' }}>Chat di Gruppo</h3>
        
        <div id="chatBox" className="chat-box" ref={chatBoxRef}>
          {messages.map(function (m) {
            const eMioMessaggio = currentUser && m.userName === currentUser.name;
            return (
              <p key={m.id} id={'msg-' + m.id}>
                <b style={{ color: '#38bdf8' }}>{m.userName}:</b> {m.text}{' '}
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>({m.time})</span>
                {eMioMessaggio && (
                  <button
                    onClick={function () { eliminaMessaggio(m.id); }}
                    style={{
                      color: '#ef4444',
                      fontSize: '12px',
                      cursor: 'pointer',
                      border: 'none',
                      background: 'none',
                      marginLeft: '10px',
                      fontWeight: 'bold'
                    }}
                  >
                    Elimina
                  </button>
                )}
              </p>
            );
          })}
        </div>

        <div className="chat-input-group">
          <input
            type="text"
            id="msgText"
            placeholder="Scrivi un messaggio..."
            value={testoMessaggio}
            onChange={function (e) { setTestoMessaggio(e.target.value); }}
            onKeyUp={function (e) {
              if (e.key === 'Enter') {
                inviaMessaggio();
              }
            }}
          />
          <button onClick={inviaMessaggio}>Invia</button>
        </div>
      </div>
    </div>
  );
}