import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TripsView from '../components/TripsView';
import { useAuth } from '../context/AuthContext'; 

export default function TripsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');

  // RECUPERIAMO USER, LOGOUT E LA NOSTRA MAGICA AUTH-FETCH DAL CONTESTO GLOBALE
  const { user: currentUser, logout, authFetch } = useAuth();

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
      .then(function (res) { return res.json(); })
      .then(function (dati) {
        setListaConcerti(dati);
      })
      .catch(function () {});

    if (editId) {
      fetch('http://localhost:3000/api/trips')
        .then(function (res) { return res.json(); })
        .then(function (tuttiIviaggi) {
          const tripTrovato = tuttiIviaggi.find(function (t) {
            return String(t.id || t._id) === String(editId);
          });

          if (tripTrovato) {
            setConcertName(tripTrovato.concertName || '');
            setDepartureCity(tripTrovato.departureCity || '');
            setMeetingPoint(tripTrovato.meetingPoint || tripTrovato.luogoRitrovo || tripTrovato.ritrovo || '');
            setDepartureTime(tripTrovato.departureTime || '');
            setAvailableSeats(tripTrovato.availableSeats !== undefined ? tripTrovato.availableSeats : '');
            setPricePerSeat(tripTrovato.pricePerSeat !== undefined ? tripTrovato.pricePerSeat : '');
          } else {
            setErrore("Impossibile trovare i dati del viaggio da modificare.");
          }
        })
        .catch(function () {
          setErrore("Errore di connessione durante il recupero del viaggio.");
        });
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

    //  Gestisce in automatico il token, il 401 e il refresh
    authFetch(url, {
      method: method,
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
      .then(async function (res) {
        const data = await res.json();

        if (data.success || data.trip || !data.error) {
          navigate('/profile');
        } else {
          setErrore(data.message || 'Errore nel salvataggio del viaggio');
        }
      })
      .catch(function (err) {
        setErrore(err.message || 'Errore di connessione al server');
        if (err.message && err.message.includes('Sessione scaduta')) {
          logout();
          navigate('/login');
        }
      });
  }

  return (
    <TripsView
      editId={editId}
      concertName={concertName}
      setConcertName={setConcertName}
      departureCity={departureCity}
      setDepartureCity={setDepartureCity}
      meetingPoint={meetingPoint}
      setMeetingPoint={setMeetingPoint}
      departureTime={departureTime}
      setDepartureTime={setDepartureTime}
      availableSeats={availableSeats}
      setAvailableSeats={setAvailableSeats}
      pricePerSeat={pricePerSeat}
      setPricePerSeat={setPricePerSeat}
      listaConcerti={listaConcerti}
      errore={errore}
      handleSubmit={handleSubmit}
    />
  );
}