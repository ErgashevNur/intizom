export interface CreateOrderPayload {
  telegramId?: number;
  customerName: string;
  customerPhone: string;
  region: string;
  address: string;
  quantity: number;
}

export interface UpdateOrderStatusPayload {
  status: string;
  adminNote?: string;
}
