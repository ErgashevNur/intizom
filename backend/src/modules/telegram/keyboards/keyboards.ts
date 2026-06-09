import { Markup } from 'telegraf';
import { REGIONS } from '../telegram.constants';

export const mainKeyboard = (miniAppUrl?: string) => {
  const buttons: ReturnType<typeof Markup.button.callback | typeof Markup.button.webApp>[][] = [
    [Markup.button.callback('Buyurtma berish', 'start_order')],
    [Markup.button.callback('Daftar haqida', 'about')],
  ];
  if (miniAppUrl) {
    buttons.push([Markup.button.webApp('Mini App orqali buyurtma', miniAppUrl)]);
  }
  return Markup.inlineKeyboard(buttons);
};

export const aboutKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('Buyurtma berish', 'start_order')],
    [Markup.button.callback('← Orqaga', 'back_main')],
  ]);

export const phoneKeyboard = () =>
  Markup.keyboard([
    [Markup.button.contactRequest('Raqamni avtomatik yuborish')],
  ])
    .oneTime()
    .resize();

export const removeKeyboard = () => Markup.removeKeyboard();

export const regionsKeyboard = () => {
  const rows = [];
  for (let i = 0; i < REGIONS.length; i += 2) {
    const row = [Markup.button.callback(REGIONS[i], `region_${REGIONS[i]}`)];
    if (REGIONS[i + 1]) row.push(Markup.button.callback(REGIONS[i + 1], `region_${REGIONS[i + 1]}`));
    rows.push(row);
  }
  rows.push([Markup.button.callback('✕ Bekor qilish', 'cancel_order')]);
  return Markup.inlineKeyboard(rows);
};

export const skipKeyboard = (label: string) =>
  Markup.inlineKeyboard([
    [Markup.button.callback(label, 'skip_promo')],
    [Markup.button.callback('✕ Bekor qilish', 'cancel_order')],
  ]);

export const quantityKeyboard = (qty: number, price: number, discount?: number) => {
  const baseTotal = qty * price;
  const finalTotal = discount ? baseTotal - discount : baseTotal;
  const label =
    discount
      ? `Tasdiqlash  ·  ${finalTotal.toLocaleString()} so'm  (−${discount.toLocaleString()})`
      : `Tasdiqlash  ·  ${finalTotal.toLocaleString()} so'm`;

  return Markup.inlineKeyboard([
    [
      Markup.button.callback('−', 'qty_minus'),
      Markup.button.callback(`${qty} ta`, 'qty_noop'),
      Markup.button.callback('+', 'qty_plus'),
    ],
    [Markup.button.callback(label, 'qty_confirm')],
    [Markup.button.callback('✕ Bekor qilish', 'cancel_order')],
  ]);
};

export const confirmOrderKeyboard = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback('✓ Tasdiqlash', 'confirm_order'),
      Markup.button.callback('✕ Bekor qilish', 'cancel_order'),
    ],
  ]);

export const adminOrderKeyboard = (orderId: number, status: string) => {
  const rows = [];
  if (status === 'pending') {
    rows.push([
      Markup.button.callback('✓ Tasdiqlash', `admin_confirm_${orderId}`),
      Markup.button.callback('✕ Bekor', `admin_cancel_${orderId}`),
    ]);
  } else if (status === 'confirmed') {
    rows.push([Markup.button.callback('Yo\'lga chiqdi', `admin_ship_${orderId}`)]);
  } else if (status === 'shipped') {
    rows.push([Markup.button.callback('Yetkazildi', `admin_deliver_${orderId}`)]);
  }
  return Markup.inlineKeyboard(rows);
};

export const adminMenuKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('Yangi buyurtmalar', 'admin_pending_orders')],
    [Markup.button.callback('Barcha buyurtmalar', 'admin_all_orders')],
    [Markup.button.callback('Statistika', 'admin_stats')],
  ]);
