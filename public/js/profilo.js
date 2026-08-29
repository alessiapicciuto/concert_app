// --- 1. Riferimenti agli elementi HTML ---
const campoNome = document.getElementById('profilo-nome');
const campoEmail = document.getElementById('profilo-email');
const contenitoreViaggi = document.getElementById('contenitore-miei-viaggi');
const btnLogout = document.getElementById('btn-logout');

// --- 2. Controllo Autenticazione ---
const utenteSalvato = localStorage.getItem('currentUser');

if (!utenteSalvato) {
  alert('Effettua prima l\'accesso per vedere il tuo profilo.');
  window.location.href = '/login.html';
} else {
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
          <div class="titolo-concerto"> CONCERTO: ${viaggio.concertName}</div>
          <div class="dettagli-viaggio">
           <p> PARTENZA DA: <strong>${viaggio.departureCity}</strong> </p>
           <p> ALLE ORE <strong>${viaggio.departureTime}</strong><br></p>
           <p>POSTI DISPONIBILI: <strong>${viaggio.availableSeats}</strong> </p>
           <p>PREZZO: <strong>€ ${viaggio.pricePerSeat}</strong> </p>
          </div>
          <div class="azioni-viaggio">
            <button class="btn-modifica" onclick="window.location.href='/trips.html?editId=${viaggio.id}'">MODIFICA PASSAGGIO</button>
            <button class="btn-elimina" onclick="eliminaViaggio('${viaggio.id}')">ELIMINA PASSAGGIO</button>
          </div>
        `;
        contenitoreViaggi.appendChild(card);
      });
    } catch (err) {
      contenitoreViaggi.innerHTML = '<p style="color: #f87171; font-size: 14px;">Errore nel caricamento dei viaggi.</p>';
    }
  }

  // Funzione per eliminare un viaggio
  window.eliminaViaggio = async function(id) {
    if (!confirm('Sei sicuro di voler eliminare questo viaggio?')) return;

    try {
      const res = await fetch(`/api/trips/${id}`, { method: 'DELETE' });
      const data = await res.json();
      alert(data.message);
      caricaMieiViaggi();
    } catch (err) {
      alert('Errore durante l\'eliminazione del viaggio.');
    }
  };

  caricaMieiViaggi();

  // --- 4. Gestione Logout ---
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    alert('Disconnessione effettuata con successo.');
    window.location.href = '/login.html';
  });
}