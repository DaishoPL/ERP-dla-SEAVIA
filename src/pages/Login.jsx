import React, { useState } from 'react';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:3000';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // W wersji LOKALNEJ wysyłamy żądanie do /rpc/verify_login.
      // Serwer musi "widzieć" tę funkcję w cache schematu 'public'.
      const response = await fetch(`${API_URL}/rpc/verify_login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Dodajemy nagłówek informujący o chęci użycia schematu public (wymagane przez niektóre wersje PostgREST)
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          p_email: email,
          p_password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Sukces! Zapisujemy bilet (dane użytkownika) w pamięci lokalnej przeglądarki
        localStorage.setItem('seavia_user', JSON.stringify(data));
        onLoginSuccess(data);
      } else {
        // Obsługa błędu "Function not found" lub błędnych danych
        if (data.code === 'PGRST202' || (data.message && data.message.includes('schema cache'))) {
          throw new Error("Błąd serwera: Funkcja logowania nie została odnaleziona. Zrestartuj plik START_SEAVIA.bat.");
        }
        throw new Error(data.message || 'Błąd logowania. Sprawdź e-mail i hasło.');
      }
    } catch (err) {
      console.error("Login Error Details:", err);
      setError(err.message === 'Failed to fetch' 
        ? 'Brak połączenia z API (Port 3000). Czy okno PostgREST jest otwarte?' 
        : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        
        {/* Nagłówek wizualny */}
        <div className="bg-slate-900 p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/20 mix-blend-overlay"></div>
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-xl mb-4 relative z-10 shadow-lg ring-4 ring-white/10">
            SV
          </div>
          <h2 className="text-2xl font-black text-white relative z-10 tracking-tight uppercase">SEAVIA ERP</h2>
          <p className="text-blue-200 text-[10px] mt-2 relative z-10 tracking-[0.2em] font-black uppercase">Lokalny Węzeł Dostępowy</p>
        </div>

        {/* Kontener Formularza */}
        <div className="p-8 sm:p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-xs font-bold leading-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Pole E-mail */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-2">Adres E-mail</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm transition-all"
                  placeholder="tylkotyznaszadres@gmail.com"
                  required
                />
              </div>
            </div>

            {/* Pole Hasło */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-2">Hasło Dostępu</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Przycisk Logowania */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4 uppercase text-xs tracking-widest disabled:bg-slate-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Autoryzacja...</span>
                </>
              ) : (
                <span>Autoryzuj Dostęp</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
              System Monitorowany • Seavia Operations 2026
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}