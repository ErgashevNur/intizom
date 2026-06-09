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

const PRICE = 49000;

export default function OrderPage() {
  const navigate = useNavigate();
  const tg = (window as any).Telegram?.WebApp;
  const tgUser = tg?.initDataUnsafe?.user;

  const [form, setForm] = useState<FormData>({
    customerName: tgUser ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') : '',
    customerPhone: '',
    region: '',
    address: '',
    quantity: 1,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof FormData, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: typeof errors = {};
    if (form.customerName.trim().length < 2) e.customerName = 'Kamida 2 ta harf';
    if (!/^\+?[0-9]{9,13}$/.test(form.customerPhone.replace(/\s/g, '')))
      e.customerPhone = "Noto'g'ri format";
    if (!form.region) e.region = 'Viloyatni tanlang';
    if (form.address.trim().length < 5) e.address = 'Kamida 5 ta belgi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const order = await createOrder({ ...form, telegramId: tgUser?.id });
      navigate('/order/success', { state: { orderNumber: order.orderNumber } });
    } catch {
      alert("Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  };

  const total = form.quantity * PRICE;

  return (
    <div className="min-h-screen pb-8" style={{ background: 'var(--tg-theme-bg-color, #f0f2f5)' }}>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3.5 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-95 transition-transform"
        >
          ←
        </button>
        <div>
          <h1 className="font-bold text-gray-900 text-base leading-none">Buyurtma berish</h1>
          <p className="text-gray-400 text-xs mt-0.5">INTIZOM Daftar</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-3">

        {/* Personal info card */}
        <div className="card p-4 space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Shaxsiy ma'lumot</p>

          <div>
            <label className="label">To'liq ism <span className="text-red-400 normal-case">*</span></label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => set('customerName', e.target.value)}
              placeholder="Ism Familiya"
              className={`input-field ${errors.customerName ? 'input-error' : ''}`}
            />
            {errors.customerName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">⚠ {errors.customerName}</p>}
          </div>

          <div>
            <label className="label">Telefon raqam <span className="text-red-400 normal-case">*</span></label>
            <input
              type="tel"
              value={form.customerPhone}
              onChange={(e) => set('customerPhone', e.target.value)}
              placeholder="+998 90 123 45 67"
              className={`input-field ${errors.customerPhone ? 'input-error' : ''}`}
            />
            {errors.customerPhone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">⚠ {errors.customerPhone}</p>}
          </div>
        </div>

        {/* Address card */}
        <div className="card p-4 space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Yetkazish manzili</p>

          <div>
            <label className="label">Viloyat <span className="text-red-400 normal-case">*</span></label>
            <div className="relative">
              <select
                value={form.region}
                onChange={(e) => set('region', e.target.value)}
                className={`input-field appearance-none pr-10 ${errors.region ? 'input-error' : ''} ${!form.region ? 'text-gray-400' : 'text-gray-900'}`}
              >
                <option value="">Viloyatni tanlang...</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▼</span>
            </div>
            {errors.region && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">⚠ {errors.region}</p>}
          </div>

          <div>
            <label className="label">Aniq manzil <span className="text-red-400 normal-case">*</span></label>
            <textarea
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="Ko'cha nomi, uy raqami, mo'ljal..."
              rows={3}
              className={`input-field resize-none leading-relaxed ${errors.address ? 'input-error' : ''}`}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">⚠ {errors.address}</p>}
          </div>
        </div>

        {/* Quantity card */}
        <div className="card p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Miqdor</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => set('quantity', Math.max(1, form.quantity - 1))}
                className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-700 active:scale-90 transition-transform disabled:opacity-40"
                disabled={form.quantity <= 1}
              >
                −
              </button>
              <div className="text-center min-w-[3rem]">
                <span className="text-2xl font-black text-gray-900">{form.quantity}</span>
                <p className="text-gray-400 text-xs">dona</p>
              </div>
              <button
                type="button"
                onClick={() => set('quantity', Math.min(50, form.quantity + 1))}
                className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-xl font-bold text-white active:scale-90 transition-transform"
              >
                +
              </button>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">{PRICE.toLocaleString()} × {form.quantity}</p>
              <p className="text-xl font-black text-blue-600 mt-0.5">{total.toLocaleString()} <span className="text-sm font-normal">so'm</span></p>
            </div>
          </div>
        </div>

        {/* Payment info */}
        <div className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
          <span className="text-2xl">💵</span>
          <div>
            <p className="text-green-800 font-semibold text-sm">Naqd pul, yetkazib berganda</p>
            <p className="text-green-600 text-xs mt-0.5">To'lovni kuryerga topshirasiz. Oldindan hech narsa to'lashning hojati yo'q.</p>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={submitting} className="btn-primary shadow-md">
          {submitting
            ? <span className="flex items-center justify-center gap-2"><span className="animate-spin">⏳</span> Yuborilmoqda...</span>
            : `✅ Buyurtma berish — ${total.toLocaleString()} so'm`}
        </button>
      </form>
    </div>
  );
}
