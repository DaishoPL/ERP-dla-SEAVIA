import React from 'react';
import { Wallet, MapPin, Plane, Building2, ArrowRight } from 'lucide-react';

// ============================================================================
// 🧩 KOMPONENT: KSIĘGOWOŚĆ I LOGISTYKA (KAFELEK LISTY)
// ============================================================================
export const LogisticsListWidget = ({ tech, preview, setPreview }) => {
  // Przygotowujemy pakiet danych z obiektu głównego pracownika
  const logisticsData = {
    accounting: tech?.accounting_office_id || 'Brak przypisanego biura',
    busStop: tech?.bus_stop || 'Brak danych w profilu',
    airport: tech?.airport || 'Brak'
  };

  const isActive = preview?.type === 'logistics';

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
        <h3 className="font-black text-slate-800 flex items-center gap-2.5">
          <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg"><Wallet size={16} /></div>
          Księgowość i Logistyka
        </h3>
      </div>
      <div className="p-4 space-y-2">
         <div 
            onMouseEnter={() => setPreview({ type: 'logistics', data: logisticsData })}
            onClick={() => setPreview({ type: 'logistics', data: logisticsData })}
            className={`p-4 border rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
              isActive ? 'bg-emerald-50 border-emerald-200 shadow-sm ring-1 ring-emerald-500' : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:border-emerald-200'
            }`}
         >
            <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
               Zobacz status kont i logistyki <ArrowRight size={16} className={isActive ? "text-emerald-600" : "text-slate-400"} />
            </p>
         </div>
      </div>
    </div>
  );
};

// ============================================================================
// 🧩 KOMPONENT: KSIĘGOWOŚĆ I LOGISTYKA (SZCZEGÓŁOWY PODGLĄD)
// ============================================================================
export const LogisticsPreviewPane = ({ data }) => {
  return (
    <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100 shrink-0">
          <Wallet size={32} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Księgowość i Logistyka</p>
          <h2 className="text-2xl font-black text-slate-800 leading-tight">Dane Operacyjne</h2>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1.5"><Building2 size={12}/> Obsługa Księgowa</p>
          <p className="text-base font-black text-slate-800">{data.accounting}</p>
          <p className="text-xs text-slate-500 mt-1">Biuro odpowiedzialne za rozliczenia B2B/UoP</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1.5"><MapPin size={12}/> Preferowany Bus Stop</p>
            <p className="text-sm font-bold text-slate-800">{data.busStop}</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1.5"><Plane size={12}/> Najbliższe Lotnisko</p>
            <div className="flex items-center gap-2">
              <span className="bg-white border border-slate-200 font-mono font-bold text-sm px-2 py-1 rounded shadow-sm text-slate-700">{data.airport}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};