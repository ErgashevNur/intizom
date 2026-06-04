import { useLocation, useNavigate } from 'react-router-dom';

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderNumber = location.state?.orderNumber || '';
  const tg = (window as any).Telegram?.WebApp;

  const handleClose = () => {
    if (tg) tg.close();
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="text-7xl mb-6">🎉</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Buyurtmangiz qabul qilindi!</h1>
      {orderNumber && (
        <div className="bg-white rounded-xl px-6 py-3 my-4 shadow-sm">
          <p className="text-gray-500 text-sm">Buyurtma raqami</p>
          <p className="font-mono font-bold text-blue-700 text-xl">{orderNumber}</p>
        </div>
      )}
      <p className="text-gray-600 text-sm leading-relaxed mb-8">
        Tez orada operatorimiz siz bilan bog'lanadi va yetkazib berish vaqtini ma'lum qiladi.
        <br /><br />
        To'lov yetkazib berganda naqd pul orqali amalga oshiriladi.
      </p>
      <div className="text-3xl mb-4">📔</div>
      <p className="text-gray-500 text-sm italic">
        "Intizom — bu kayfiyatga qarab emas, qarorga qarab yashash."
      </p>
      <button
        onClick={handleClose}
        className="mt-8 px-8 py-3 rounded-xl font-semibold text-white tg-button"
        style={{ backgroundColor: 'var(--tg-theme-button-color, #2563eb)' }}
      >
        Yopish
      </button>
    </div>
  );
}
