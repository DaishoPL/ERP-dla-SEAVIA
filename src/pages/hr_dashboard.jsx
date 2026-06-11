import React, { useState } from 'react';
import { Users, AlertCircle, CheckCircle, FileText, Search, ShieldAlert, UserPlus, CheckCircle2 } from 'lucide-react';

/**
 * SEAVIA ERP - HR Dashboard (Panel Weryfikacji Kadr)
 * Narzędzie dla roli 'hr' do zarządzania pracownikami i weryfikacji dokumentacji.
 */

// Słownik Ról Zgodny z user_roles_dictionary.csv
const ROLE_MAP = {
  'adm': { label: 'Administrator', color: 'bg-red-100 text-red-700 border-red-200' },
  'ceo': { label: 'Zarząd', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  'for': { label: 'Foreman', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  'hr': { label: 'Kadry', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  'pm': { label: 'Proj. Menadżer', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  'sit': { label: 'Site Manager', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  'tech': { label: 'Technik', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  'tl': { label: 'Team Lider', color: 'bg-teal-100 text-teal-700 border-teal-200' }
};

// Symulacja danych pobranych z bezpiecznego API (PostgREST z RLS)
const MOCK_TECHNICIANS = [
  {
    id: 'SEAVIA00001',
    firstName: 'Adam',
    surname: 'Adamski',
    role: 'tech',
    coopState: 'active',
    alerts: [],
    documents: [
      { type: 'Pasp', status: 'valid', expiry: '2028-12-01' },
      { type: 'A1', status: 'valid', expiry: '2025-10-15' },
      { type: 'Visa', status: 'missing', expiry: null }
    ]
  },
  {
    id: 'SEAVIA00008',
    firstName: 'Marek',
    surname: 'Nowak',
    role: null, // Brak roli przed akceptacją
    coopState: 'new', // Nowe zgłoszenie z zewnątrz
    alerts: ['Wymaga akceptacji HR', 'Brak przypisanej roli'],
    documents: []
  },
  {
    id: 'SEAVIA00003',
    firstName: 'Piotr',
    surname: 'Kowalski',
    role: 'tl', // Team Leader
    coopState: 'active',
    alerts: ['Dokument wygasa wkrótce (< 30 dni)'],
    documents: [
      { type: 'ID', status: 'valid', expiry: '2030-05-20' },
      { type: 'A1', status: 'expiring', expiry: '2024-05-10' } 
    ]
  },
  {
    id: 'SEAVIA00004',
    firstName: 'Jan',
    surname: 'Zieliński',
    role: 'for', // Foreman
    coopState: 'active',
    alerts: ['Brak numeru konta bankowego'],
    documents: [
      { type: 'ID', status: 'valid', expiry: '2029-11-11' }
    ]
  }
];

export default function HRDashboard() {
  const [activeTab, setActiveTab] = useState('verification'); // 'verification' | 'active'
  const [searchQuery, setSearchQuery] = useState('');
  const [technicians, setTechnicians] = useState(MOCK_TECHNICIANS);

  // Filtrowanie na podstawie zakładki i wyszukiwania
  const filteredTechs = technicians.filter(tech => {
    const matchesSearch = `${tech.firstName} ${tech.surname} ${tech.id}`.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'verification') {
      return matchesSearch && (tech.coopState === 'new' || tech.alerts.length > 0);
    }
    return matchesSearch && tech.coopState === 'active' && tech.alerts.length === 0;
  });

  const stats = {
    newApplications: technicians.filter(t => t.coopState === 'new').length,
    alertsTotal: technicians.filter(t => t.alerts.length > 0 && t.coopState !== 'new').length,
    activeOk: technicians.filter(t => t.coopState === 'active' && t.alerts.length === 0).length
  };

  // Symulacja akceptacji nowego pracownika (domyślnie nadaje rolę 'tech')
  const handleApprove = (id) => {
    setTechnicians(techs => techs.map(t => 
      t.id === id 
        ? { ...t, coopState: 'active', role: 'tech', alerts: t.alerts.filter(a => a !== 'Wymaga akceptacji HR' && a !== 'Brak przypisanej roli') } 
        : t
    ));
    alert(`Zatwierdzono pracownika: ${id}. RLS wpuści go teraz do systemu jako technika.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      
      {/* NAGŁÓWEK GŁÓWNY */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-md shadow-indigo-200">
                <Users size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-800">HR Workspace</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Seavia ERP Verification</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="hidden md:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                 <ShieldAlert size={14} className="text-indigo-600" />
                 <span className="text-xs font-bold text-slate-600 uppercase">Poziom Dostępu: KADRY (HR)</span>
               </div>
               <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                  <span className="font-black text-slate-500 text-sm">HR</span>
               </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* STATYSTYKI WIDGETY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 cursor-pointer hover:border-blue-300 transition-colors" onClick={() => setActiveTab('verification')}>
            <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl">
              <UserPlus size={28} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800">{stats.newApplications}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Nowe Zgłoszenia</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 cursor-pointer hover:border-amber-300 transition-colors" onClick={() => setActiveTab('verification')}>
            <div className="bg-amber-50 text-amber-600 p-4 rounded-2xl">
              <AlertCircle size={28} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800">{stats.alertsTotal}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Braki w Dokumentach</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => setActiveTab('active')}>
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl">
              <CheckCircle size={28} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800">{stats.activeOk}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Technicy (Dane OK)</p>
            </div>
          </div>
        </div>

        {/* GŁÓWNY PANEL ZARZĄDZANIA */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Pasek Narzędzi */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
             
             {/* Zakładki */}
             <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
                <button 
                  onClick={() => setActiveTab('verification')}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'verification' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Do Weryfikacji
                  {(stats.newApplications + stats.alertsTotal) > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full">{stats.newApplications + stats.alertsTotal}</span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('active')}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'active' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Poprawni
                </button>
             </div>

             {/* Wyszukiwarka */}
             <div className="relative w-full md:w-72">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Szukaj pracownika (ID, Nazwisko)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                />
             </div>
          </div>

          {/* LISTA PRACOWNIKÓW */}
          <div className="divide-y divide-slate-100">
             {filteredTechs.length === 0 ? (
               <div className="p-12 text-center text-slate-400">
                  <CheckCircle2 size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-bold text-lg">Brak wyników</p>
                  <p className="text-sm">Wszystko wygląda dobrze w tej sekcji.</p>
               </div>
             ) : (
               filteredTechs.map(tech => {
                 // Wyciągamy poprawne dane konfiguracyjne roli ze słownika ROLE_MAP
                 const roleData = ROLE_MAP[tech.role] || { label: 'Brak Roli', color: 'bg-slate-100 text-slate-500 border-slate-200' };

                 return (
                   <div key={tech.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between group">
                      
                      {/* Profil Info */}
                      <div className="flex items-center gap-5">
                         <div className="relative">
                            <div className="w-14 h-14 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-lg font-black text-slate-500 shadow-sm">
                              {tech.firstName[0]}{tech.surname[0]}
                            </div>
                            {tech.coopState === 'new' && (
                               <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                                 <div className="w-1.5 h-1.5 bg-white rounded-full" />
                               </div>
                            )}
                         </div>
                         
                         <div>
                           <div className="flex items-center gap-3">
                             <h3 className="text-lg font-bold text-slate-900">{tech.firstName} {tech.surname}</h3>
                             <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{tech.id}</span>
                           </div>
                           <div className="flex items-center gap-3 mt-1.5">
                             {/* Dynamicznie wygenerowana etykieta roli w oparciu o user_roles_dictionary */}
                             <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${roleData.color}`}>
                               {roleData.label}
                             </span>

                             <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                               tech.coopState === 'new' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-green-100 text-green-700'
                             }`}>
                               {tech.coopState === 'new' ? 'Nowy Kandydat' : 'Aktywny'}
                             </span>
                           </div>
                         </div>
                      </div>

                      {/* Alerty i Braki */}
                      <div className="flex-1 max-w-xl">
                        {tech.alerts.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {tech.alerts.map((alert, i) => (
                              <div key={i} className="flex items-center gap-1.5 bg-red-50 text-red-700 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-red-100">
                                <AlertCircle size={12} />
                                {alert}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {tech.documents.length > 0 && (
                          <div className="mt-3 flex items-center gap-4 text-xs font-medium text-slate-500">
                             <div className="flex items-center gap-1.5"><FileText size={14}/> <span>Status Dokumentów:</span></div>
                             <div className="flex gap-2">
                               {tech.documents.map((doc, i) => (
                                 <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                   doc.status === 'valid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                   doc.status === 'expiring' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                   'bg-red-50 text-red-600 border-red-200'
                                 }`} title={doc.expiry ? `Wygasa: ${doc.expiry}` : 'Brak pliku'}>
                                   {doc.type}
                                 </span>
                               ))}
                             </div>
                          </div>
                        )}
                      </div>

                      {/* Akcje HR */}
                      <div className="flex items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0 mt-4 lg:mt-0">
                         {tech.coopState === 'new' ? (
                           <>
                             <button className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                               Odrzuć
                             </button>
                             <button 
                               onClick={() => handleApprove(tech.id)}
                               className="px-5 py-2 text-xs font-black bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95"
                             >
                               Zatwierdź & Nadaj Rolę
                             </button>
                           </>
                         ) : (
                           <button className="px-5 py-2 text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-xl shadow-sm transition-all group-hover:shadow">
                             Edytuj Kartę
                           </button>
                         )}
                      </div>

                   </div>
                 );
               })
             )}
          </div>
        </div>

      </main>
    </div>
  );
}