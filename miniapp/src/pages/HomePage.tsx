import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProduct } from '../api';
import { Product } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProduct()
      .then(setProduct)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white px-6 py-10 text-center">
        <div className="text-5xl mb-3">📔</div>
        <h1 className="text-3xl font-bold mb-2">INTIZOM</h1>
        <p className="text-blue-200 text-sm">Maqsadga erishish uchun tizimli daftar</p>
        <blockquote className="mt-4 text-blue-100 italic text-sm border-l-2 border-blue-400 pl-4 text-left">
          "Intizom — bu kayfiyatga qarab emas, qarorga qarab yashash."
        </blockquote>
      </div>

      {/* Features */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Daftar sizga nima beradi?</h2>
        <div className="space-y-3">
          {[
            { icon: '🎯', title: 'Maqsadga erishish', desc: 'Aniq, o\'lchanadigan oylik maqsadlar qo\'yish' },
            { icon: '📅', title: 'Kundalik tartib', desc: 'Har kunni Eyzenxauer matritsasi bilan rejalashtirish' },
            { icon: '🔗', title: 'Odat trekeri', desc: 'Zanjirni uzmaslik — har kun belgilab boring' },
            { icon: '💡', title: 'G\'oyalar daftari', desc: 'Yaxshi fikrlarni darhol saqlash joyi' },
            { icon: '📊', title: 'O\'zgarishni ko\'rish', desc: 'Oy boshi va oxiridagi farqni his qilish' },
            { icon: '🧠', title: 'Odat insho', desc: 'Yomon odatdan voz kechish uchun sabab-asosli yozuv' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology */}
      <div className="px-4 pb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Asosiy metodlar</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: 'Atomic Habits', sub: 'Kichik odatlar katta natijalar beradi' },
            { title: 'Start With Why', sub: '"Nima uchun" savoliga javob' },
            { title: 'Eyzenxauer', sub: 'Muhim va shoshilinchni ajrating' },
            { title: 'Hayot balansi', sub: '8 soha muvozanatini saqlang' },
          ].map((m) => (
            <div key={m.title} className="bg-blue-50 rounded-xl p-3">
              <p className="font-semibold text-blue-800 text-sm">{m.title}</p>
              <p className="text-blue-600 text-xs mt-1">{m.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Price */}
      {product && (
        <div className="px-4 pb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-xs">Narxi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {product.price.toLocaleString()} <span className="text-base font-normal">so'm</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs">Yetkazish</p>
                <p className="text-gray-700 text-sm font-medium">Butun O'zbekiston</p>
              </div>
            </div>
            <p className="text-green-600 text-xs mt-2">✓ To'lov: naqd, yetkazib berganda</p>
            {product.soldCount > 0 && (
              <p className="text-gray-400 text-xs mt-1">
                {product.soldCount}+ ta daftar sotilgan
              </p>
            )}
          </div>
        </div>
      )}

      {/* CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate('/order')}
          className="w-full py-4 rounded-xl font-bold text-white text-lg tg-button"
          style={{ backgroundColor: 'var(--tg-theme-button-color, #2563eb)' }}
        >
          🛒 Buyurtma berish
        </button>
      </div>
    </div>
  );
}
