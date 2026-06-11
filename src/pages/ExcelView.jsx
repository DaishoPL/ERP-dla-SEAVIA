import React from 'react';
import { Table } from 'lucide-react';

export default function ExcelView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10 text-center animate-in fade-in duration-500">
      <Table size={48} className="mb-4 opacity-20" />
      <h1 className="text-2xl font-black text-slate-700 mb-2 tracking-tight">Widok Tabel (Excel)</h1>
      <p>Surowy podgląd i edycja bazy danych w formie siatki pojawi się w tym miejscu.</p>
    </div>
  );
}