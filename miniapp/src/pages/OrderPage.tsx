import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../api';
import { REGIONS } from '../types';

interface FormData {
  customerName: string;
  customerPhone: string;
  region: string;
  address: string;
  quantity: number;
}

const PRICE_PER_ITEM = 49000;

export default function OrderPage() {
  const navigate = useNavigate();
  const tg = (window as any).Telegram?.WebApp;
  const telegramUser = tg?.initDataUnsafe?.user;

  const [form, setForm] = useState<FormData>({
    customerName: telegramUser
      ? [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ')
      : '',
    customerPhone: '',
    region: '',
    address: '',
    quantity: 1,
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.customerName.trim() || form.customerName.trim().length < 2)
      e.customerName = 'Ism kamida 2 ta harf';
    if (!/^\+?[0-9]{9,13}$/.test(form.customerPhone.replace(/\s/g, '')))
      e.customerPhone = 'Telefon raqam noto\'g\'ri';
    if (!form.region) e.region = 'Viloyatni tanlang';
    if (!form.address.trim() || form.address.trim().length < 5)
      e.address = 'Manzil kamida 5 ta belgi';
    if (form.quantity < 1 || form.quantity > 50) e.quantity = '1–50 oralig\'ida';
    setErrors(e as Partial<FormData>);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const order = await createOrder({
        ...form,
        telegramId: telegramUser?.id,
      });
      navigate('/order/success', { state: { orderNumber: order.orderNumber } });
    } catch {
      alert('Xatolik yuz berdi. Qayta urinib ko\'ring.');
    } finally {
      setSubmitting(false);
    }
  };

  const total = form.quantity * PRICE_PER_ITEM;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="text-blue-600 text-lg">←</button>
        <h1 className="font-bold text-gray-900 text-lg">Buyurtma berish</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To'liq ism <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            placeholder="Ism Familiya"
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.customerName ? 'border-red-400' : 'border-gray-200'
            }`}
          />
          {errors.customerName && (
            <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefon raqam <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={form.customerPhone}
            onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
            placeholder="+998901234567"
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.customerPhone ? 'border-red-400' : 'border-gray-200'
            }`}
          />
          {errors.customerPhone && (
            <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>
          )}
        </div>

        {/* Region */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Viloyat <span className="text-red-500">*</span>
          </label>
          <select
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
              errors.region ? 'border-red-400' : 'border-gray-200'
            }`}
          >
            <option value="">Tanlang...</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {errors.region && (
            <p className="text-red-500 text-xs mt-1">{errors.region}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Aniq manzil <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Ko'cha, uy raqami, mo'ljal..."
            rows={3}
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errors.address ? 'border-red-400' : 'border-gray-200'
            }`}
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">{errors.address}</p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Miqdor</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, quantity: Math.max(1, form.quantity - 1) })}
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold"
            >
              −
            </button>
            <span className="text-xl font-bold w-8 text-center">{form.quantity}</span>
            <button
              type="button"
              onClick={() => setForm({ ...form, quantity: Math.min(50, form.quantity + 1) })}
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold"
            >
              +
            </button>
            <span className="text-gray-500 text-sm ml-2">ta daftar</span>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">
              {form.quantity} × {PRICE_PER_ITEM.toLocaleString()} so'm
            </span>
            <span className="font-bold text-blue-800 text-lg">
              {total.toLocaleString()} so'm
            </span>
          </div>
          <p className="text-green-600 text-xs mt-2">
            ✓ To'lov yetkazib berganda naqd pul orqali
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-xl font-bold text-white text-lg disabled:opacity-50 tg-button"
          style={{ backgroundColor: 'var(--tg-theme-button-color, #2563eb)' }}
        >
          {submitting ? '⏳ Yuborilmoqda...' : '✅ Buyurtma berish'}
        </button>
      </form>
    </div>
  );
}
