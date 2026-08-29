// riferimenti agli elementi HTML 
const campoNome = document.getElementById('profilo-nome');
const campoEmail = document.getElementById('profilo-email');
const contenitoreViaggi = document.getElementById('contenitore-miei-viaggi');
const contenitorePrenotazioni = document.getElementById('contenitore-prenotazioni');
const btnLogout = document.getElementById('btn-logout');

// Controllo Autenticazione 
const utenteSalvato = localStorage.getItem('currentUser');

if (!utenteSalvato) {
  alert('Effettua prima l\'accesso per vedere il tuo profilo.');
  window.location.href = '/login.html';
} else {
  const utenteCorrente = JSON.parse(utenteSalvato);

  campoNome.textContent = utenteCorrente.name;
  campoEmail.textContent = utenteCorrente.email;

  // Caricamento dei Viaggi e delle Prenotazioni
  async function caricaDatiProfilo() {
    try {
      const risposta = await fetch('/api/trips');
      const tuttiViaggi = await risposta.json();

      // Viaggi Pubblicati dall'utente
      const mieiViaggi = tuttiViaggi.filter((viaggio) => String(viaggio.driverId) === String(utenteCorrente.id));

      if (mieiViaggi.length === 0) {
        contenitoreViaggi.innerHTML = '<p style="color: #94a3b8; font-size: 14px;">Non hai ancora offerto nessun passaggio.</p>';
      } else {
        contenitoreViaggi.innerHTML = '';
        mieiViaggi.forEach((viaggio) => {
          const card = document.createElement('div');
          card.className = 'scheda-viaggio-singolo';
          card.innerHTML = `
            <div class="titolo-concerto"> CONCERTO: ${viaggio.concertName}</div>
            <div class="dettagli-viaggio">
              <p> PARTENZA DA: <strong>${viaggio.departureCity}</strong> </p>
              <p> ALLE ORE: <strong>${viaggio.departureTime}</strong> </p>
              <p> POSTI DISPONIBILI: <strong>${viaggio.availableSeats}</strong> </p>
              <p> PREZZO: <strong>€ ${viaggio.pricePerSeat}</strong> </p>
            </div>
            <div class="azioni-viaggio">
              <button class="btn-modifica" onclick="window.location.href='/trips.html?editId=${viaggio.id}'">MODIFICA PASSAGGIO</button>
              <button class="btn-elimina" onclick="eliminaViaggio('${viaggio.id}')">ELIMINA PASSAGGIO</button>
            </div>
          `;
          contenitoreViaggi.appendChild(card);
        });
      }

      // Viaggi Prenotati dall'utente
      if (contenitorePrenotazioni) {
        const miePrenotazioni = tuttiViaggi.filter(
          (viaggio) => viaggio.passengers && viaggio.passengers.some((p) => String(p.userId) === String(utenteCorrente.id))
        );

        if (miePrenotazioni.length === 0) {
          contenitorePrenotazioni.innerHTML = '<p style="color: #94a3b8; font-size: 14px;">Non hai ancora prenotato nessun passaggio.</p>';
        } else {
          contenitorePrenotazioni.innerHTML = '';
          miePrenotazioni.forEach((viaggio) => {
            const card = document.createElement('div');
            card.className = 'scheda-viaggio-singolo';
            card.innerHTML = `
              <div class="titolo-concerto"> CONCERTO: ${viaggio.concertName}</div>
              <div class="dettagli-viaggio">
                <p> AUTISTA: <strong>${viaggio.driverName || 'Non specificato'}</strong> </p>
                <p> PARTENZA DA: <strong>${viaggio.departureCity}</strong> </p>
                <p> ALLE ORE: <strong>${viaggio.departureTime}</strong> </p>
                <p> PREZZO: <strong>€ ${viaggio.pricePerSeat}</strong> </p>
              </div>
              <div class="azioni-viaggio">
                <button class="btn-elimina" onclick="annullaPrenotazione('${viaggio.id}')">ANNULLA PRENOTAZIONE</button>
              </div>
            `;
            contenitorePrenotazioni.appendChild(card);
          });
        }
      }
    } catch (err) {
      contenitoreViaggi.innerHTML = '<p style="color: #f87171; font-size: 14px;">Errore nel caricamento dei viaggi.</p>';
      if (contenitorePrenotazioni) {
        contenitorePrenotazioni.innerHTML = '<p style="color: #f87171; font-size: 14px;">Errore nel caricamento delle prenotazioni.</p>';
      }
    }
  }

  // Funzioni elimina e modifica prenotazione
  window.eliminaViaggio = async function(id) {
    if (!confirm('Sei sicuro di voler eliminare questo viaggio?')) return;

    try {
      const res = await fetch(`/api/trips/${id}`, { method: 'DELETE' });
      const data = await res.json();
      alert(data.message);
      caricaDatiProfilo();
    } catch (err) {
      alert('Errore durante l\'eliminazione del viaggio.');
    }
  };

  window.annullaPrenotazione = async function(id) {
    if (!confirm('Sei sicuro di voler annullare questa prenotazione?')) return;

    try {
      const res = await fetch(`/api/trips/${id}/cancel-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: utenteCorrente.id })
      });
      const data = await res.json();
      alert(data.message);
      caricaDatiProfilo();
    } catch (err) {
      alert('Errore durante l\'annullamento della prenotazione.');
    }
  };

  caricaDatiProfilo();

  // Gestione Logout
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    alert('Disconnessione effettuata con successo.');
    window.location.href = '/login.html';
  });
}