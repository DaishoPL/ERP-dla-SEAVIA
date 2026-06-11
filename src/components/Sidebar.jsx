import React, { useEffect, useRef } from 'react';
import { User, Filter, Table, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const sidebarRef = useRef(null);

  // Sprawdzenie aktywnej ścieżki
  const isActive = (path) => location.pathname === path || (path === '/profile' && location.pathname === '/');

  // AUTO-ZAMYKANIE: Mechanizm wykrywania kliknięcia poza menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        toggleSidebar();
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen, toggleSidebar]);

  // Zamknij przy zmianie strony
  useEffect(() => {
    if (isOpen) toggleSidebar();
  }, [location.pathname]);

  const handleToggle = (e) => {
    e.stopPropagation();
    toggleSidebar();
  };

  return (
    <>
      {/* Warstwa tła dla mobile (backdrop) */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300" />
      )}

      <aside 
        ref={sidebarRef}
        className={`h-full transition-all duration-500 ease-in-out flex flex-col shrink-0 z-50 fixed md:relative
          ${isOpen 
            ? 'w-72 bg-slate-900 translate-x-0 shadow-2xl' 
            : 'w-20 bg-slate-900 -translate-x-full md:translate-x-0 border-r border-slate-800'
          }
        `}
      >
        
        {/* NAGŁÓWEK: Przycisk zakotwiczony w lewej sekcji w-20 */}
        <div className="h-16 flex items-center border-b border-slate-800 relative overflow-hidden">
          
          {/* KONTENER PRZYCISKU (Stała szerokość 80px - Przycisk stoi nieruchomo) */}
          <div className="w-20 h-full flex items-center justify-center shrink-0">
            <button 
              onClick={handleToggle} 
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all duration-300 outline-none"
              aria-label="Toggle Menu"
            >
              {/* KONTENER IKONY: Proporcje 18px x 12px */}
              <div className="w-[18px] h-[12px] relative flex flex-col justify-between items-center overflow-visible">
                
                {/* Belka Górna: Grubość 3px, zbiega się w centrum (top 4.5px) */}
                <span 
                  className={`absolute h-[3px] bg-current rounded-full transition-all duration-500 ease-in-out transform origin-left
                    ${isOpen 
                      ? 'w-[11px] rotate-[-45deg] top-[4.5px] left-[1.5px]' 
                      : 'w-full rotate-0 top-0 left-0'
                    }`} 
                />
                
                {/* Belka Środkowa (Trzon): Grubość 3px, wyrównana do środka */}
                <span 
                  className={`absolute h-[3px] bg-current rounded-full transition-all duration-500 ease-in-out transform origin-left top-[4.5px] left-0
                    ${isOpen 
                      ? 'w-[14px] translate-x-[1.5px]' 
                      : 'w-full'
                    }`} 
                />
                
                {/* Belka Dolna: Grubość 3px, zbiega się w tym samym punkcie co górna */}
                <span 
                  className={`absolute h-[3px] bg-current rounded-full transition-all duration-500 ease-in-out transform origin-left
                    ${isOpen 
                      ? 'w-[11px] rotate-[45deg] top-[4.5px] left-[1.5px]' 
                      : 'w-full rotate-0 top-[9px] left-0'
                    }`} 
                />
              </div>
            </button>
          </div>

          {/* Napis System Seavia - wsuwa się obok nieruchomego hamburgera */}
          <div className={`transition-all duration-500 whitespace-nowrap ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
            <span className="font-bold uppercase tracking-wider text-[10px] text-blue-400">
              System Seavia
            </span>
          </div>
        </div>

        {/* LISTA LINKÓW */}
        <nav className="flex-1 flex flex-col gap-2 p-4 mt-4">
          
          <Link 
            to="/profile" 
            className={`flex items-center gap-4 p-3.5 rounded-xl transition-all group ${
              isActive('/profile') 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <div className="w-6 flex justify-center shrink-0">
              <User size={20} className={isActive('/profile') ? 'text-white' : 'group-hover:text-blue-400'} />
            </div>
            {isOpen && <span className="font-bold text-sm tracking-tight animate-in fade-in duration-300">Karta Pracownika</span>}
          </Link>

          <Link 
            to="/export" 
            className={`flex items-center gap-4 p-3.5 rounded-xl transition-all group ${
              isActive('/export') 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <div className="w-6 flex justify-center shrink-0">
              <Filter size={20} className={isActive('/export') ? 'text-white' : 'group-hover:text-blue-400'} />
            </div>
            {isOpen && <span className="font-bold text-sm tracking-tight animate-in fade-in duration-300">Filtry i Raporty</span>}
          </Link>

          <Link 
            to="/excel-view" 
            className={`flex items-center gap-4 p-3.5 rounded-xl transition-all group ${
              isActive('/excel-view') 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <div className="w-6 flex justify-center shrink-0">
              <Table size={20} className={isActive('/excel-view') ? 'text-white' : 'group-hover:text-blue-400'} />
            </div>
            {isOpen && <span className="font-bold text-sm tracking-tight animate-in fade-in duration-300">Podgląd Bazy</span>}
          </Link>

          <Link 
            to="/notifications" 
            className={`flex items-center gap-4 p-3.5 rounded-xl transition-all group ${
              isActive('/notifications') 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <div className="w-6 flex justify-center shrink-0">
              <Bell size={20} className={isActive('/notifications') ? 'text-white' : 'group-hover:text-blue-400'} />
            </div>
            {isOpen && <span className="font-bold text-sm tracking-tight animate-in fade-in duration-300">Powiadomienia</span>}
          </Link>

        </nav>

        {/* Status dolny */}
        {isOpen && (
          <div className="p-6 bg-slate-950/30 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Version 1.2.0 Stable</p>
          </div>
        )}
      </aside>
    </>
  );
}