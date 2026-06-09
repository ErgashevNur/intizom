import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Package, CheckCircle2, Clock,
  ChevronRight, Truck, ArrowUpRight
} from 'lucide-react';
import { adminGetOrders, adminGetStats } from '../../api';
import { Order, Stats, STATUS_COLORS, STATUS_LABELS } from '../../types';
import AdminLayout from './AdminLayout';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminGetStats(), adminGetOrders()])
      .then(([s, orders]) => { setStats(s); setRecentOrders(orders.slice(0, 8)); })
      .catch(() => navigate('/admin/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-screen">
        <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-black text-slate-800">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Bugungi holat va statistika</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* Revenue */}
          <div className="col-span-2 rounded-2xl p-5 text-white shadow-lg shadow-indigo-500/10"
            style={{ background: 'linear-gradient(135deg, #312e81 0%, #4338ca 50%, #4f46e5 100%)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <TrendingUp size={18} color="white" strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-indigo-200 bg-white/10 px-2.5 py-1 rounded-full">
                Tasdiqlangan
              </span>
            </div>
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">Jami daromad</p>
            <p className="text-3xl font-black tracking-tight">
              {stats?.revenue.toLocaleString() ?? 0}
              <span className="text-lg font-medium text-indigo-300 ml-1">so'm</span>
            </p>
          </div>

          {[
            { label: 'Jami buyurtma', value: stats?.total ?? 0, sub: 'Barcha vaqt', Icon: Package, color: '#0f172a', light: '#f1f5f9', accent: '#334155' },
            { label: 'Kutilmoqda', value: stats?.pending ?? 0, sub: 'Tasdiq kerak', Icon: Clock, color: '#92400e', light: '#fffbeb', accent: '#b45309' },
            { label: 'Yetkazilgan', value: stats?.delivered ?? 0, sub: `${stats?.shipped ?? 0} ta yo'lda`, Icon: CheckCircle2, color: '#064e3b', light: '#ecfdf5', accent: '#059669' },
          ].map(({ label, value, sub, Icon, color, light, accent }) => (
            <div key={label} className="rounded-2xl p-5 border border-slate-100 shadow-sm" style={{ background: light }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accent}15` }}>
                  <Icon size={17} style={{ color: accent }} strokeWidth={2} />
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: accent }}>
                {label}
              </p>
              <p className="text-2xl font-black" style={{ color }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: `${accent}99` }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button onClick={() => navigate('/admin/orders?status=pending')}
            className="bg-white rounded-2xl border border-slate-100 p-5 text-left hover:border-amber-200 hover:shadow-md transition-all group shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock size={18} className="text-amber-600" strokeWidth={2} />
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" strokeWidth={2} />
            </div>
            <p className="text-2xl font-black text-slate-800">{stats?.pending ?? 0}</p>
            <p className="text-slate-600 text-sm font-semibold mt-0.5">Yangi buyurtmalar</p>
            <p className="text-slate-400 text-xs mt-0.5">Tasdiqlash kutilmoqda</p>
          </button>

          <button onClick={() => navigate('/admin/orders?status=shipped')}
            className="bg-white rounded-2xl border border-slate-100 p-5 text-left hover:border-blue-200 hover:shadow-md transition-all group shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Truck size={18} className="text-blue-600" strokeWidth={2} />
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" strokeWidth={2} />
            </div>
            <p className="text-2xl font-black text-slate-800">{stats?.shipped ?? 0}</p>
            <p className="text-slate-600 text-sm font-semibold mt-0.5">Yo'ldagi buyurtmalar</p>
            <p className="text-slate-400 text-xs mt-0.5">Yetkazilishini kuting</p>
          </button>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-800 text-sm">So'nggi buyurtmalar</h2>
              <p className="text-slate-400 text-xs mt-0.5">{recentOrders.length} ta buyurtma</p>
            </div>
            <button onClick={() => navigate('/admin/orders')}
              className="flex items-center gap-1.5 text-indigo-600 text-xs font-semibold hover:text-indigo-700 transition-colors">
              Barchasini ko'r <ArrowUpRight size={13} strokeWidth={2.5} />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-16 text-center">
              <Package size={32} className="text-slate-200 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-slate-400 text-sm font-medium">Hali buyurtmalar yo'q</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentOrders.map((order) => (
                <button key={order.id} onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-50/80 transition-colors text-left group">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-slate-400">#{order.id}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{order.customerName}</p>
                    <p className="text-slate-400 text-xs mt-0.5 truncate">{order.region} · {order.customerPhone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-700 text-sm">{order.totalPrice.toLocaleString()} so'm</p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold mt-1 ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <ChevronRight size={15} className="text-slate-200 group-hover:text-slate-400 shrink-0 transition-colors" strokeWidth={2} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
