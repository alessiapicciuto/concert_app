import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ConcertDetailPage from './pages/ConcertDetailPage';
import TripsPage from './pages/TripsPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Vecchio index.html */}
        <Route path="/" element={<HomePage />} />

        {/* Vecchio login.html */}
        <Route path="/login" element={<LoginPage />} />

        {/* Vecchio concert.html?id=... */}
        <Route path="/concert/:id" element={<ConcertDetailPage />} />

        {/* Vecchio trips.html */}
        <Route path="/trips" element={<TripsPage />} />

        {/* Vecchio profilo.html */}
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}