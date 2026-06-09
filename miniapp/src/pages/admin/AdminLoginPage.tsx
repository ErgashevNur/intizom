import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, AlertCircle, BarChart3, Truck, Bell } from 'lucide-react';
import { adminLogin } from '../../api';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError("Barcha maydonlarni to'ldiring"); return; }
    setError('');
    setLoading(true);
    try {
      const { accessToken } = await adminLogin(username, password);
      localStorage.setItem('admin_token', accessToken);
      navigate('/admin');
    } catch {
      setError("Login yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel */}
      <div className="hidden lg:flex w-[480px] shrink-0 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: '#0F172A' }}>
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
              <BookOpen size={20} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-white font-black text-lg tracking-wide">INTIZOM</span>
              <p className="text-slate-500 text-xs">Admin Panel</p>
            </div>
          </div>

          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Buyurtmalarni<br />samarali boshqaring
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Barcha buyurtmalar, statistika va yetkazib<br />berish holatini bir joyda kuzating.
          </p>
        </div>

        <div className="relative space-y-3">
          {[
            { Icon: BarChart3, text: 'Real vaqt statistikasi va hisobotlar' },
            { Icon: Truck, text: "Buyurtma holati va yetkazib berish" },
            { Icon: Bell, text: 'Telegram orqali avtomatik bildirishnomalar' },
          ].map(({ Icon, text }) => (
            <div key={text}
              className="flex items-center gap-4 rounded-2xl px-4 py-3.5 border"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-indigo-400" strokeWidth={2} />
              </div>
              <span className="text-slate-300 text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center px-8 bg-slate-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <BookOpen size={18} color="white" strokeWidth={2.5} />
            </div>
            <span className="font-black text-slate-800 text-lg">INTIZOM Admin</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900">Xush kelibsiz</h2>
            <p className="text-slate-400 text-sm mt-1.5">Admin hisobingiz bilan kiring</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Login
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800
                           outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                           transition-all placeholder:text-slate-300 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Parol
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 pr-12 text-sm
                             text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                             transition-all placeholder:text-slate-300 shadow-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPass ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <AlertCircle size={16} className="text-red-500 shrink-0" strokeWidth={2} />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all
                         active:scale-95 disabled:opacity-60 shadow-lg shadow-indigo-500/20 mt-2"
              style={{ background: loading ? '#6366f1' : '#4F46E5' }}>
              {loading ? 'Tekshirilmoqda...' : 'Kirish'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
