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

  useEffect(function () {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (editId) {
      fetch('http://localhost:3000/api/trips/' + editId)
        .then(function (res) { return res.json(); })
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
      .then(function (res) { return res.json(); })
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
        <h2>{editId ? 'Modifica Passaggio' : 'Offri un passaggio'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label>Concerto di destinazione</label>
            <input
              type="text"
              required
              placeholder="es.: Dua Lipa"
              value={concertName}
              onChange={function (e) { setConcertName(e.target.value); }}
            />
          </div>

          <div className="campo">
            <label>Città di partenza</label>
            <input
              type="text"
              required
              placeholder="es.: Bari"
              value={departureCity}
              onChange={function (e) { setDepartureCity(e.target.value); }}
            />
          </div>

          <div className="campo">
            <label>Punto di ritrovo</label>
            <input
              type="text"
              required
              placeholder="es.: Stazione Centrale"
              value={meetingPoint}
              onChange={function (e) { setMeetingPoint(e.target.value); }}
            />
          </div>

          <div className="campo">
            <label>Orario di partenza</label>
            <input
              type="time"
              required
              value={departureTime}
              onChange={function (e) { setDepartureTime(e.target.value); }}
            />
          </div>

          <div className="campo">
            <label>Posti disponibili</label>
            <input
              type="number"
              min="1"
              max="8"
              required
              placeholder="es.: 3"
              value={availableSeats}
              onChange={function (e) { setAvailableSeats(e.target.value); }}
            />
          </div>

          <div className="campo">
            <label>Prezzo per passeggero</label>
            <input
              type="number"
              min="0"
              required
              placeholder="es.: 15"
              value={pricePerSeat}
              onChange={function (e) { setPricePerSeat(e.target.value); }}
            />
          </div>

          <button type="submit">
            {editId ? 'Salva Modifiche' : 'Pubblica Annuncio'}
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