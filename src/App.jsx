import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import TechnicianProfile from './pages/TechnicianProfile';
import Login from './pages/Login';
import { Table, Filter, Bell } from 'lucide-react'; // Ikonki do makiet

// --- MAKIETY PUSTYCH EKRANÓW ---

const DataExport = () => (
  <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10 text-center animate-in fade-in duration-500">
    <Filter size={48} className="mb-4 opacity-20" />
    <h1 className="text-2xl font-black text-slate-700 mb-2 tracking-tight">Filtry i Eksport</h1>
    <p>Moduł do zaawansowanego filtrowania i eksportu danych do plików CSV/PDF pojawi się tutaj.</p>
  </div>
);

const ExcelView = () => (
  <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10 text-center animate-in fade-in duration-500">
    <Table size={48} className="mb-4 opacity-20" />
    <h1 className="text-2xl font-black text-slate-700 mb-2 tracking-tight">Widok Tabel (Excel)</h1>
    <p>Surowy podgląd i edycja bazy danych w formie siatki pojawi się w tym miejscu.</p>
  </div>
);

const Notifications = () => (
  <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10 text-center animate-in fade-in duration-500">
    <Bell size={48} className="mb-4 opacity-20 text-amber-500" />
    <h1 className="text-2xl font-black text-slate-700 mb-2 tracking-tight">Centrum Powiadomień</h1>
    <p>Tutaj pojawią się alerty serwerowe (np. wygasające dokumenty, braki w sprzęcie).</p>
  </div>
);

// --- GŁÓWNA LOGIKA APLIKACJI ---

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Strażnik: Sprawdza przy uruchomieniu, czy mamy bilet w przeglądarce
  useEffect(() => {
    const storedUser = localStorage.getItem('seavia_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  if (isLoading) return null;

  // BLOKADA: Ekran logowania
  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  // DOSTĘP PRZYZNANY: Routing aplikacji
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Domyślnie ładujemy profil technika po zalogowaniu */}
          <Route index element={<TechnicianProfile />} />
          
          {/* Poszczególne ścieżki z Menu Bocznego */}
          <Route path="profile" element={<TechnicianProfile />} />
          <Route path="export" element={<DataExport />} />
          <Route path="excel-view" element={<ExcelView />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}