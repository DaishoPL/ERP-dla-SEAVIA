import React from 'react';
import { Bell } from 'lucide-react';

export default function Notifications() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10 text-center animate-in fade-in duration-500">
      <Bell size={48} className="mb-4 opacity-20 text-amber-500" />
      <h1 className="text-2xl font-black text-slate-700 mb-2 tracking-tight">Centrum Powiadomień</h1>
      <p>Tutaj pojawią się alerty serwerowe (np. wygasające dokumenty, braki w sprzęcie).</p>
    </div>
  );
}