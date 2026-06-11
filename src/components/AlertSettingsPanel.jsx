import React, { useState, useEffect } from 'react';
import { BellRing, Save, Clock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_URL = 'http://localhost:3000';

/**
 * Komponent Panelu Zarządzania Alertami
 * Pozwala na globalną zmianę progów ostrzegania dla różnych typów dokumentów.
 */
export default function AlertSettingsPanel() {
  const [configs, setConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState(null);

  // Pobierz aktualne reguły z bazy przy montowaniu komponentu
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        // Pobieramy dane z tabeli konfiguracji wraz z nazwą dokumentu ze słownika
        const res = await fetch(`${API_URL}/document_alert_configs?select=*,document_types_dictionary(doc_type_name)`);
        const data = await res.json();

        // Zdefiniowany klucz priorytetów dla typów dokumentów (od 1 do 8)
        const docTypePriority = {
          'A1': 1,
          'Pasp': 2,
          'ID': 3,
          'Pass': 4,
          'Vissa': 5,
          'MC': 6,
          'DL': 7,
          'ano': 8
        };

        // Sortowanie pobranych reguł wg klucza
        const sortedConfigs = [...data].sort((a, b) => {
          const priorityA = docTypePriority[a.doc_type_id] || 99;
          const priorityB = docTypePriority[b.doc_type_id] || 99;
          return priorityA - priorityB;
        });

        setConfigs(sortedConfigs);
      } catch (err) {
        console.error("Błąd pobierania konfiguracji:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  // Obsługa lokalnej zmiany wartości w polu input
  const handleValueChange = (docTypeId, newValue) => {
    setConfigs(prev => prev.map(c => 
      c.doc_type_id === docTypeId ? { ...c, warning_value: parseInt(newValue) || 0 } : c
    ));
  };

  // Zapisanie konkretnej reguły do bazy danych
  const handleSave = async (item) => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/document_alert_configs?doc_type_id=eq.${item.doc_type_id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          'Prefer': 'return=minimal' 
        },
        body: JSON.stringify({ warning_value: item.warning_value })
      });
      
      if (res.ok) {
        setStatus({ type: 'success', msg: `Zaktualizowano: ${item.doc_type_id}` });
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Błąd zapisu danych' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-xs font-bold uppercase tracking-widest">Wczytywanie reguł...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden animate-in fade-in duration-500">
      
      {/* NAGŁÓWEK PANELU */}
      <div className="bg-slate-900 p-8 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
            <BellRing size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-widest leading-none">Reguły Alertów</h1>
            <p className="text-blue-300 text-[10px] font-bold uppercase tracking-tight opacity-70 mt-2">
              Konfiguracja czasu powiadomień przed wygaśnięciem
            </p>
          </div>
        </div>
        
        {/* POWIADOMIENIE O STATUSIE ZAPISU */}
        {status && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all animate-in zoom-in ${
            status.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {status.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {status.msg}
          </div>
        )}
      </div>

      {/* TABELA USTAWIEŃ */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Typ Dokumentu</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Okres Ostrzegania</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Akcja</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {configs.map((config) => (
              <tr key={config.doc_type_id} className="hover:bg-slate-50/30 transition-colors group">
                {/* NAZWA I KOD */}
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-black border border-slate-200">
                      {config.doc_type_id}
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {config.document_types_dictionary?.doc_type_name || config.doc_type_id}
                    </span>
                  </div>
                </td>
                
                {/* EDYCJA WARTOŚCI */}
                <td className="px-8 py-5 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <input 
                      type="number"
                      min="0"
                      max="120"
                      value={config.warning_value}
                      onChange={(e) => handleValueChange(config.doc_type_id, e.target.value)}
                      className="w-20 bg-white border-2 border-slate-200 rounded-xl px-3 py-2 text-center font-black text-blue-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    />
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      {config.unit === 'months' ? 'miesięcy' : 'dni'}
                    </span>
                  </div>
                </td>

                {/* PRZYCISK ZAPISU */}
                <td className="px-8 py-5 text-right">
                  <button 
                    onClick={() => handleSave(config)}
                    disabled={isSaving}
                    className="p-3 bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all active:scale-90 shadow-sm disabled:opacity-50"
                    title="Zapisz ustawienie"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* STOPKA INFORMACYJNA */}
      <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
          Zmiany są natychmiastowo uwzględniane przez Widok SQL na serwerze
        </p>
      </div>
    </div>
  );
}