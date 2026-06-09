import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProduct } from '../api';
import { Product } from '../types';

const features = [
  { icon: '🎯', title: 'Oylik maqsad', desc: "Aniq va o'lchanadigan maqsadlar qo'yish" },
  { icon: '📅', title: 'Kunlik reja', desc: 'Eyzenxauer matritsasi bilan tartib' },
  { icon: '🔗', title: 'Odat trekeri', desc: "Zanjirni uzmaslik — har kun belgilang" },
  { icon: '💡', title: "G'oyalar", desc: "Ilhom kelganida darhol yozib qo'ying" },
  { icon: '🧠', title: 'Odat insho', desc: 'Yomon odatdan voz kechish usuli' },
  { icon: '📊', title: "O'zgarishni ko'r", desc: "Oy boshi va oxiri taqqoslash" },
];

const methods = [
  { title: 'Atomic Habits', emoji: '⚛️' },
  { title: 'Start With Why', emoji: '🎯' },
  { title: 'Eyzenxauer', emoji: '⚡' },
  { title: 'Hayot balansi', emoji: '⚖️' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    getProduct().then(setProduct).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--tg-theme-bg-color, #f0f2f5)' }}>

      {/* Hero */}
      <div className="relative overflow-hidden px-5 pt-10 pb-10"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 shadow-lg"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
            <span className="text-4xl">📔</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">INTIZOM</h1>
          <p className="text-blue-200 text-sm font-medium mb-5">
            Maqsadga erishish uchun tizimli daftar
          </p>
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20">
            <p className="text-white/90 text-sm italic leading-relaxed">
              "Intizom — bu kayfiyatga qarab emas,<br />qarorga qarab yashash."
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">

        {/* Price card */}
        {product && (
          <div className="card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Narxi</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">
                {product.price.toLocaleString()}
                <span className="text-base font-normal text-gray-500 ml-1">so'm</span>
              </p>
              {product.soldCount > 0 && (
                <p className="text-xs text-green-600 mt-1 font-medium">
                  ✓ {product.soldCount}+ ta daftar sotilgan
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="bg-green-50 rounded-xl px-3 py-2">
                <p className="text-green-700 text-xs font-semibold">💵 Naqd pul</p>
                <p className="text-green-600 text-xs mt-0.5">Yetkazib berganda</p>
              </div>
              <p className="text-gray-400 text-xs mt-2">🚚 Butun O'zbekiston</p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="card p-4">
          <p className="text-sm font-bold text-gray-700 mb-3">Daftar nima beradi?</p>
          <div className="grid grid-cols-2 gap-2">
            {features.map((f) => (
              <div key={f.title} className="bg-gray-50 rounded-xl p-3">
                <span className="text-xl">{f.icon}</span>
                <p className="text-gray-800 font-semibold text-xs mt-1.5">{f.title}</p>
                <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Methods */}
        <div className="card p-4">
          <p className="text-sm font-bold text-gray-700 mb-3">Asosiy metodlar</p>
          <div className="grid grid-cols-2 gap-2">
            {methods.map((m) => (
              <div key={m.title}
                className="rounded-xl px-3 py-2.5 flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}>
                <span className="text-lg">{m.emoji}</span>
                <p className="text-blue-800 font-semibold text-xs">{m.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4"
        style={{ background: 'linear-gradient(to top, var(--tg-theme-bg-color, #f0f2f5) 70%, transparent)' }}>
        <button onClick={() => navigate('/order')} className="btn-primary shadow-lg">
          🛒 Buyurtma berish — {product?.price.toLocaleString() ?? '49,000'} so'm
        </button>
      </div>
    </div>
  );
}
