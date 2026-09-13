import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileView from '../components/ProfileView';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const navigate = useNavigate();

  const { user: currentUser, logout, authFetch } = useAuth();

  const [myCreatedTrips, setMyCreatedTrips] = useState([]);
  const [myBookedTrips, setMyBookedTrips] = useState([]);

  const caricaViaggi = useCallback(function () {
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
  }, [currentUser]);

  useEffect(function () {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    caricaViaggi();
  }, [currentUser, navigate, caricaViaggi]);

  function eseguiLogout() {
    if (window.confirm('Sei sicuro di voler uscire?')) {
      logout(); 
      navigate('/');
    }
  }

  function eliminaViaggio(idViaggio) {
    if (!window.confirm('Vuoi davvero cancellare questo viaggio?')) return;

    authFetch('http://localhost:3000/api/trips/' + idViaggio, {
      method: 'DELETE'
    })
      .then(async function () { 
        setMyCreatedTrips(function (prev) {
          return prev.filter(function (t) { return (t.id || t._id) !== idViaggio; });
        });
      })
      .catch(function (err) {
        if (err.message && err.message.includes('Sessione scaduta')) {
          logout();
          navigate('/login');
        } else {
          alert('Errore durante la cancellazione del viaggio');
        }
      });
  }

  function annullaPrenotazione(idViaggio) {
    if (!window.confirm('Vuoi davvero annullare la prenotazione di questo passaggio?')) return;

    authFetch('http://localhost:3000/api/trips/' + idViaggio + '/cancel-booking', {
      method: 'POST',
      body: JSON.stringify({ userId: currentUser.id })
    })
      .then(async function (res) {
        const data = await res.json();
        alert(data.message || 'Prenotazione annullata con successo');
        caricaViaggi();
      })
      .catch(function (err) {
        if (err.message && err.message.includes('Sessione scaduta')) {
          logout();
          navigate('/login');
        } else {
          alert("Errore durante l'annullamento della prenotazione.");
        }
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