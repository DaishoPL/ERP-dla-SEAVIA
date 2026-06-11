import React, { useState, useEffect } from 'react';
import { ChevronDown, Settings, LogOut, Loader2, ShieldCheck } from 'lucide-react';

const API_URL = 'http://localhost:3000';
const BRIDGE_URL = 'http://localhost:4000';

export default function Topbar({ title }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [isLoadingLogo, setIsLoadingLogo] = useState(true);
  
  // Pobranie Adama Bogdańskiego z pamięci (po zalogowaniu)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('seavia_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  useEffect(() => {
    // Pobieranie Logo przez Most
    const fetchLogo = async () => {
      try {
        const dbRes = await fetch(`${API_URL}/app_assets?asset_id=eq.LOGO_MAIN`);
        const dbData = await dbRes.json();
        if (dbData?.[0]?.file_path) {
          const bridgeRes = await fetch(`${BRIDGE_URL}/api/get-secure-link?filePath=${encodeURIComponent(dbData[0].file_path)}`);
          const bridgeData = await bridgeRes.json();
          if (bridgeData.secureUrl) setLogoUrl(bridgeData.secureUrl);
        }
      } catch (err) {
        console.error('Błąd logo:', err);
      } finally {
        setIsLoadingLogo(false);
      }
    };
    fetchLogo();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('seavia_user');
    window.location.href = '/'; // Twardy powrót do bramy logowania
  };

  // 👥 MAPOWANIE ZGODNIE Z TWOJĄ SPECYFIKACJĄ (8 RÓL)
  const getRoleDisplayName = (code) => {
    const matrix = {
      'adm': 'Administrator',
      'sit': 'Site Manager',
      'ceo': 'Zarząd',
      'for': 'Foreman / Brygadzista',
      'pm': 'Projekt Menadżer',
      'hr': 'Kadry',
      'tl': 'Team Leader',
      'tech': 'Technik'
    };
    return matrix[code?.toLowerCase()] || code || 'Pracownik';
  };

  if (!currentUser) return null;

  const initials = `${currentUser.firstName?.[0] || ''}${currentUser.surname?.[0] || ''}`.toUpperCase();

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
      
      {/* LOGO I TYTUŁ SEKPCJI */}
      <div className="flex items-center gap-5">
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          {isLoadingLogo ? (
            <Loader2 size={16} className="text-blue-300 animate-spin" />
          ) : logoUrl ? (
            <img src={logoUrl} alt="Seavia" className="h-full w-full object-contain" />
          ) : (
            <div className="w-full h-full bg-[#002C69] rounded-lg flex items-center justify-center font-bold text-white text-[10px]">SV</div>
          )}
        </div>
        <h1 className="font-medium text-lg text-blue-100 tracking-wide">{title}</h1>
      </div>
      
      {/* TWOJE KONTO (ADMIN) */}
      <div className="relative">
        <button 
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="flex items-center gap-3 hover:bg-slate-800 p-1.5 pr-4 rounded-full border border-slate-700 transition-colors group"
        >
          <div className="w-8 h-8 bg-[#002C69] rounded-full flex items-center justify-center text-blue-100 font-bold text-xs shadow-sm ring-1 ring-blue-800/50">
            {initials}
          </div>
          
          <div className="hidden sm:flex flex-col items-start mr-1">
            <span className="text-sm font-medium text-blue-200 group-hover:text-white leading-tight">
              {currentUser.firstName} {currentUser.surname}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck size={10} className="text-blue-400" />
              <span className="text-[9px] font-bold text-blue-400/80 uppercase tracking-widest leading-tight">
                {getRoleDisplayName(currentUser.role)}
              </span>
            </div>
          </div>

          <ChevronDown size={14} className={`text-blue-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* MENU PROFILU */}
        {isUserMenuOpen && (
          <div className="absolute right-0 mt-3 w-56 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 py-2 z-50 animate-in slide-in-from-top-2">
            <div className="px-5 py-3 border-b border-slate-700 mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase">Zalogowany jako</p>
              <p className="text-sm text-white font-medium mt-1 truncate">{currentUser.firstName} {currentUser.surname}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser.id}</p>
            </div>
            
            <button className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-blue-200 hover:bg-slate-700 transition-colors">
              <Settings size={16} /> Ustawienia Konta
            </button>
            <div className="h-px bg-slate-700 my-1 mx-3"></div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-red-400 hover:bg-slate-700 transition-colors font-medium"
            >
              <LogOut size={16} /> Wyloguj się
            </button>
          </div>
        )}
      </div>

    </header>
  );
}