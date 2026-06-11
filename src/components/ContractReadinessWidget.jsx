import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, FileWarning, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:3000';

export default function ContractReadinessWidget({ techId }) {
  const [readiness, setReadiness] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!techId) return;

    const fetchReadiness = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const url = `${API_URL}/v_contract_readiness?technicians_id=eq.${techId}`;
        const userStr = localStorage.getItem('seavia_user');
        const token = userStr ? JSON.parse(userStr).token : null; 
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error('Błąd odczytu analizatora');
        const data = await response.json();
        if (data && data.length > 0) setReadiness(data[0]);
      } catch (err) {
        setError('Błąd weryfikacji');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReadiness();
  }, [techId]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-2 text-slate-400">
        <Loader2 className="animate-spin" size={16} />
        <span className="text-xs font-bold uppercase tracking-widest text-[10px]">Analiza danych...</span>
      </div>
    );
  }

  if (error || !readiness) return null;

  const isJDG = readiness.is_jdg;
  const missingItems = isJDG ? readiness.missing_jdg : readiness.missing_standard;
  const isReady = missingItems.length === 0;

  return (
    <div className="w-full text-left">
      {/* NAGŁÓWEK SEKPCJI */}
      <div className="flex items-center justify-between mb-4">
         <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={14} className="text-blue-600" /> Gotowość Kontraktowa
         </h3>
         <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-white ${
            isJDG ? 'text-indigo-600 border-indigo-200' : 'text-slate-500 border-slate-200'
         }`}>
            {isJDG ? 'Profil B2B' : 'Standard'}
         </span>
      </div>

      {/* TREŚĆ ANALIZATORA */}
      {isReady ? (
         <div className="flex items-center gap-4 py-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0">
               <CheckCircle2 size={20} />
            </div>
            <div>
               <p className="text-sm font-bold text-slate-800 leading-tight">Dane kompletne</p>
               <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter mt-0.5">Gotowy do umowy</p>
            </div>
         </div>
      ) : (
         <div className="space-y-4">
            <div className="flex items-center gap-4 py-1">
               {/* CZERWONY AKCENT DLA BRAKÓW */}
               <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0 shadow-sm">
                  <FileWarning size={20} />
               </div>
               <div>
                  <p className="text-sm font-bold text-slate-800 leading-tight">Wymagane uzupełnienie</p>
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-tighter mt-0.5">
                    Brakuje {missingItems.length} elementów
                  </p>
               </div>
            </div>
            
            {/* CZERWONE TAGI DANYCH - Przywrócone zgodnie z Twoją prośbą */}
            <div className="flex flex-wrap gap-2 pl-0.5">
               {missingItems.map((item, idx) => (
                  <span key={idx} className="bg-rose-50 border border-rose-100 text-rose-600 text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-sm animate-in fade-in zoom-in duration-300">
                     {item}
                  </span>
               ))}
            </div>
         </div>
      )}
    </div>
  );
}