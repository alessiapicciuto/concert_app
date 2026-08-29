// --- Riferimenti agli elementi HTML ---
const formViaggio = document.getElementById('form-crea-viaggio');
const inputConcerto = document.getElementById('scelta-concerto');
const datalistConcerti = document.getElementById('lista-concerti');
const inputCitta = document.getElementById('citta-partenza');
const inputOrario = document.getElementById('orario-partenza');
const inputPosti = document.getElementById('posti-disponibili');
const inputPrezzo = document.getElementById('prezzo-posto');
const divMessaggio = document.getElementById('messaggio-errore');
const btnSubmit = formViaggio.querySelector('button[type="submit"]');
const titoloPagina = document.querySelector('.scheda-viaggio h2');

if (datalistConcerti) {
  fetch('/api/concerts')
    .then((res) => res.json())
    .then((concerti) => {
      datalistConcerti.innerHTML = '';
      concerti.forEach((concerto) => {
        const option = document.createElement('option');
        // Usa direttamente la proprietà artist dal concerts.json
        option.value = concerto.artist || concerto.name || concerto.title;
        if (concerto.city) {
          option.textContent = `${concerto.artist} - ${concerto.city} (${concerto.tour || ''})`;
        }
        datalistConcerti.appendChild(option);
      });
    })
    .catch((err) => console.error('Errore nel caricamento dei concerti:', err));
}

// Controllo autenticazione
const utenteSalvato = localStorage.getItem('currentUser');
if (!utenteSalvato) {
  alert('Devi essere autenticato per gestire un passaggio.');
  window.location.href = '/login.html';
}

const utenteCorrente = JSON.parse(utenteSalvato);

// Controlla se siamo in modalità modifica (presenza di ?editId nell'URL)
const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get('editId');

if (editId) {
  titoloPagina.textContent = 'MODIFICA PASSAGGIO';
  btnSubmit.textContent = 'SALVA MODIFICHE';

  // Recupera i dati del viaggio da modificare e precompila i campi
  fetch('/api/trips')
    .then((res) => res.json())
    .then((trips) => {
      const viaggio = trips.find((t) => String(t.id) === String(editId));
      if (viaggio) {
        inputConcerto.value = viaggio.concertName;
        inputCitta.value = viaggio.departureCity;
        inputOrario.value = viaggio.departureTime;
        inputPosti.value = viaggio.availableSeats;
        inputPrezzo.value = viaggio.pricePerSeat;
      }
    });
}

// Gestione invio form
formViaggio.addEventListener('submit', async (e) => {
  e.preventDefault();
  divMessaggio.textContent = '';

  const payload = {
    concertName: inputConcerto.value.trim(),
    departureCity: inputCitta.value.trim(),
    departureTime: inputOrario.value,
    availableSeats: Number(inputPosti.value),
    pricePerSeat: Number(inputPrezzo.value),
    driverId: utenteCorrente.id,
    driverName: utenteCorrente.name
  };

  try {
    const url = editId ? `/api/trips/${editId}` : '/api/trips';
    const method = editId ? 'PUT' : 'POST';

    const risposta = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const dati = await risposta.json();

    if (!risposta.ok) {
      divMessaggio.textContent = dati.message || 'Errore durante il salvataggio.';
      return;
    }

    alert(editId ? 'Viaggio modificato con successo!' : 'Passaggio pubblicato con successo!');
    window.location.href = '/profilo.html';
  } catch (err) {
    divMessaggio.textContent = 'Errore di connessione con il server.';
  }
});