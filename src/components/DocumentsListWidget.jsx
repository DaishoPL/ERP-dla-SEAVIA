import React, { useState, useEffect } from 'react';
import { 
  FileText, FileBadge, MapPin, Calendar, Building2, 
  ExternalLink, AlertTriangle, XCircle, CheckCircle2, 
  Settings, ChevronLeft, Save, Loader2, Eye 
} from 'lucide-react';

const API_URL = 'http://localhost:3000';

/**
 * Komponent wyświetlający listę dokumentów z zintegrowanym panelem konfiguracji alertów.
 */
export default function DocumentsListWidget({ documents, isLoading, preview, setPreview }) {
  const [showSettings, setShowSettings] = useState(false);
  const [configs, setConfigs] = useState([]);
  const [isSaving, setIsSaving] = useState(null); 
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);

  const fetchConfigs = async () => {
    setIsLoadingConfigs(true);
    try {
      const res = await fetch(`${API_URL}/document_alert_configs?select=*,document_types_dictionary(doc_type_name)`);
      if (res.ok) {
        const data = await res.json();
        
        // Zdefiniowany klucz priorytetów dla typów dokumentów
        const docTypePriority = {
          'A1': 1, 'Pasp': 2, 'ID': 3, 'Pass': 4, 
          'Vissa': 5, 'MC': 6, 'DL': 7, 'ano': 8
        };
        
        // Sortowanie pobranych reguł wg klucza
        const sortedConfigs = [...data].sort((a, b) => {
          const priorityA = docTypePriority[a.doc_type_id] || 99;
          const priorityB = docTypePriority[b.doc_type_id] || 99;
          return priorityA - priorityB;
        });
        
        setConfigs(sortedConfigs);
      }
    } catch (err) {
      console.error("Błąd pobierania konfiguracji:", err);
    } finally {
      setIsLoadingConfigs(false);
    }
  };

  useEffect(() => {
    if (showSettings) {
      fetchConfigs();
    }
  }, [showSettings]);

  const handleConfigChange = (docTypeId, newValue) => {
    setConfigs(prev => prev.map(c => 
      c.doc_type_id === docTypeId ? { ...c, warning_value: parseInt(newValue) || 0 } : c
    ));
  };

  const saveConfig = async (item) => {
    setIsSaving(item.doc_type_id);
    try {
      const res = await fetch(`${API_URL}/document_alert_configs?doc_type_id=eq.${item.doc_type_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({ warning_value: item.warning_value })
      });
      if (res.ok) {
        // Sukces zapisu
      }
    } catch (err) {
      console.error("Błąd zapisu:", err);
    } finally {
      setIsSaving(null);
    }
  };

  const getStatusStyles = (status, isActive) => {
    if (isActive) return 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-md scale-[1.01]';
    
    if (status === 'PO WYGAŚNIĘCIU') {
      return 'bg-red-50 border-red-200 hover:bg-red-100 text-red-900 shadow-sm shadow-red-100';
    }
    if (status?.includes('ALERCIK')) {
      return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-yellow-900 shadow-sm shadow-yellow-100';
    }
    
    return 'bg-slate-50/50 border-slate-100 hover:bg-white hover:border-blue-200 text-slate-700';
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden shrink-0 transition-all duration-300">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          {showSettings ? (
            <button 
              onClick={() => setShowSettings(false)}
              className="p-1 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
            >
              <ChevronLeft size={18} />
            </button>
          ) : (
            <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg shadow-sm">
              <FileText size={16} />
            </div>
          )}
          <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">
            {showSettings ? 'Ustawienia Alertów' : 'Dokumentacja Technika'}
          </h3>
        </div>
        
        {!showSettings && (
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"
            title="Konfiguruj progi ostrzeżeń"
          >
            <Settings size={16} />
          </button>
        )}
      </div>

      <div className="p-4 min-h-[100px]">
        {showSettings ? (
          <div className="space-y-2 animate-in fade-in duration-300">
            {isLoadingConfigs ? (
              <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={20} /></div>
            ) : (
              <>
                {configs.map(config => (
                  <div key={config.doc_type_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="overflow-hidden mr-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">{config.doc_type_id}</p>
                      <p className="text-xs font-bold text-slate-700 truncate">{config.document_types_dictionary?.doc_type_name || config.doc_type_id}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <input 
                        type="number"
                        value={config.warning_value}
                        onChange={(e) => handleConfigChange(config.doc_type_id, e.target.value)}
                        className="w-12 bg-white border border-slate-200 rounded-lg py-1 px-1 text-center text-xs font-black text-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                      <span className="text-[8px] font-black text-slate-400 uppercase w-7">{config.unit === 'months' ? 'm-cy' : 'dni'}</span>
                      <button 
                        onClick={() => saveConfig(config)}
                        disabled={isSaving === config.doc_type_id}
                        className={`p-2 rounded-lg transition-all ${
                          isSaving === config.doc_type_id 
                            ? 'bg-slate-100 text-slate-300' 
                            : 'bg-white text-slate-400 hover:text-emerald-600 hover:shadow-sm border border-slate-200'
                        }`}
                      >
                        {isSaving === config.doc_type_id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
                <p className="text-[8px] text-center text-slate-400 font-bold uppercase mt-4 px-2 leading-relaxed italic">
                  Zmiany wpływają na kolory dokumentów u wszystkich pracowników
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {documents.length === 0 && !isLoading ? (
              <p className="text-xs text-slate-400 font-bold text-center py-8 uppercase tracking-tight">Brak dokumentów w bazie</p>
            ) : (
              documents.map(doc => {
                const isActive = preview?.data?.document_id === doc.document_id;
                const status = doc.status_alertu;
                const isExpired = status === 'PO WYGAŚNIĘCIU';
                const isWarning = status?.includes('ALERCIK');
                
                return (
                  <div 
                    key={doc.document_id} 
                    onMouseEnter={() => setPreview({ type: 'document', data: doc })}
                    onClick={() => setPreview({ type: 'document', data: doc })}
                    className={`p-3 border rounded-2xl transition-all duration-300 cursor-pointer group flex items-center justify-between ${getStatusStyles(status, isActive)}`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="shrink-0 flex items-center justify-center">
                        {isExpired ? <XCircle size={16} className="text-red-500" /> : 
                         isWarning ? <AlertTriangle size={16} className="text-yellow-600 animate-pulse" /> : 
                         <CheckCircle2 size={16} className={isActive ? "text-blue-500" : "text-slate-300"} />}
                      </div>
                      <div className="overflow-hidden text-left">
                        <p className="text-sm font-black text-slate-800 truncate leading-tight">
                          {doc.doc_type_name || doc.doc_type_id}
                        </p>
                        <p className={`text-[10px] font-black uppercase tracking-tighter mt-0.5 ${
                          isExpired ? 'text-red-500' : isWarning ? 'text-yellow-700' : 'text-slate-400'
                        }`}>
                          {status || 'WAŻNY'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Ważność</p>
                      <p className={`text-xs font-black ${isExpired ? 'text-red-600' : 'text-slate-800'}`}>
                        {doc.expiry_date || 'BRAK'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * KOMPONENT PODGLĄDU: Nowy, kompaktowy układ z dużą, zintegrowaną ramką na plik
 */
export const DocumentPreviewPane = ({ data }) => {
  if (!data) return null;
  const isExpired = data.status_alertu === 'PO WYGAŚNIĘCIU';
  const isWarning = data.status_alertu?.includes('ALERCIK');
  
  return (
    <div className="p-6 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500 overflow-hidden">
      
      {/* 1. ZMNIEJSZONY NAGŁÓWEK (-20% wysokości, mniejsze odstępy) */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100 shrink-0">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md border shrink-0 transition-all ${
          isExpired ? 'bg-red-600 text-white border-red-700 rotate-2' : 
          isWarning ? 'bg-yellow-50 text-yellow-600 border-yellow-200 -rotate-2' : 
          'bg-blue-50 text-blue-600 border-blue-100'
        }`}>
          <FileText size={26} />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Dokument Kadrowy</p>
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-black text-slate-800 leading-tight truncate">
               {data.doc_type_name || data.doc_type_id}
             </h2>
             <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border shadow-sm shrink-0 ml-2 ${
               isExpired ? 'bg-white text-red-600 border-red-200' :
               isWarning ? 'bg-white text-yellow-600 border-yellow-200' :
               'bg-slate-50 text-slate-500 border-slate-200'
             }`}>
               {data.status_alertu || 'WAŻNY'}
             </span>
          </div>
        </div>
      </div>
      
      {/* 2. ZMNIEJSZONE KAFELKI DANYCH (-20% wysokości ramek) */}
      <div className="grid grid-cols-2 gap-3 shrink-0">
        <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
           <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1.5"><FileBadge size={12}/> Numer Dokumentu</p>
           <p className="text-xs font-bold text-slate-800 font-mono truncate">{data.document_number || '---'}</p>
        </div>
        <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
           <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1.5"><MapPin size={12}/> Kraj Wydania</p>
           <p className="text-xs font-bold text-slate-800 truncate">{data.country_id || 'Brak Danych'}</p>
        </div>
        <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
           <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1.5"><Calendar size={12}/> Data Wydania</p>
           <p className="text-xs font-bold text-slate-800">{data.issue_date || 'Brak Danych'}</p>
        </div>
        <div className={`px-4 py-3 rounded-xl border transition-all ${
          isExpired ? 'bg-red-50 border-red-200 shadow-inner' : isWarning ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-100'
        }`}>
           <p className={`text-[9px] font-black uppercase mb-1 flex items-center gap-1.5 ${
             isExpired ? 'text-red-500' : isWarning ? 'text-yellow-600' : 'text-slate-400'
           }`}>
             <Calendar size={12}/> Ważne do
           </p>
           <p className={`text-xs font-bold ${isExpired ? 'text-red-700' : 'text-slate-800'}`}>
             {data.expiry_date || 'Bezterminowo'}
           </p>
        </div>
      </div>

      <div className="mt-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 shrink-0">
         <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1.5"><Building2 size={12}/> Organ Wydający</p>
         <p className="text-xs font-bold text-slate-800 truncate">{data.issuing_office || 'Brak informacji'}</p>
      </div>

      {/* 3. NOWA ELASTYCZNA RAMKA NA PODGLĄD PLIKU (Zintegrowana, zabiera całą resztę miejsca) */}
      <div className="mt-4 flex-1 border-2 border-slate-200 border-dashed rounded-2xl bg-slate-50/50 flex flex-col overflow-hidden relative min-h-[160px]">
         
         {/* Pasek narzędziowy nad plikiem */}
         <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex justify-between items-center z-10 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <Eye size={12} className="text-blue-500" /> Skan Dokumentu
            </span>
            <button 
              className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                data.file_link 
                ? 'bg-slate-900 text-white hover:bg-blue-600 shadow-sm active:scale-95' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              disabled={!data.file_link}
            >
              <ExternalLink size={12} /> {data.file_link ? 'Otwórz Skan (S3)' : 'Brak Załącznika'}
            </button>
         </div>

         {/* Przestrzeń wyrenderowania pliku */}
         <div className="flex-1 w-full h-full flex items-center justify-center p-3 relative">
            {data.file_link ? (
               <div className="w-full h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center p-4">
                  <FileText size={32} className="text-blue-100 mb-2" />
                  <p className="text-xs font-bold text-slate-500">Miejsce na osadzenie PDF / Obrazu</p>
                  <p className="text-[8px] text-slate-400 mt-1 truncate max-w-[80%] font-mono bg-slate-50 px-2 py-1 rounded">
                     {data.file_link}
                  </p>
               </div>
            ) : (
               <div className="text-center text-slate-400">
                  <FileText size={24} className="mx-auto mb-2 opacity-20" />
                  <p className="text-[9px] font-bold uppercase tracking-widest">Plik nie został wgrany do bazy</p>
               </div>
            )}
         </div>
         
      </div>

    </div>
  );
};