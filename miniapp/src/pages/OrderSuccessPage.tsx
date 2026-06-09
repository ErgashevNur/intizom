import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderNumber = location.state?.orderNumber || '';
  const tg = (window as any).Telegram?.WebApp;

  useEffect(() => {
    tg?.HapticFeedback?.notificationOccurred('success');
  }, []);

  const handleClose = () => {
    if (tg) tg.close();
    else navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--tg-theme-bg-color, #f0f2f5)' }}>

      {/* Success animation */}
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
        <span className="text-5xl">✅</span>
      </div>

      <h1 className="text-2xl font-black text-gray-900 mb-2">Buyurtma qabul qilindi!</h1>
      <p className="text-gray-500 text-sm mb-6">Tez orada operatorimiz siz bilan bog'lanadi</p>

      {orderNumber && (
        <div className="card px-6 py-4 mb-6 w-full">
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Buyurtma raqami</p>
          <p className="font-mono font-black text-blue-600 text-2xl">{orderNumber}</p>
          <p className="text-gray-400 text-xs mt-1">Raqamni saqlab qo'ying</p>
        </div>
      )}

      <div className="card p-4 w-full mb-8 text-left space-y-3">
        {[
          { icon: '📞', text: 'Operator siz bilan 1-2 soat ichida bog\'lanadi' },
          { icon: '🚚', text: "Yetkazib berish vaqti belgilanadi" },
          { icon: '💵', text: 'To\'lov kuryerga naqd pul orqali' },
        ].map((item) => (
          <div key={item.text} className="flex items-start gap-3">
            <span className="text-lg">{item.icon}</span>
            <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <span className="text-3xl">📔</span>
        <p className="text-gray-400 text-xs italic mt-2">
          "Intizom — bu kayfiyatga qarab emas,<br />qarorga qarab yashash."
        </p>
      </div>

      <button onClick={handleClose} className="btn-primary w-full">
        Yopish
      </button>
    </div>
  );
}
