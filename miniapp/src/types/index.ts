export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  soldCount: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  region: string;
  address: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  adminNote?: string;
  createdAt: string;
  product: Product;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface CreateOrderPayload {
  telegramId?: number;
  customerName: string;
  customerPhone: string;
  region: string;
  address: string;
  quantity: number;
}

export interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  revenue: number;
}

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

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Kutilmoqda',
  confirmed: 'Tasdiqlangan',
  shipped: 'Yuborilgan',
  delivered: 'Yetkazilgan',
  cancelled: 'Bekor qilingan',
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};
