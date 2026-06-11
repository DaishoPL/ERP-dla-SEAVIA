import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';

export default function TechnicianSearch({ searchQuery, setSearchQuery, onSearch, isLoading }) {
  // Zamiast liczyć piksele (co spowalniało aplikację), sprawdzamy tylko stan "czy przescrollowano"
  const [isScrolled, setIsScrolled] = useState(false);
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);
  const searchRef = useRef(null);
  
  useEffect(() => {
    const handleScroll = (e) => {
      const scrollY = e.target.scrollTop;
      
      // Włączamy tryb zwinięty, jeśli scroll zjedzie poniżej 50px
      if (scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
        setIsManuallyExpanded(false); // Reset po powrocie na samą górę
      }
    };

    const scrollParent = searchRef.current?.closest('.overflow-y-auto');
    if (scrollParent) {
      // Używamy passive: true dla lepszej wydajności scrollowania
      scrollParent.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollParent.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch();
      setIsManuallyExpanded(false);
    }
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    // Jeśli pole jest zwinięte, kliknięcie je rozwija
    if (isCollapsed) {
      setIsManuallyExpanded(true);
    } else {
      // Jeśli jest rozwinięte, kliknięcie uruchamia wyszukiwanie
      onSearch();
      if (isScrolled) setIsManuallyExpanded(false); // Zwijamy z powrotem jeśli jesteśmy w połowie strony
    }
  };

  // Całkowity stan: jesteśmy zjechani w dół i NIE rozwinęliśmy pola ręcznie
  const isCollapsed = isScrolled && !isManuallyExpanded;

  return (
    <div 
      ref={searchRef}
      className="sticky top-0 z-30 py-4 -mx-4 px-4 pointer-events-none"
    >
      <div 
        className={`h-[65px] bg-white rounded-full border-2 flex items-center shadow-xl overflow-hidden pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isCollapsed ? 'w-[65px] border-blue-600 bg-blue-50' : 'w-full border-blue-400/30'}
        `}
      >
        
        {/* Płynnie zwijające się pole tekstowe */}
        <input 
          type="text" 
          placeholder="Szukaj..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`h-full bg-transparent border-none text-sm font-black text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${isCollapsed ? 'w-0 opacity-0 px-0 pointer-events-none' : 'w-full flex-1 opacity-100 pl-6 pr-2'}
          `}
        />
        
        {/* Sztywny kontener na lupę (zawsze 61px szerokości, dzięki czemu lupa NIGDY nie znika/skacze) */}
        <div className="shrink-0 w-[61px] flex items-center justify-center">
          {isLoading ? (
            <div className="w-[42px] h-[42px] flex items-center justify-center text-blue-600">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <button 
              onClick={handleToggle}
              className={`w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 outline-none
                ${isCollapsed 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/40' 
                  : 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700'
                }
              `}
            >
              <Search size={18} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}