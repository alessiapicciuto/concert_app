import { Link } from 'react-router-dom';
import '../styles/trips.css';

export default function TripsView({
  editId,
  concertName,
  setConcertName,
  departureCity,
  setDepartureCity,
  meetingPoint,
  setMeetingPoint,
  departureTime,
  setDepartureTime,
  availableSeats,
  setAvailableSeats,
  pricePerSeat,
  setPricePerSeat,
  listaConcerti,
  errore,
  handleSubmit
}) {
  // Ricaviamo un elenco unico di città dai concerti disponibili per il datalist delle partenze
  const cittaDisponibili = Array.from(new Set(listaConcerti.map(function(c) { return c.city; })));

  return (
    <div className="trips-page">
      <div className="scheda-viaggio">
        <h2>{editId ? 'MODIFICA PASSAGGIO' : 'OFFRI UN PASSAGGIO'}</h2>
      
        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label>CONCERTO DI DESTINAZIONE</label>
            <input
              type="text"
              list="elenco-concerti"
              required
              placeholder="es.: Korn (Assago)"
              value={concertName}
              onChange={function (e) { setConcertName(e.target.value); }}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
            <datalist id="elenco-concerti">
              {listaConcerti.map(function (c) {
                const idConcerto = c.id || c._id;
                const testo = (c.title || c.artist) + ' (' + c.city + ')';
                return <option key={idConcerto} value={testo} />;
              })}
            </datalist>
          </div>

          <div className="campo">
            <label>CITTA' DI PARTENZA</label>
            <input
              type="text"
              list="elenco-citta"
              required
              placeholder="es.: Milano"
              value={departureCity}
              onChange={function (e) { setDepartureCity(e.target.value); }}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
            <datalist id="elenco-citta">
              {cittaDisponibili.map(function (città, index) {
                return <option key={index} value={città} />;
              })}
            </datalist>
          </div>

          <div className="campo">
            <label>PUNTO DI RITROVO</label>
            <input
              type="text"
              required
              placeholder="es.: Stazione Centrale"
              value={meetingPoint}
              onChange={function (e) { setMeetingPoint(e.target.value); }}
            />
          </div>

          <div className="campo">
            <label>ORARIO DI PARTENZA</label>
            <input
              type="time"
              required
              value={departureTime}
              onChange={function (e) { setDepartureTime(e.target.value); }}
            />
          </div>

          <div className="campo">
            <label>POSTI DISPONIBILI</label>
            <input
              type="number"
              min="1"
              max="6"
              required
              placeholder="es.: 3"
              value={availableSeats}
              onChange={function (e) { setAvailableSeats(e.target.value); }}
            />
          </div>

          <div className="campo">
            <label>PREZZO PER PASSEGGERO</label>
            <input
              type="number"
              min="0"
              required
              placeholder="es.: 15"
              value={pricePerSeat}
              onChange={function (e) { setPricePerSeat(e.target.value); }}
            />
          </div>

          <button type="submit">
            {editId ? 'Salva Modifiche' : 'pubblica annuncio'}
          </button>

          {errore && <div className="messaggio-esito">{errore}</div>}
        </form>

        <div className="link-ritorno">
          <Link to="/profile">← Torna all'area personale</Link>
        </div>
      </div>
    </div>
  );
}