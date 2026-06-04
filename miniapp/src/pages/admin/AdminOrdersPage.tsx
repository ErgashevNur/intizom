import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminGetOrders } from '../../api';
import { Order, STATUS_COLORS, STATUS_LABELS } from '../../types';

const STATUS_OPTIONS = [
  { value: '', label: 'Hammasi' },
  { value: 'pending', label: '🟡 Kutilmoqda' },
  { value: 'confirmed', label: '🟢 Tasdiqlangan' },
  { value: 'shipped', label: '🚚 Yuborilgan' },
  { value: 'delivered', label: '✅ Yetkazilgan' },
  { value: 'cancelled', label: '❌ Bekor' },
];

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminGetOrders(statusFilter || undefined)
      .then(setOrders)
      .catch(() => navigate('/admin/login'))
      .finally(() => setLoading(false));
  }, [statusFilter, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => navigate('/admin')} className="text-blue-600">←</button>
        <h1 className="font-bold text-gray-900 text-lg">Buyurtmalar</h1>
      </div>

      {/* Filter tabs */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => setSearchParams(s.value ? { status: s.value } : {})}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              statusFilter === s.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>Buyurtmalar yo'q</p>
        </div>
      ) : (
        <div className="px-4 py-3 space-y-3">
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => navigate(`/admin/orders/${order.id}`)}
              className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-sm font-bold text-blue-700">{order.orderNumber}</p>
                  <p className="text-gray-900 font-medium text-sm mt-1">{order.customerName}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{order.customerPhone}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {order.region} · {order.quantity} ta
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <p className="text-gray-700 font-bold text-sm mt-2">
                    {order.totalPrice.toLocaleString()} so'm
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
