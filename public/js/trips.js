// --- 1. Riferimenti agli elementi HTML ---
const formViaggio = document.getElementById('form-crea-viaggio');
const messaggioErrore = document.getElementById('messaggio-errore');

// controllo utente connesso 
const utenteSalvato = localStorage.getItem('currentUser');
let utenteCorrente = null;

if (!utenteSalvato) {
  alert('Devi aver effettuato l\'accesso per offrire un passaggio.');
  window.location.href = '/login.html';
} else {
  utenteCorrente = JSON.parse(utenteSalvato);
}

// invio form per creare il viaggio 
formViaggio.addEventListener('submit', async (e) => {
  e.preventDefault(); // Evita il ricaricamento della pagina

  // Raccogliamo i valori inseriti nei campi
  const concerto = document.getElementById('scelta-concerto').value;
  const partenza = document.getElementById('citta-partenza').value;
  const orario = document.getElementById('orario-partenza').value;
  const posti = parseInt(document.getElementById('posti-disponibili').value, 10);
  const prezzo = parseFloat(document.getElementById('prezzo-posto').value);

  // oggetto con tutti i dati del nuovo viaggio
  const nuovoViaggio = {
    concertName: concerto,
    driverId: utenteCorrente.id,
    driverName: utenteCorrente.name,
    departureCity: partenza,
    departureTime: orario,
    availableSeats: posti,
    pricePerSeat: prezzo
  };

  try {
    const risposta = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuovoViaggio)
    });

    const dati = await risposta.json();

    if (!risposta.ok) {
      messaggioErrore.textContent = dati.message;
      return;
    }

    alert('Viaggio pubblicato con successo');
    formViaggio.reset(); // svuota i campi form
    messaggioErrore.textContent = '';
  } catch (err) {
    messaggioErrore.textContent = 'Errore durante la pubblicazione del viaggio';
  }
});