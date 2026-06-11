import React, { useState } from 'react';
import { Search, AlertCircle, LayoutDashboard } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import TechnicianSearch from '../components/TechnicianSearch';
import TechnicianCard from '../components/TechnicianCard';
import TechnicianWorkspace from '../components/TechnicianWorkspace';
import PreviewPane from '../components/PreviewPane';

const API_URL = 'http://localhost:3000';
const BRIDGE_URL = 'http://localhost:4000';

export default function TechnicianProfile() {
  // ZMIANA: Pobieramy zapamiętany stan z ramy MainLayout, aby nie znikał przy zmianie kart
  const { searchQuery, setSearchQuery, tech, setTech, preview, setPreview } = useOutletContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setTech(null);
    setPreview(null); 

    try {
      const cleanTerm = searchQuery.replace(/[\s-]/g, '');
      const isNumber = /^\d+$/.test(cleanTerm);
      
      const params = new URLSearchParams();
      
      if (searchQuery.toUpperCase().startsWith('SEAVIA')) {
        params.append('technicians_id', `eq.${searchQuery.toUpperCase()}`);
      } else if (searchQuery.includes('@')) {
        params.append('email', `eq.${searchQuery}`);
      } else if (isNumber) {
        params.append('or', `(nip.eq.${cleanTerm},pesel.eq.${cleanTerm})`);
      } else {
        const trimmedText = searchQuery.trim();
        params.append('or', `(surname.ilike.*${trimmedText}*,first_name.ilike.*${trimmedText}*)`);
      }

      params.append('select', '*,technicians_phones(*),technicians_skills(*,skills_dictionary!skill_id(skill_name)),language_skills(*)');
      params.append('limit', '1');

      const fullUrl = `${API_URL}/technicians?${params.toString()}`;
      
      const userStr = localStorage.getItem('seavia_user');
      const token = userStr ? JSON.parse(userStr).token : null; 
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(fullUrl, { headers });

      if (!response.ok) throw new Error(`Błąd serwera API (Kod: ${response.status})`);
      
      const data = await response.json();

      if (data && data.length > 0) {
        const dbTech = data[0];
        
        // Domyślny avatar (na wypadek braku zdjęcia w S3)
        let avatarUrl = `https://ui-avatars.com/api/?name=${dbTech.first_name}+${dbTech.surname}&background=0f172a&color=fff&size=200&font-size=0.33`;
        
        // POBIERANIE ZDJĘCIA Z CHMURY PRZEZ MOST
        if (dbTech.photo_link) {
          try {
             const bridgeRes = await fetch(`${BRIDGE_URL}/api/get-secure-link?filePath=${encodeURIComponent(dbTech.photo_link)}`);
             if (bridgeRes.ok) {
               const bridgeData = await bridgeRes.json();
               if (bridgeData.secureUrl) avatarUrl = bridgeData.secureUrl;
             }
          } catch (e) {
             console.error("Błąd połączenia z mostem (port 4000):", e);
          }
        }

        const getLangScore = (level) => {
          const map = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 5 };
          return map[level] || 1;
        };

        setTech({
          id: dbTech.technicians_id,
          firstName: dbTech.first_name,
          surname: dbTech.surname,
          photoUrl: avatarUrl,
          b2bName: dbTech.b2b_name,
          nip: dbTech.nip || 'Brak NIP w bazie',
          email: dbTech.email || 'Brak e-mail',
          phones: dbTech.technicians_phones || [],
          skills: (dbTech.technicians_skills || []).map(s => ({ 
            name: s.skills_dictionary?.skill_name || s.skill_id, 
            level: s.skill_level_id 
          })),
          languages: (dbTech.language_skills || []).map(l => ({ 
            name: l.language_name, 
            levelCode: l.level, 
            levelScore: getLangScore(l.level) 
          }))
        });

      } else {
        setError(`Nie znaleziono pracownika dla frazy: "${searchQuery}"`);
      }

    } catch (err) {
      console.error(err);
      setError(err.message === 'Failed to fetch' ? 'Brak połączenia z API (Port 3000).' : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto h-full w-full px-4 lg:px-8">
      
      {/* 🔴 KOLUMNA 1: Lewa (Szukajka + Wizytówka) */}
      <div className="w-full lg:flex-[25] min-w-0 flex flex-col gap-6 shrink-0 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-6 pr-1">
        <TechnicianSearch 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={executeSearch}
          isLoading={isLoading}
        />

        {error && !isLoading && (
           <div className="bg-red-50 rounded-3xl border border-red-100 p-6 flex flex-col items-center text-center text-red-600 shadow-sm animate-in fade-in zoom-in duration-300">
              <AlertCircle size={32} className="mb-3 opacity-80" />
              <p className="font-bold text-sm">{error}</p>
           </div>
        )}

        {!tech && !isLoading && !error && (
           <div className="bg-white/60 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center text-slate-400">
              <Search size={48} className="mb-4 opacity-20" />
              <p className="font-bold text-sm text-slate-500">Rozpocznij wyszukiwanie</p>
              <p className="text-xs mt-2">Wpisz NIP, E-mail, Nazwisko lub PESEL powyżej.</p>
           </div>
        )}

        <TechnicianCard tech={tech} />
      </div>

      {/* 🔴 KOLUMNA 2 i 3 (Przestrzeń Robocza i Podgląd) */}
      {!tech ? (
         <div className="hidden lg:flex w-full lg:flex-[75] min-w-0 h-full pt-4 pb-6">
            <div className="w-full h-full bg-white/60 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
              <div className="w-24 h-24 bg-white border border-slate-200 shadow-sm rounded-[2rem] flex items-center justify-center mb-6 text-slate-300">
                <LayoutDashboard size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-700 mb-3 tracking-tight">Panel Szczegółów</h3>
              <p className="text-slate-500 max-w-md leading-relaxed text-sm">
                Wyszukaj pracownika po lewej stronie, aby załadować interaktywne moduły z możliwością szybkiego podglądu.
              </p>
            </div>
         </div>
      ) : (
         <>
           <div className="w-full lg:flex-[30] min-w-0 flex flex-col h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pt-4 pb-6 pr-1">
             <TechnicianWorkspace tech={tech} preview={preview} setPreview={setPreview} />
           </div>

           <div className="w-full lg:flex-[45] min-w-0 h-full pt-4 pb-6">
             <PreviewPane preview={preview} />
           </div>
         </>
      )}

    </div>
  );
}