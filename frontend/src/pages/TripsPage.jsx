import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/trips.css';

export default function TripsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');

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

  const [concertName, setConcertName] = useState('');
  const [departureCity, setDepartureCity] = useState('');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [availableSeats, setAvailableSeats] = useState('');
  const [pricePerSeat, setPricePerSeat] = useState('');
  const [errore, setErrore] = useState('');

  const [listaConcerti, setListaConcerti] = useState([]);

  useEffect(function () {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:3000/api/concerts')
      .then(function (res) {
        return res.json();
      })
      .then(function (dati) {
        setListaConcerti(dati);
      })
      .catch(function () {});

    if (editId) {
      fetch('http://localhost:3000/api/trips/' + editId)
        .then(function (res) {
          return res.json();
        })
        .then(function (trip) {
          setConcertName(trip.concertName || '');
          setDepartureCity(trip.departureCity || '');
          setMeetingPoint(trip.meetingPoint || '');
          setDepartureTime(trip.departureTime || '');
          setAvailableSeats(trip.availableSeats || '');
          setPricePerSeat(trip.pricePerSeat || '');
        })
        .catch(function () {});
    }
  }, [currentUser, editId, navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    setErrore('');

    if (!concertName.trim()) {
      setErrore('Inserisci o seleziona un concerto valido');
      return;
    }

    const url = editId
      ? 'http://localhost:3000/api/trips/' + editId
      : 'http://localhost:3000/api/trips';
    const method = editId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driverId: currentUser.id,
        driverName: currentUser.name,
        concertName: concertName,
        departureCity: departureCity,
        meetingPoint: meetingPoint,
        departureTime: departureTime,
        availableSeats: Number(availableSeats),
        pricePerSeat: Number(pricePerSeat)
      })
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (data.success || data.trip || !data.error) {
          navigate('/profile');
        } else {
          setErrore(data.message || 'Errore nel salvataggio del viaggio');
        }
      })
      .catch(function () {
        setErrore('Errore di connessione al server');
      });
  }

  return (
    <div className="trips-page">
      <div className="scheda-viaggio">
        <h2>{editId ? 'MODIFICA PASSAGGIO' : 'OFFRI UN PASSAGGIO'}</h2>

        <form onSubmit={handleSubmit}>
          {/* Input collegato al datalist nativo */}
          <div className="campo">
            <label>CONCERTO DI DESTINAZIONE</label>
            <input
              type="text"
              list="elenco-concerti"
              required
              placeholder="es.: Dua Lipa"
              value={concertName}
              onChange={function (e) {
                setConcertName(e.target.value);
              }}
            />
            <datalist id="elenco-concerti">
              {listaConcerti.map(function (c) {
                const testo = (c.title || c.artist) + ' (' + c.city + ')';
                return <option key={c.id || c._id} value={testo} />;
              })}
            </datalist>
          </div>

          <div className="campo">
            <label>CITTA' DI PARTENZA</label>
            <input
              type="text"
              required
              placeholder="es.: Bari"
              value={departureCity}
              onChange={function (e) {
                setDepartureCity(e.target.value);
              }}
            />
          </div>

          <div className="campo">
            <label>PUNTO DI RITROVO</label>
            <input
              type="text"
              required
              placeholder="es.: Stazione Centrale"
              value={meetingPoint}
              onChange={function (e) {
                setMeetingPoint(e.target.value);
              }}
            />
          </div>

          <div className="campo">
            <label>ORARIO DI PARTENZA</label>
            <input
              type="time"
              required
              value={departureTime}
              onChange={function (e) {
                setDepartureTime(e.target.value);
              }}
            />
          </div>

          <div className="campo">
            <label>POSTI DISPONIBILI</label>
            <input
              type="number"
              min="1"
              max="8"
              required
              placeholder="es.: 3"
              value={availableSeats}
              onChange={function (e) {
                setAvailableSeats(e.target.value);
              }}
            />
          </div>

          <div className="campo">
            <label>PREZZO PER PASSEGGERO</label>
            <input
              type="number"
              min="0"
              required
              placeholder="es.: 15"
              value={pricePerSeat}
              onChange={function (e) {
                setPricePerSeat(e.target.value);
              }}
            />
          </div>

          <button type="submit">
            {editId ? 'Salva Modifiche' : 'pubblica annuncio'}
          </button>

          {errore && <div className="messaggio-esito">{errore}</div>}
        </form>

        <div className="link-ritorno">
          <Link to="/profile">← Torna all'area personale</Link>
        </div>
      </div>
    </div>
  );
}