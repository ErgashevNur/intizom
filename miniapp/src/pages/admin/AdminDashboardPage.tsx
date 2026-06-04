import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminGetStats } from '../../api';
import { Stats } from '../../types';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetStats()
      .then(setStats)
      .catch(() => {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100">
        <h1 className="font-bold text-gray-900 text-lg">📊 Dashboard</h1>
        <button onClick={logout} className="text-red-500 text-sm">Chiqish</button>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Revenue */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-5 text-white">
          <p className="text-blue-200 text-sm">Jami daromad</p>
          <p className="text-3xl font-bold mt-1">
            {stats?.revenue?.toLocaleString() || 0} <span className="text-xl font-normal">so'm</span>
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Jami buyurtma', value: stats?.total, color: 'bg-gray-100', emoji: '📦' },
            { label: 'Kutilmoqda', value: stats?.pending, color: 'bg-yellow-50', emoji: '🟡' },
            { label: 'Tasdiqlangan', value: stats?.confirmed, color: 'bg-green-50', emoji: '🟢' },
            { label: 'Yuborilgan', value: stats?.shipped, color: 'bg-blue-50', emoji: '🚚' },
            { label: 'Yetkazilgan', value: stats?.delivered, color: 'bg-emerald-50', emoji: '✅' },
            { label: 'Bekor', value: stats?.cancelled, color: 'bg-red-50', emoji: '❌' },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-xl p-4`}>
              <span className="text-xl">{s.emoji}</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">{s.value ?? 0}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Nav buttons */}
        <div className="space-y-2">
          <button
            onClick={() => navigate('/admin/orders?status=pending')}
            className="w-full bg-white rounded-xl px-4 py-3 text-left flex items-center justify-between shadow-sm border border-gray-100"
          >
            <span className="font-medium text-gray-700">🟡 Yangi buyurtmalar</span>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
              {stats?.pending ?? 0}
            </span>
          </button>
          <button
            onClick={() => navigate('/admin/orders')}
            className="w-full bg-white rounded-xl px-4 py-3 text-left flex items-center justify-between shadow-sm border border-gray-100"
          >
            <span className="font-medium text-gray-700">📋 Barcha buyurtmalar</span>
            <span className="text-gray-400">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
