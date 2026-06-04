import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminGetOrder, adminUpdateOrderStatus } from '../../api';
import { Order, OrderStatus, STATUS_COLORS, STATUS_LABELS } from '../../types';

const TRANSITIONS: Record<OrderStatus, { next: OrderStatus; label: string } | null> = {
  pending: { next: 'confirmed', label: '✅ Tasdiqlash' },
  confirmed: { next: 'shipped', label: '🚚 Yuborildi deb belgilash' },
  shipped: { next: 'delivered', label: '✅ Yetkazildi deb belgilash' },
  delivered: null,
  cancelled: null,
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    adminGetOrder(Number(id))
      .then((o) => {
        setOrder(o);
        setAdminNote(o.adminNote || '');
      })
      .catch(() => navigate('/admin/login'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const updateStatus = async (status: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      const updated = await adminUpdateOrderStatus(order.id, { status, adminNote });
      setOrder(updated);
    } catch {
      alert('Xatolik yuz berdi');
    } finally {
      setUpdating(false);
    }
  };

  const cancelOrder = async () => {
    if (!order || !confirm('Buyurtmani bekor qilmoqchimisiz?')) return;
    await updateStatus('cancelled');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!order) return null;

  const transition = TRANSITIONS[order.status];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <button onClick={() => navigate('/admin/orders')} className="text-blue-600">←</button>
        <h1 className="font-bold text-gray-900 text-lg">Buyurtma detail</h1>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-mono font-bold text-blue-700 text-xl">{order.orderNumber}</p>
              <p className="text-gray-500 text-xs mt-1">
                {new Date(order.createdAt).toLocaleString('uz-UZ')}
              </p>
            </div>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </span>
          </div>
        </div>

        {/* Customer info */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-700 text-sm">Mijoz ma'lumotlari</h2>
          {[
            { label: '👤 Ism', value: order.customerName },
            { label: '📞 Telefon', value: order.customerPhone },
            { label: '🗺️ Viloyat', value: order.region },
            { label: '📍 Manzil', value: order.address },
          ].map((f) => (
            <div key={f.label} className="flex justify-between gap-4">
              <span className="text-gray-500 text-sm">{f.label}</span>
              <span className="text-gray-900 text-sm font-medium text-right">{f.value}</span>
            </div>
          ))}
        </div>

        {/* Order info */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-700 text-sm">Buyurtma</h2>
          {[
            { label: '📦 Mahsulot', value: order.product?.name || 'INTIZOM Daftar' },
            { label: '🔢 Miqdor', value: `${order.quantity} ta` },
            { label: '💰 Jami', value: `${order.totalPrice.toLocaleString()} so'm` },
          ].map((f) => (
            <div key={f.label} className="flex justify-between">
              <span className="text-gray-500 text-sm">{f.label}</span>
              <span className="text-gray-900 text-sm font-semibold">{f.value}</span>
            </div>
          ))}
        </div>

        {/* Admin note */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Admin uchun izoh</label>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Kuryer nomi, vaqt, boshqa izohlar..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {transition && (
            <button
              onClick={() => updateStatus(transition.next)}
              disabled={updating}
              className="w-full py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {updating ? '...' : transition.label}
            </button>
          )}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <button
              onClick={cancelOrder}
              disabled={updating}
              className="w-full py-3 rounded-xl font-semibold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition"
            >
              ❌ Bekor qilish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
