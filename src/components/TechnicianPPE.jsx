import React from 'react';
import { HardHat, ShieldCheck, AlertTriangle, Calendar } from 'lucide-react';

// ============================================================================
// 🧩 KOMPONENT: SPRZĘT BHP I UBRANIA (KAFELEK LISTY)
// ============================================================================
export const PPEListWidget = ({ ppeList, isLoading, preview, setPreview }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
        <h3 className="font-black text-slate-800 flex items-center gap-2.5">
          <div className="bg-orange-100 text-orange-600 p-1.5 rounded-lg"><HardHat size={16} /></div>
          Karta Ubrań i BHP
        </h3>
      </div>
      <div className="p-4 space-y-2">
        {ppeList.length === 0 && !isLoading ? (
          <p className="text-xs text-slate-400 font-medium text-center py-4">Brak wydanego wyposażenia</p>
        ) : (
          ppeList.map(item => {
            const isActive = preview?.data?.ppe_assign_id === item.ppe_assign_id;
            const isExpired = item.expiry_date && new Date(item.expiry_date) < new Date();
            return (
              <div 
                key={item.ppe_assign_id} 
                onMouseEnter={() => setPreview({ type: 'ppe', data: item })}
                onClick={() => setPreview({ type: 'ppe', data: item })}
                className={`p-3 border rounded-2xl transition-all cursor-pointer group flex items-center justify-between ${
                  isActive ? 'bg-orange-50 border-orange-200 shadow-sm ring-1 ring-orange-500' : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:border-orange-200'
                }`}
              >
                <div>
                  <p className={`text-sm font-bold ${isActive ? 'text-orange-900' : 'text-slate-700'}`}>
                    {item.ppe_dictionary?.ppe_name || item.ppe_type_id}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">
                    Rozmiar: {item.size_id || '-'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {isExpired ? (
                    <span className="text-[9px] font-black uppercase text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200">
                      Wymiana
                    </span>
                  ) : (
                    <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                      Aktywne
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 🧩 KOMPONENT: SPRZĘT BHP I UBRANIA (SZCZEGÓŁOWY PODGLĄD)
// ============================================================================
export const PPEPreviewPane = ({ data }) => {
  const isExpired = data.expiry_date && new Date(data.expiry_date) < new Date();

  return (
    <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
        <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm border border-orange-100 shrink-0">
          <HardHat size={32} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Wyposażenie BHP</p>
          <h2 className="text-2xl font-black text-slate-800 leading-tight">
            {data.ppe_dictionary?.ppe_name || data.ppe_type_id}
          </h2>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
           <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Rozmiar</p>
           <p className="text-lg font-black text-slate-800 bg-white border border-slate-200 w-fit px-3 py-1 rounded-lg shadow-sm">
             {data.size_id || '-'}
           </p>
        </div>
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-center">
           <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Status Ważności</p>
           {isExpired ? (
              <span className="flex items-center gap-2 text-xs font-black uppercase text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-200 w-fit">
                <AlertTriangle size={14} /> Wymagana Wymiana
              </span>
            ) : (
              <span className="flex items-center gap-2 text-xs font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 w-fit">
                <ShieldCheck size={14} /> Aktywne
              </span>
            )}
        </div>
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
           <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1.5"><Calendar size={12}/> Data Wydania</p>
           <p className="text-sm font-bold text-slate-800">{data.issue_date || 'Brak Danych'}</p>
        </div>
        <div className={`p-5 rounded-2xl border ${isExpired ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
           <p className={`text-[10px] font-black uppercase mb-1 flex items-center gap-1.5 ${isExpired ? 'text-red-500' : 'text-slate-400'}`}>
             <Calendar size={12}/> Ważne do (Termin wymiany)
           </p>
           <p className={`text-sm font-bold ${isExpired ? 'text-red-700' : 'text-slate-800'}`}>
             {data.expiry_date || 'Bezterminowo'}
           </p>
        </div>
      </div>
    </div>
  );
};