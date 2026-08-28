// --- 1. Riferimenti agli elementi HTML ---
const campoNome = document.getElementById('profilo-nome');
const campoEmail = document.getElementById('profilo-email');
const contenitoreViaggi = document.getElementById('contenitore-miei-viaggi');
const btnLogout = document.getElementById('btn-logout');

// --- 2. Controllo Autenticazione ---
const utenteSalvato = localStorage.getItem('currentUser');

if (!utenteSalvato) {
  // Se non c'è l'utente, avvisa e reindirizza
  alert('Effettua prima l\'accesso per vedere il tuo profilo.');
  window.location.href = '/login.html';
} else {
  // Se l'utente c'è, eseguiamo tutto il resto
  const utenteCorrente = JSON.parse(utenteSalvato);

  campoNome.textContent = utenteCorrente.name;
  campoEmail.textContent = utenteCorrente.email;

  // --- 3. Caricamento dei Viaggi ---
  async function caricaMieiViaggi() {
    try {
      const risposta = await fetch('/api/trips');
      const tuttiViaggi = await risposta.json();

      const mieiViaggi = tuttiViaggi.filter((viaggio) => viaggio.driverId === utenteCorrente.id);

      if (mieiViaggi.length === 0) {
        contenitoreViaggi.innerHTML = '<p style="color: #94a3b8; font-size: 14px;">Non hai ancora offerto nessun passaggio.</p>';
        return;
      }

      contenitoreViaggi.innerHTML = '';

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

  caricaMieiViaggi();

  // --- 4. Gestione Logout ---
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    alert('Disconnessione effettuata con successo.');
    window.location.href = '/login.html';
  });
}