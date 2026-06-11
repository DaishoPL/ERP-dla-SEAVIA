import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  // --- ZMIANA: Globalna pamięć dla profilu technika ---
  // Trzymamy to tutaj, aby dane przetrwały przełączanie zakładek w menu bocznym
  const [searchQuery, setSearchQuery] = useState('');
  const [tech, setTech] = useState(null);
  const [preview, setPreview] = useState(null);

  // Dynamiczny tytuł belki zsynchronizowany z Sidebar.jsx
  const getTitle = () => {
    switch(location.pathname) {
      case '/': 
      case '/profile': 
        return 'Technik';
      case '/export': 
        return 'Filtry';
      case '/excel-view': 
        return 'Tabele';
      case '/notifications': 
        return 'Powiadomienia';
      default: 
        return 'SEAVIA ERP';
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden">
      {/* Menu Boczne */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Górna Belka (otrzymuje zsynchronizowany tytuł) */}
        <Topbar title={getTitle()} />
        
        {/* ZMIANA: Zablokowano główny suwak strony (overflow-hidden), aby każda kolumna mogła przewijać się niezależnie */}
        <main className="flex-1 overflow-hidden">
           {/* ZMIANA: Przekazujemy stan do wewnątrz przez context */}
           <Outlet context={{ searchQuery, setSearchQuery, tech, setTech, preview, setPreview }} /> 
        </main>
      </div>
    </div>
  );
}