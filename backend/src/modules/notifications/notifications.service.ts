import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { Context } from 'telegraf';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { adminOrderKeyboard } from '../telegram/keyboards/keyboards';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly configService: ConfigService,
  ) {}

  private get adminIds(): number[] {
    return this.configService.get<number[]>('telegram.adminIds') || [];
  }

  async notifyAdminsNewOrder(order: Order) {
    const text =
      `🔔 <b>Yangi buyurtma keldi!</b>\n\n` +
      `📋 <b>${order.orderNumber}</b>\n` +
      `👤 ${order.customerName}\n` +
      `📞 ${order.customerPhone}\n` +
      `🗺 ${order.region} — ${order.address}\n` +
      `📦 ${order.quantity} ta × ${(order.totalPrice / order.quantity).toLocaleString()} so'm\n` +
      `💰 Jami: <b>${order.totalPrice.toLocaleString()} so'm</b>`;

    for (const adminId of this.adminIds) {
      try {
        await this.bot.telegram.sendMessage(adminId, text, {
          parse_mode: 'HTML',
          reply_markup: adminOrderKeyboard(order.id, order.status).reply_markup,
        });
      } catch {
        // Admin botni boshlamagan bo'lishi mumkin
      }
    }
  }

  async notifyCustomerStatusChange(order: Order) {
    if (!order.telegramId) return;

    const message = this.buildCustomerMessage(order);
    if (!message) return;

    try {
      await this.bot.telegram.sendMessage(order.telegramId, message, {
        parse_mode: 'HTML',
      });
    } catch {
      // Mijoz botni bloklagan bo'lishi mumkin
    }
  }

  private buildCustomerMessage(order: Order): string | null {
    const name = order.customerName;
    const num = order.orderNumber;

    switch (order.status) {
      case OrderStatus.CONFIRMED:
        return (
          `✅ <b>Hurmatli ${name}!</b>\n\n` +
          `Buyurtmangiz tasdiqlandi va qadoqlanmoqda.\n\n` +
          `📋 Raqam: <code>${num}</code>\n` +
          `📦 ${order.quantity} ta INTIZOM Daftar\n` +
          `💰 ${order.totalPrice.toLocaleString()} so'm (naqd, yetkazib berganda)\n\n` +
          `Kuryer tez orada siz bilan bog'lanadi. 🙏`
        );

      case OrderStatus.SHIPPED:
        return (
          `🚚 <b>Hurmatli ${name}!</b>\n\n` +
          `Buyurtmangiz yetkazib berish yo'lida!\n\n` +
          `📋 Raqam: <code>${num}</code>\n\n` +
          `Kuryer tez orada siz bilan bog'lanadi va manzilni aniqlashtiradi.\n` +
          `💵 To'lov: naqd pul, yetkazib berganda.`
        );

      case OrderStatus.DELIVERED:
        return (
          `🎉 <b>Hurmatli ${name}!</b>\n\n` +
          `Buyurtmangiz muvaffaqiyatli yetkazildi!\n\n` +
          `📋 Raqam: <code>${num}</code>\n\n` +
          `📔 INTIZOM daftarni yoqtirishingizni umid qilamiz.\n\n` +
          `<i>"Intizom — bu kayfiyatga qarab emas, qarorga qarab yashash."</i>`
        );

      case OrderStatus.CANCELLED:
        return (
          `❌ <b>Hurmatli ${name},</b>\n\n` +
          `Afsuski, buyurtmangiz bekor qilindi.\n\n` +
          `📋 Raqam: <code>${num}</code>\n\n` +
          `Qo'shimcha savollar uchun shu bot orqali murojaat qiling.`
        );

      default:
        return null;
    }
  }
}
