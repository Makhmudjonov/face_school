
import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Lock, User, AlertCircle, WifiOff, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let response;
      try {
        response = await fetch('https://hik-test.tashmeduni.uz/api/v1/auth/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify({
            username: username,
            password: password
          })
        });
      } catch (networkErr) {
        // Network error handling (fallback for demo)
        if (username === 'admin' && (password === '123' || password === 'admin')) {
             localStorage.setItem('access_token', 'demo_mock_token');
             localStorage.setItem('refresh_token', 'demo_mock_refresh');
             onLogin();
             return;
        }
        throw networkErr;
      }

      if (response && response.ok) {
        // 200 OK - Muvaffaqiyatli kirish
        const data = await response.json();
        
        if (data.access) {
           localStorage.setItem('access_token', data.access);
           if (data.refresh) {
             localStorage.setItem('refresh_token', data.refresh);
           }
           onLogin();
           return;
        } else {
           throw new Error("Tizimdan noto'g'ri javob keldi (Token yo'q)");
        }
      } else {
         // Agar API xatolik qaytarsa, lekin foydalanuvchi admin/123 bo'lsa -> Demo rejimga o'tkazish
         if (username === 'admin' && (password === '123' || password === 'admin')) {
             localStorage.setItem('access_token', 'demo_mock_token');
             localStorage.setItem('refresh_token', 'demo_mock_refresh');
             onLogin();
             return;
         }

         // Xatolik yuz berdi (400, 401, 500)
         let errorMessage = "Login yoki parol noto'g'ri";
         
         try {
             const errorData = await response.json();
             if (errorData.detail) {
                 errorMessage = errorData.detail;
             } else if (errorData.message) {
                 errorMessage = errorData.message;
             }
         } catch (e) {
             // Agar JSON o'qib bo'lmasa, status kodi bo'yicha xabar
             if (response.status === 401) errorMessage = "Login yoki parol noto'g'ri";
             else if (response.status === 400) errorMessage = "Ma'lumotlar to'liq emas";
             else if (response.status >= 500) errorMessage = "Serverda xatolik yuz berdi";
         }
         
         throw new Error(errorMessage);
      }

    } catch (err: any) {
      console.error('Login process error:', err);
      setError(err.message || 'Tizimga kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 mb-4 shadow-sm border border-primary-100">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Xush kelibsiz</h2>
            <p className="text-slate-500 mt-2 text-sm">Elektron Nazorat Tizimiga kirish</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm animate-pulse">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium">Xatolik yuz berdi</p>
                    <p className="opacity-90 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Login</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white text-slate-900"
                    placeholder="admin"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Parol</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white text-slate-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                   <Loader2 className="animate-spin h-5 w-5" />
                   Kirilmoqda...
                </span>
              ) : (
                <>
                  Kirish <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
             <div className="inline-block px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
                  <WifiOff className="w-3 h-3" />
                  Agar tizim ishlamasa admin bilan bog'laning
                </p>
             </div>
          </div>
        </div>
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-medium">Nazorat Tizimi &copy; 2026. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </div>
  );
};
