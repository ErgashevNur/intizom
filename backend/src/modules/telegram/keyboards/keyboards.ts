import { Markup } from 'telegraf';
import { REGIONS } from '../telegram.constants';

export const mainKeyboard = (miniAppUrl?: string) => {
  const buttons = [
    [Markup.button.callback('📖 Daftar haqida', 'about')],
    [Markup.button.callback('🛒 Buyurtma berish', 'start_order')],
  ];

  if (miniAppUrl) {
    buttons.push([Markup.button.webApp('📱 Mini App', miniAppUrl)]);
  }

  return Markup.inlineKeyboard(buttons);
};

export const aboutKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('🛒 Buyurtma berish', 'start_order')],
    [Markup.button.callback('⬅️ Orqaga', 'back_main')],
  ]);

export const regionsKeyboard = () => {
  const rows = [];
  for (let i = 0; i < REGIONS.length; i += 2) {
    const row = [Markup.button.callback(REGIONS[i], `region_${REGIONS[i]}`)];
    if (REGIONS[i + 1]) {
      row.push(Markup.button.callback(REGIONS[i + 1], `region_${REGIONS[i + 1]}`));
    }
    rows.push(row);
  }
  rows.push([Markup.button.callback('❌ Bekor qilish', 'cancel_order')]);
  return Markup.inlineKeyboard(rows);
};

export const confirmOrderKeyboard = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Tasdiqlash', 'confirm_order'),
      Markup.button.callback('❌ Bekor qilish', 'cancel_order'),
    ],
  ]);

export const adminOrderKeyboard = (orderId: number, status: string) => {
  const buttons = [];

  if (status === 'pending') {
    buttons.push([
      Markup.button.callback('✅ Tasdiqlash', `admin_confirm_${orderId}`),
      Markup.button.callback('❌ Bekor qilish', `admin_cancel_${orderId}`),
    ]);
  } else if (status === 'confirmed') {
    buttons.push([
      Markup.button.callback('🚚 Yuborildi', `admin_ship_${orderId}`),
    ]);
  } else if (status === 'shipped') {
    buttons.push([
      Markup.button.callback('✅ Yetkazildi', `admin_deliver_${orderId}`),
    ]);
  }

  return Markup.inlineKeyboard(buttons);
};

export const adminMenuKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback('📋 Yangi buyurtmalar', 'admin_pending_orders')],
    [Markup.button.callback('📊 Barcha buyurtmalar', 'admin_all_orders')],
    [Markup.button.callback('📈 Statistika', 'admin_stats')],
  ]);
