import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, User, Phone, MapPin, Package,
  CheckCircle2, Clock, Truck, XCircle, PartyPopper,
  StickyNote
} from 'lucide-react';
import { adminGetOrder, adminUpdateOrderStatus } from '../../api';
import { Order, OrderStatus, STATUS_COLORS, STATUS_LABELS } from '../../types';
import AdminLayout from './AdminLayout';

const TIMELINE = [
  { status: 'pending' as OrderStatus, label: 'Buyurtma keldi', Icon: Clock },
  { status: 'confirmed' as OrderStatus, label: 'Tasdiqlandi', Icon: CheckCircle2 },
  { status: 'shipped' as OrderStatus, label: "Yo'lga chiqdi", Icon: Truck },
  { status: 'delivered' as OrderStatus, label: 'Yetkazildi', Icon: PartyPopper },
];

const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];

const NEXT_ACTIONS: Partial<Record<OrderStatus, { status: OrderStatus; label: string; cls: string }>> = {
  pending: { status: 'confirmed', label: 'Tasdiqlash', cls: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' },
  confirmed: { status: 'shipped', label: "Yo'lga chiqdi deb belgilash", cls: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' },
  shipped: { status: 'delivered', label: 'Yetkazildi deb belgilash', cls: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' },
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    adminGetOrder(Number(id))
      .then((o) => { setOrder(o); setNote(o.adminNote || ''); })
      .catch(() => navigate('/admin/login'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const updateStatus = async (status: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      setOrder(await adminUpdateOrderStatus(order.id, { status, adminNote: note }));
    } catch { alert('Xatolik yuz berdi'); }
    finally { setUpdating(false); }
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-screen">
        <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  if (!order) return null;

  const currentIdx = STATUS_ORDER.indexOf(order.status);
  const nextAction = NEXT_ACTIONS[order.status];

  return (
    <AdminLayout>
      <div className="p-8 max-w-5xl">
        {/* Back + breadcrumb */}
        <button onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm transition-colors mb-6">
          <ArrowLeft size={15} strokeWidth={2.5} />
          Buyurtmalarga qaytish
        </button>

        {/* Page header */}
        <div className="flex items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-slate-800">{order.orderNumber}</h1>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${STATUS_COLORS[order.status]}`}>
                {STATUS_LABELS[order.status]}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              {new Date(order.createdAt).toLocaleString('uz-UZ', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Left: 2/3 */}
          <div className="col-span-2 space-y-4">

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Buyurtma holati</p>

              {order.status === 'cancelled' ? (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-5 py-4">
                  <XCircle size={20} className="text-red-500 shrink-0" strokeWidth={2} />
                  <div>
                    <p className="text-red-700 font-bold text-sm">Bekor qilingan</p>
                    <p className="text-red-500 text-xs mt-0.5">Bu buyurtma bekor qilindi</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  {TIMELINE.map((step, idx) => {
                    const done = STATUS_ORDER.indexOf(step.status) <= currentIdx;
                    const active = step.status === order.status;
                    const Icon = step.Icon;
                    return (
                      <div key={step.status} className="flex items-center flex-1">
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            active ? 'ring-4 ring-indigo-100' : ''
                          } ${done ? 'bg-indigo-600' : 'bg-slate-100'}`}>
                            <Icon size={17} color={done ? 'white' : '#CBD5E1'} strokeWidth={2} />
                          </div>
                          <p className={`text-xs font-medium text-center w-20 leading-tight ${
                            done ? 'text-slate-700' : 'text-slate-300'
                          }`}>{step.label}</p>
                        </div>
                        {idx < TIMELINE.length - 1 && (
                          <div className={`flex-1 h-0.5 mb-6 mx-1 rounded-full transition-all ${
                            STATUS_ORDER.indexOf(TIMELINE[idx + 1].status) <= currentIdx
                              ? 'bg-indigo-600' : 'bg-slate-100'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Customer */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Mijoz ma'lumotlari</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "To'liq ism", value: order.customerName, Icon: User },
                  { label: 'Telefon', value: order.customerPhone, Icon: Phone },
                  { label: 'Viloyat', value: order.region, Icon: MapPin },
                  { label: 'Manzil', value: order.address, Icon: MapPin },
                ].map(({ label, value, Icon }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3.5">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={13} className="text-slate-400" strokeWidth={2} />
                      <p className="text-slate-400 text-xs font-semibold">{label}</p>
                    </div>
                    <p className="text-slate-800 font-semibold text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin note */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <StickyNote size={14} className="text-slate-400" strokeWidth={2} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ichki izoh</p>
              </div>
              <textarea value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="Kuryer nomi, yetkazish vaqti, qo'shimcha ma'lumot..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700
                           outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
                           resize-none placeholder:text-slate-300 transition-all"
              />
            </div>
          </div>

          {/* Right: 1/3 */}
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Package size={14} className="text-slate-400" strokeWidth={2} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Buyurtma</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Mahsulot', value: 'INTIZOM Daftar' },
                  { label: 'Miqdor', value: `${order.quantity} ta` },
                  { label: 'Narx/ta', value: `${(order.totalPrice / order.quantity).toLocaleString()} so'm` },
                ].map((f) => (
                  <div key={f.label} className="flex justify-between items-center">
                    <p className="text-slate-400 text-xs">{f.label}</p>
                    <p className="text-slate-700 text-sm font-semibold">{f.value}</p>
                  </div>
                ))}
                <div className="border-t border-slate-100 pt-3 flex justify-between items-end">
                  <p className="text-slate-600 font-bold text-xs uppercase tracking-wide">Jami</p>
                  <div className="text-right">
                    <p className="text-indigo-700 font-black text-xl leading-none">{order.totalPrice.toLocaleString()}</p>
                    <p className="text-slate-400 text-xs mt-0.5">so'm · naqd</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-2.5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Amallar</p>

              {nextAction && (
                <button onClick={() => updateStatus(nextAction.status)} disabled={updating}
                  className={`w-full py-3 rounded-xl text-white font-bold text-sm transition-all active:scale-95
                             disabled:opacity-50 shadow-md ${nextAction.cls}`}>
                  {updating ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saqlanmoqda...
                    </span>
                  ) : nextAction.label}
                </button>
              )}

              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <button
                  onClick={() => { if (confirm('Buyurtmani bekor qilmoqchimisiz?')) updateStatus('cancelled'); }}
                  disabled={updating}
                  className="w-full py-3 rounded-xl font-bold text-sm text-red-600 border border-red-200
                             bg-red-50 hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50">
                  Bekor qilish
                </button>
              )}

              {!nextAction && order.status !== 'cancelled' && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-center">
                  <CheckCircle2 size={20} className="text-emerald-500 mx-auto mb-1.5" strokeWidth={2} />
                  <p className="text-emerald-700 font-bold text-sm">Buyurtma yakunlandi</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
