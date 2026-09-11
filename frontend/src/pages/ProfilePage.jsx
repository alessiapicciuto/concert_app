import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileView from '../components/ProfileView';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function annullaPrenotazione(idViaggio) {
    if (!window.confirm('Vuoi davvero annullare la prenotazione di questo passaggio?')) return;

    fetch('http://localhost:3000/api/trips/' + idViaggio + '/cancel-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
       },
      body: JSON.stringify({ userId: currentUser.id })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
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