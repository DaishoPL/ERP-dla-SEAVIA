import React, { useState } from 'react';
import { Lock, Mail, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const API_URL = 'http://localhost:3000';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Stany dla odzyskiwania hasła
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // --- 1. LOGOWANIE STANDARDOWE (POSTGREST RPC) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/rpc/verify_login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          p_email: email,
          p_password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('seavia_user', JSON.stringify(data));
        onLoginSuccess(data);
      } else {
        throw new Error(data.message || 'Błąd logowania. Sprawdź e-mail i hasło.');
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message === 'Failed to fetch' 
        ? 'Brak połączenia z API (Port 3000). Czy okno PostgREST jest otwarte?' 
        : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. LOGOWANIE GOOGLE (OAUTH) ---
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/profile`
        }
      });

      if (oauthError) throw oauthError;
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError(err.message || 'Wystąpił problem podczas autoryzacji kontem Google.');
      setIsLoading(false);
    }
  };

  // --- 3. WYSYŁANIE LINKU RESETUJĄCEGO HASŁO ---
  const handlePasswordResetRequest = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/profile?reset=true`
      });

      if (resetError) throw resetError;
      setResetSent(true);
    } catch (err) {
      console.error("Password Reset Error:", err);
      setError(err.message || 'Nie udało się wysłać linku resetującego.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">

        {/* Nagłówek wizualny */}
        <div className="bg-slate-900 p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/20 mix-blend-overlay"></div>
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white font-black text-xl mb-4 relative z-10 shadow-lg ring-4 ring-white/10">
            SV
          </div>
          <h2 className="text-2xl font-black text-white relative z-10 tracking-tight uppercase">SEAVIA ERP</h2>
          <p className="text-blue-200 text-[10px] mt-2 relative z-10 tracking-[0.2em] font-black uppercase">
            {isForgotPasswordMode ? 'Odzyskiwanie Hasła' : 'Lokalny Węzeł Dostępowy'}
          </p>
        </div>

        {/* Kontener Formularza */}
        <div className="p-8 sm:p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-xs font-bold leading-tight">{error}</p>
            </div>
          )}

          {isForgotPasswordMode ? (
            resetSent ? (
              /* Widok po wysłaniu maila */
              <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Sprawdź pocztę</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Wysłaliśmy link resetujący hasło na adres: <br />
                  <strong className="text-slate-700">{email}</strong>.
                </p>
                <button
                  onClick={() => {
                    setIsForgotPasswordMode(false);
                    setResetSent(false);
                  }}
                  className="mt-4 text-xs font-black uppercase text-blue-600 hover:text-blue-700 tracking-wider flex items-center justify-center gap-2 mx-auto"
                >
                  <ArrowLeft size={14} /> Powrót do logowania
                </button>
              </div>
            ) : (
              /* Formularz odzyskiwania hasła */
              <form onSubmit={handlePasswordResetRequest} className="space-y-6">
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Wpisz swój adres e-mail, aby otrzymać bezpieczny jednorazowy link do ustawienia nowego hasła w systemie.
                </p>
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
                      placeholder="adam@dotsens.org"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase text-xs tracking-widest disabled:bg-slate-300"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <span>Wyślij link resetujący</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordMode(false)}
                    className="text-xs font-black uppercase text-slate-400 hover:text-slate-600 tracking-wider flex items-center justify-center gap-2 mx-auto"
                  >
                    <ArrowLeft size={14} /> Powrót do logowania
                  </button>
                </div>
              </form>
            )
          ) : (
            /* Standardowe logowanie */
            <div className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
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
                      placeholder="adam@dotsens.org"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2 px-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Hasło Dostępu</label>
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordMode(true)}
                      className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-700 tracking-wider outline-none"
                    >
                      Zapomniałeś hasła?
                    </button>
                  </div>
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase text-xs tracking-widest disabled:bg-slate-300"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <span>Autoryzuj Dostęp</span>
                  )}
                </button>
              </form>

              {/* Separator sekcji Google OAuth */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lub</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Przycisk logowania przez Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-4 px-6 rounded-2xl border-2 border-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-sm shadow-sm hover:shadow"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.35,11.1H12v2.7h5.38C16.88,16.27,14.73,18,12,18c-3.31,0-6-2.69-6-6s2.69-6,6-6c1.47,0,2.81,0.53,3.87,1.43l2.03-2.03C16.21,3.82,14.22,3,12,3C7.03,3,3,7.03,3,12s4.03,9,9,9c4.41,0,8.25-3.13,8.91-7.5H21.35z" fill="#4285F4" />
                  <path d="M12,21c4.41,0,8.25-3.13,8.91-7.5H12V21z" fill="#34A853" />
                  <path d="M21.35,11.1H12v2.7h5.38C16.88,16.27,14.73,18,12,18V21c4.41,0,8.25-3.13,8.91-7.5H21.35z" fill="#FBBC05" />
                  <path d="M12,3c2.22,0,4.21,0.82,5.9,2.4l2.03-2.03C17.9,1.57,15.11,0.5,12,0.5C7.03,0.5,3,4.53,3,9.5l3-1.5C6.47,5.69,8.97,3,12,3z" fill="#EA4335" />
                </svg>
                <span>Zaloguj się przez Google</span>
              </button>
            </div>
          )}

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