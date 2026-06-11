import React from 'react';
import { Filter } from 'lucide-react';

export default function DataExport() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10 text-center animate-in fade-in duration-500">
      <Filter size={48} className="mb-4 opacity-20" />
      <h1 className="text-2xl font-black text-slate-700 mb-2 tracking-tight">Filtry i Eksport</h1>
      <p>Moduł do zaawansowanego filtrowania i eksportu danych do plików CSV/PDF pojawi się tutaj.</p>
    </div>
  );
}