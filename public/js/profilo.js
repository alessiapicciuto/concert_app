// riferimenti agli elementi html
const campoNome = document.getElementById('profilo-nome');
const campoEmail = document.getElementById('profilo-email');
const contenitoreViaggi = document.getElementById('contenitore-miei-viaggi');
const btnLogout = document.getElementById('btn-logout');

// controllo autenticazione 
const utenteSalvato = localStorage.getItem('currentUser');

if (!utenteSalvato) {
  // Se non c'è nessun utente in memoria, reindirizza al login
  alert('Effettua prima l\'accesso per vedere il tuo profilo.');
  window.location.href = '/login.html';
}

const utenteCorrente = JSON.parse(utenteSalvato);


campoNome.textContent = utenteCorrente.name;
campoEmail.textContent = utenteCorrente.email;

// caricamento dei viaggi dell'utente 
async function caricaMieiViaggi() {
  try {
    const risposta = await fetch('/api/trips');
    const tuttiViaggi = await risposta.json();

    // filtriamo per prendere solo i viaggi creati da questo utente
    const mieiViaggi = tuttiViaggi.filter((viaggio) => viaggio.driverId === utenteCorrente.id);

    // se non ci sono viaggi pubblicati
    if (mieiViaggi.length === 0) {
      contenitoreViaggi.innerHTML = '<p style="color: #94a3b8; font-size: 14px;">Non hai ancora offerto nessun passaggio.</p>';
      return;
    }

    // svuotiamo il testo "Caricamento in corso..."
    contenitoreViaggi.innerHTML = '';

    // Creiamo una card HTML per ogni viaggio trovato
    mieiViaggi.forEach((viaggio) => {
      const card = document.createElement('div');
      card.className = 'scheda-viaggio-singolo';

      card.innerHTML = `
        <div class="titolo-concerto">🎵 Concerto: ${viaggio.concertName}</div>
        <div class="dettagli-viaggio">
           PARTENZA DA: <strong>${viaggio.departureCity}</strong> alle ore <strong>${viaggio.departureTime}</strong><br>
           POSTI DISPONIBILI: <strong>${viaggio.availableSeats}</strong> | PREZZO: <strong>€ ${viaggio.pricePerSeat}</strong>
        </div>
      `;

      contenitoreViaggi.appendChild(card);
    });
  } catch (err) {
    contenitoreViaggi.innerHTML = '<p style="color: #f87171; font-size: 14px;">Errore nel caricamento dei viaggi.</p>';
  }
}

// Eseguiamo la funzione al caricamento della pagina
caricaMieiViaggi();

// logout
btnLogout.addEventListener('click', () => {
  // Rimuove l'utente dal browser
  localStorage.removeItem('currentUser');
  alert('Disconnessione effettuata con successo.');
  window.location.href = '/login.html';
});