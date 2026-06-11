import React, { useState, useEffect } from 'react';
import { Phone, Mail, FileText, Briefcase, Globe } from 'lucide-react';
import ContractReadinessWidget from './ContractReadinessWidget';

const API_URL = 'http://localhost:3000';
const BRIDGE_URL = 'http://localhost:4000';

// --- KOMPONENT POMOCNICZY: KROPKI POZIOMU ---
const LevelDots = ({ score }) => {
  const safeScore = parseInt(score) || 1;
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((dot) => (
        <div 
          key={dot} 
          className={`w-2.5 h-2.5 rounded-full transition-all ${
            dot <= safeScore 
              ? 'bg-blue-600 shadow-sm shadow-blue-400/50' 
              : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
};

// --- KOMPONENT PIECZĄTKI (STAMP) - STYL POCZTOWY ---
const StatusStamp = ({ type }) => {
  if (type === 'B2B') {
    return (
      <div className="absolute top-[155px] right-8 z-40 transform rotate-[-12deg] pointer-events-none select-none opacity-90 group-hover:rotate-[-8deg] transition-transform duration-500">
        {/* Okrągła pieczęć B2B (Prawa strona awatara) */}
        <div className="w-[95px] h-[95px] rounded-full border-[4px] border-double border-indigo-800/90 flex flex-col items-center justify-center bg-white/10 backdrop-blur-[1px] p-1.5 shadow-[inset_0_0_10px_rgba(49,46,129,0.1)]">
          <div className="w-full h-full rounded-full border-[1.5px] border-indigo-800/40 flex flex-col items-center justify-center relative">
            <span className="text-[7px] font-black uppercase text-indigo-800/80 tracking-[0.2em] absolute top-2">Verified</span>
            <div className="py-0.5 px-2 bg-white/20">
               <span className="text-indigo-900 text-xl font-black uppercase tracking-wider">B2B</span>
            </div>
            <div className="absolute bottom-2 flex flex-col items-center">
              <span className="text-[5px] font-black uppercase text-indigo-800/70 tracking-tighter leading-none">Corporate</span>
              <span className="text-[5px] font-black uppercase text-indigo-800/70 tracking-tighter leading-none">Standard</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="absolute top-[160px] left-8 z-40 transform rotate-[10deg] pointer-events-none select-none opacity-90 group-hover:rotate-[5deg] transition-transform duration-500">
      {/* Kwadratowa błękitna pieczęć B2C (Lewa strona awatara) */}
      <div className="w-[88px] h-[88px] border-[4px] border-double border-sky-500/90 rounded-[1.5rem] flex flex-col items-center justify-center bg-white/10 backdrop-blur-[1px] p-1.5 shadow-[inset_0_0_10px_rgba(14,165,233,0.1)]">
        <div className="w-full h-full border-[1.5px] border-sky-500/40 rounded-[1rem] flex flex-col items-center justify-center">
           <span className="text-[6px] font-black uppercase text-sky-500/70 tracking-[0.3em] mb-1">Profile Type</span>
           <span className="text-sky-600 text-xl font-black uppercase tracking-widest">B2C</span>
           <div className="h-px w-10 bg-sky-500/40 my-1.5" />
           <span className="text-sky-500/80 text-[8px] font-black uppercase tracking-[0.4em]">Standard</span>
        </div>
      </div>
    </div>
  );
};

export default function TechnicianCard({ tech }) {
  const [bgUrl, setBgUrl] = useState(null);
  const [readiness, setReadiness] = useState(null);

  // Pobieranie tła statku
  useEffect(() => {
    const fetchBackground = async () => {
      try {
        const res = await fetch(`${BRIDGE_URL}/api/get-secure-link?filePath=system/assets/ship.jpg`);
        if (res.ok) {
          const data = await res.json();
          if (data.secureUrl) setBgUrl(data.secureUrl);
        }
      } catch (err) {
        console.warn("Błąd pobierania tła statku:", err);
      }
    };
    fetchBackground();
  }, []);

  // Odpytywanie o gotowość kontraktową (dla tła wizytówki)
  useEffect(() => {
    if (!tech?.id) return;
    const fetchReadiness = async () => {
      setReadiness(null);
      try {
        const url = `${API_URL}/v_contract_readiness?technicians_id=eq.${tech.id}`;
        const userStr = localStorage.getItem('seavia_user');
        const token = userStr ? JSON.parse(userStr).token : null; 
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(url, { headers });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) setReadiness(data[0]); 
        }
      } catch (err) {
        console.error("Błąd pobierania gotowości:", err);
      }
    };
    fetchReadiness();
  }, [tech?.id]);

  if (!tech) return null;

  // Logika rozpoznawania braków dla koloru tła
  const isJDG = readiness?.is_jdg || false;
  const missingItems = isJDG 
    ? (Array.isArray(readiness?.missing_jdg) ? readiness.missing_jdg : []) 
    : (Array.isArray(readiness?.missing_standard) ? readiness.missing_standard : []);
  const isReady = readiness ? missingItems.length === 0 : true;
  const showLemonBg = readiness && !isReady;
  const hasReadinessData = readiness !== null;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-500 shrink-0 relative z-10 group">
      
      {/* PIECZĄTKA STATUSU */}
      {hasReadinessData && <StatusStamp type={isJDG ? 'B2B' : 'B2C'} />}

      {/* GÓRA: TŁO I AWATAR */}
      <div 
        className="h-48 bg-slate-900 relative bg-cover bg-center transition-all duration-700"
        style={bgUrl ? { backgroundImage: `url(${bgUrl})` } : {}}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/10 to-slate-900/60"></div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-30">
          <div className="w-48 h-48 rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-white">
            <img 
              src={tech.photoUrl} 
              alt={`Avatar`} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
          </div>
        </div>
      </div>

      {/* ŚRODEK: IMIĘ I ID */}
      <div className={`pt-14 pb-8 px-6 text-center border-b border-slate-100 relative z-20 transition-colors duration-500 ${
        showLemonBg ? 'bg-yellow-100/70' : 'bg-white'
      }`}>
        <h2 className="text-2xl font-black text-slate-800 leading-tight">
          {tech.firstName} {tech.surname}
        </h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
          ID: {tech.id}
        </p>
      </div>

      {/* ŚRODEK: UMIEJĘTNOŚCI I JĘZYKI */}
      <div className="p-6 border-b border-slate-100 space-y-6 bg-white">
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Briefcase size={14} /> Umiejętności (API)
          </h3>
          {!tech.skills || tech.skills.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Brak przypisanych umiejętności.</p>
          ) : (
            <div className="space-y-3">
              {tech.skills.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">{skill.name}</span>
                  <LevelDots score={skill.level} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Globe size={14} /> Języki
          </h3>
          {!tech.languages || tech.languages.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Brak przypisanych języków.</p>
          ) : (
            <div className="space-y-3">
              {tech.languages.map((lang, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">{lang.name}</span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded border border-blue-200">
                      {lang.levelCode}
                    </span>
                  </div>
                  <LevelDots score={lang.levelScore} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DÓŁ: DANE KONTAKTOWE */}
      <div className="p-6 space-y-3 bg-white">
        <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-2xl group transition-colors">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0 group-hover:text-blue-600 transition-colors">
            <FileText size={18} />
          </div>
          <div className="overflow-hidden text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">NIP ({tech.b2bName || 'Brak'})</p>
            <p className="text-sm font-bold text-slate-800">{tech.nip}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-2xl group transition-colors">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0 group-hover:text-blue-600 transition-colors">
            <Mail size={18} />
          </div>
          <div className="overflow-hidden w-full text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Adres E-mail</p>
            <p className="text-sm font-bold text-slate-800 truncate w-full pr-2" title={tech.email}>{tech.email}</p>
          </div>
        </div>
      </div>

      {/* WIDGET GOTOWOŚCI - ZINTEGROWANY SEGMENT */}
      <div className="p-6 border-t border-slate-100 bg-white">
        <ContractReadinessWidget techId={tech.id} />
      </div>

    </div>
  );
}