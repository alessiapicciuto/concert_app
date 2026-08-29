// riferimenti a HTML
const sezioneAccesso = document.getElementById('sezione-login');
const sezioneRegistrazione = document.getElementById('sezione-registrazione');

const toRegisterBtn = document.getElementById('passa-a-registrazione');
const toAccessBtn = document.getElementById('passa-a-login');

const formAccesso = document.getElementById('form-login');
const formRegistrazione = document.getElementById('form-registrazione');

const erroreAccesso = document.getElementById('errore-login');
const erroreRegistrazione = document.getElementById('errore-registrazione');

// switch tra login e registrazione 
toRegisterBtn.addEventListener('click', () => {
  sezioneAccesso.classList.add('hidden');
  sezioneRegistrazione.classList.remove('hidden');
  erroreAccesso.textContent = '';
});

toAccessBtn.addEventListener('click', () => {
  sezioneRegistrazione.classList.add('hidden');
  sezioneAccesso.classList.remove('hidden');
  erroreRegistrazione.textContent = '';
});

// invio form di registrazione 
formRegistrazione.addEventListener('submit', async (e) => {
  e.preventDefault(); // Impedisce il ricaricamento della pagina

  const nome = document.getElementById('reg-nome').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  try {
    const risposta = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nome, email: email, password: password })
    });

    const dati = await risposta.json();

    if (!risposta.ok) {
      erroreRegistrazione.textContent = dati.message;
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify(dati.user));
    alert('Registrazione completata con successo');
    //prova per vedere se funziona il flusso 
    window.location.href = '/profilo.html';
    // quando miri crea l'index metto questo e cnacello quello di sopra
    //window.location.href = '/';
  } catch (err) {
    erroreRegistrazione.textContent = 'Errore di connessione con il server';
  }
});

// invio form di accesso 
formAccesso.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const risposta = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    });

    const dati = await risposta.json();

    if (!risposta.ok) {
      erroreAccesso.textContent = dati.message;
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify(dati.user));
    alert(`Bentornato, ${dati.user.name}!`);
    // prova per controllare se funziona il flusso
     window.location.href = '/profilo.html';
    // quando miri crea l'index metto questo e cnacello quello di sopra
    //window.location.href = '/';
  } catch (err) {
    erroreAccesso.textContent = 'Errore di connessione con il server';
  }
});