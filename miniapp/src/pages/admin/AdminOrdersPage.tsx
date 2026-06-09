import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, ChevronRight, Search } from 'lucide-react';
import { adminGetOrders } from '../../api';
import { Order, STATUS_COLORS, STATUS_LABELS } from '../../types';
import AdminLayout from './AdminLayout';

const TABS = [
  { value: '', label: 'Hammasi' },
  { value: 'pending', label: 'Kutilmoqda' },
  { value: 'confirmed', label: 'Tasdiqlangan' },
  { value: 'shipped', label: "Yo'lda" },
  { value: 'delivered', label: 'Yetkazilgan' },
  { value: 'cancelled', label: 'Bekor' },
];

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || '';
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminGetOrders(status || undefined)
      .then(setOrders)
      .catch(() => navigate('/admin/login'))
      .finally(() => setLoading(false));
  }, [status, navigate]);

  const filtered = orders.filter((o) =>
    !search ||
    o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.customerPhone.includes(search) ||
    o.orderNumber.includes(search)
  );

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-black text-slate-800">Buyurtmalar</h1>
            <p className="text-slate-400 text-sm mt-1">
              {loading ? '...' : `${filtered.length} ta buyurtma`}
            </p>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ism, telefon, buyurtma raqami..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm
                         text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
                         transition-all placeholder:text-slate-300 shadow-sm"
            />
          </div>

          {/* Status tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {TABS.map((tab) => (
              <button key={tab.value}
                onClick={() => setSearchParams(tab.value ? { status: tab.value } : {})}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  status === tab.value
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Head */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50/80">
            {[
              { label: 'Raqam', span: 'col-span-1' },
              { label: 'Mijoz', span: 'col-span-3' },
              { label: 'Viloyat', span: 'col-span-2' },
              { label: 'Miqdor', span: 'col-span-1' },
              { label: 'Summa', span: 'col-span-2' },
              { label: 'Holat', span: 'col-span-2' },
              { label: 'Sana', span: 'col-span-1' },
            ].map((h) => (
              <p key={h.label} className={`${h.span} text-xs font-bold text-slate-400 uppercase tracking-widest`}>
                {h.label}
              </p>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Package size={36} className="text-slate-200 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-slate-500 font-semibold text-sm">Buyurtmalar topilmadi</p>
              <p className="text-slate-400 text-xs mt-1">Boshqa filtr tanlang</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((order) => (
                <button key={order.id} onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className="w-full grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors text-left items-center group">
                  <div className="col-span-1">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {order.orderNumber.replace('INT-', '#')}
                    </span>
                  </div>
                  <div className="col-span-3 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{order.customerName}</p>
                    <p className="text-slate-400 text-xs mt-0.5 truncate">{order.customerPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-600 text-sm truncate">{order.region}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-slate-700 text-sm font-medium">{order.quantity} ta</p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-bold text-slate-800 text-sm">{order.totalPrice.toLocaleString()}</p>
                    <p className="text-slate-400 text-xs">so'm</p>
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-block text-xs px-2.5 py-1 rounded-lg font-semibold ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-between">
                    <p className="text-slate-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' })}
                    </p>
                    <ChevronRight size={14} className="text-slate-200 group-hover:text-slate-400 transition-colors" strokeWidth={2} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
