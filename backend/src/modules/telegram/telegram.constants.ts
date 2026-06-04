export const ORDER_WIZARD_ID = 'ORDER_WIZARD';

export const REGIONS = [
  'Toshkent shahri',
  'Toshkent viloyati',
  'Samarqand',
  'Buxoro',
  'Andijon',
  'Namangan',
  "Farg'ona",
  'Qashqadaryo',
  'Surxondaryo',
  'Jizzax',
  'Sirdaryo',
  'Navoiy',
  'Xorazm',
  "Qoraqalpog'iston",
];

export const STATUS_LABELS: Record<string, string> = {
  pending: '🟡 Kutilmoqda',
  confirmed: '🟢 Tasdiqlangan',
  shipped: '🚚 Yuborilgan',
  delivered: '✅ Yetkazilgan',
  cancelled: '❌ Bekor qilingan',
};

export const STATUS_EMOJI: Record<string, string> = {
  pending: '🟡',
  confirmed: '🟢',
  shipped: '🚚',
  delivered: '✅',
  cancelled: '❌',
};
