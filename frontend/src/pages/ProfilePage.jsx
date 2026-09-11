import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileView from '../components/ProfileView';
import { useAuth } from '../context/AuthContext'; // <-- 1. IMPORTIAMO USEAUTH

export default function ProfilePage() {
  const navigate = useNavigate();

  // 2. RECUPERIAMO USER, TOKEN E LOGOUT DAL CONTESTO GLOBALE
  const { user: currentUser, token, logout } = useAuth();

  const [myCreatedTrips, setMyCreatedTrips] = useState([]);
  const [myBookedTrips, setMyBookedTrips] = useState([]);

  // Funzione di utilità per gestire i token scaduti
  function gestisciSessioneScaduta(messaggio) {
    alert(messaggio || "Token non valido o scaduto. Effettua nuovamente il login.");
    logout();
    navigate('/login');
  }

  function caricaViaggi() {
    if (!currentUser) return;
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
  }

  useEffect(function () {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    caricaViaggi();
    
  }, [currentUser, navigate]);

  function eseguiLogout() {
    if (window.confirm('Sei sicuro di voler uscire?')) {
      logout(); 
      navigate('/');
    }
  }

  function eliminaViaggio(idViaggio) {
    if (!window.confirm('Vuoi davvero cancellare questo viaggio?')) return;

    fetch('http://localhost:3000/api/trips/' + idViaggio, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token 
      }
    })
      .then(async function (res) {
        const data = await res.json();
        if (res.status === 401 || res.status === 403) {
          gestisciSessioneScaduta(data.message);
          return;
        }

        setMyCreatedTrips(function (prev) {
          return prev.filter(function (t) { return (t.id || t._id) !== idViaggio; });
        });
      })
      .catch(function () {
        alert('Errore durante la cancellazione del viaggio');
      });
  }

  function annullaPrenotazione(idViaggio) {
    if (!window.confirm('Vuoi davvero annullare la prenotazione di questo passaggio?')) return;

    fetch('http://localhost:3000/api/trips/' + idViaggio + '/cancel-booking', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token // <-- USA IL TOKEN DAL CONTESTO
      },
      body: JSON.stringify({ userId: currentUser.id })
    })
      .then(async function (res) {
        const data = await res.json();
        if (res.status === 401 || res.status === 403) {
          gestisciSessioneScaduta(data.message);
          return;
        }

        alert(data.message || 'Prenotazione annullata con successo');
        caricaViaggi();
      })
      .catch(function () {
        alert("Errore durante l'annullamento della prenotazione.");
      });
  }

  function modificaViaggio(idViaggio) {
    navigate('/trips?editId=' + idViaggio);
  }

  return (
    <ProfileView
      currentUser={currentUser}
      myCreatedTrips={myCreatedTrips}
      myBookedTrips={myBookedTrips}
      onModificaViaggio={modificaViaggio}
      onEliminaViaggio={eliminaViaggio}
      onAnnullaPrenotazione={annullaPrenotazione}
      onLogout={eseguiLogout}
    />
  );
}