import {
  Action,
  Command,
  Ctx,
  InjectBot,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { Context } from 'telegraf';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { ORDER_WIZARD_ID, STATUS_LABELS } from './telegram.constants';
import {
  aboutKeyboard,
  adminMenuKeyboard,
  adminOrderKeyboard,
  mainKeyboard,
} from './keyboards/keyboards';
import { OrderStatus } from '../orders/entities/order.entity';

@Update()
@Injectable()
export class TelegramUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly configService: ConfigService,
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
  ) {}

  private get adminIds(): number[] {
    return this.configService.get<number[]>('telegram.adminIds') || [];
  }

  private get miniAppUrl(): string {
    return this.configService.get<string>('telegram.miniAppUrl') || '';
  }

  private isAdmin(userId: number): boolean {
    return this.adminIds.includes(userId);
  }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await this.usersService.findOrCreate(ctx.from);

    const name = ctx.from.first_name || 'Foydalanuvchi';

    await ctx.replyWithHTML(
      `Salom, <b>${name}</b>! 👋\n\n` +
      `📔 <b>INTIZOM</b> — maqsadga erishish uchun tizimli daftar\n\n` +
      `Har bir sahifa sizni intizomga, har bir kun esa maqsadingizga bir qadam yaqinlashtiradi.\n\n` +
      `<i>"Intizom — bu kayfiyatga qarab emas, qarorga qarab yashash."</i>\n\n` +
      `Nima qilmoqchisiz?`,
      mainKeyboard(this.miniAppUrl),
    );
  }

  @Command('cancel')
  async onCancel(@Ctx() ctx: Context) {
    await ctx.reply('Bekor qilindi.');
  }

  @Action('about')
  async onAbout(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `📔 <b>INTIZOM Daftar haqida</b>\n\n` +
      `INTIZOM — bu oddiy bloknot emas, balki maqsadga erishish va ` +
      `kundalik hayotni tartiblash uchun mo'ljallangan tizimli daftar.\n\n` +
      `<b>Daftar sizga nima beradi?</b>\n` +
      `✅ Oylik maqsad qo'yish va kuzatish\n` +
      `✅ Kunlik reja (Eyzenxauer matritsasi)\n` +
      `✅ Odat trekeri — zanjirni uzmaslik\n` +
      `✅ Yomon odatdan voz kechish (sabab insho)\n` +
      `✅ G'oyalarni saqlash\n` +
      `✅ Oy oxiri "avval/keyin" tahlili\n\n` +
      `<b>Asosiy metodologiyalar:</b>\n` +
      `📚 Atomic Habits\n` +
      `🎯 Start With Why\n` +
      `⚡ Eyzenxauer matritsasi\n` +
      `⚖️ Hayot sohalari muvozanati\n\n` +
      `💰 <b>Narxi: 49,000 so'm</b>\n` +
      `📦 Yetkazib berish: Butun O'zbekiston\n` +
      `💵 To'lov: Naqd, yetkazib berganda`,
      { parse_mode: 'HTML', reply_markup: aboutKeyboard().reply_markup },
    );
  }

  @Action('back_main')
  async onBackMain(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `📔 <b>INTIZOM</b> — maqsadga erishish uchun tizimli daftar\n\n` +
      `<i>"Intizom — bu kayfiyatga qarab emas, qarorga qarab yashash."</i>\n\n` +
      `Nima qilmoqchisiz?`,
      { parse_mode: 'HTML', reply_markup: mainKeyboard(this.miniAppUrl).reply_markup },
    );
  }

  @Action('start_order')
  async onStartOrder(@Ctx() ctx: any) {
    await ctx.answerCbQuery();
    await ctx.scene.enter(ORDER_WIZARD_ID);
  }

  @Command('admin')
  async onAdmin(@Ctx() ctx: Context) {
    if (!this.isAdmin(ctx.from.id)) {
      await ctx.reply('❌ Ruxsat yo\'q.');
      return;
    }
    await ctx.replyWithHTML(
      '🔐 <b>Admin panel</b>\n\nNimani ko\'rmoqchisiz?',
      adminMenuKeyboard(),
    );
  }

  @Action('admin_pending_orders')
  async onAdminPendingOrders(@Ctx() ctx: Context) {
    if (!this.isAdmin(ctx.from.id)) return ctx.answerCbQuery('Ruxsat yo\'q');
    await ctx.answerCbQuery();

    const orders = await this.ordersService.findAll(OrderStatus.PENDING);
    if (orders.length === 0) {
      await ctx.reply('📭 Yangi buyurtmalar yo\'q.');
      return;
    }

    for (const order of orders.slice(0, 10)) {
      const text =
        `📋 <b>${order.orderNumber}</b>\n` +
        `👤 ${order.customerName}\n` +
        `📞 ${order.customerPhone}\n` +
        `🗺️ ${order.region} — ${order.address}\n` +
        `📦 ${order.quantity} ta × ${(order.totalPrice / order.quantity).toLocaleString()} = ` +
        `<b>${order.totalPrice.toLocaleString()} so'm</b>\n` +
        `🕐 ${new Date(order.createdAt).toLocaleString('uz-UZ')}`;

      await ctx.replyWithHTML(text, adminOrderKeyboard(order.id, order.status));
    }
  }

  @Action('admin_all_orders')
  async onAdminAllOrders(@Ctx() ctx: Context) {
    if (!this.isAdmin(ctx.from.id)) return ctx.answerCbQuery('Ruxsat yo\'q');
    await ctx.answerCbQuery();

    const orders = await this.ordersService.findAll();
    if (orders.length === 0) {
      await ctx.reply('📭 Hali buyurtmalar yo\'q.');
      return;
    }

    const lines = orders.slice(0, 20).map(
      (o) =>
        `${STATUS_LABELS[o.status] || o.status} <b>${o.orderNumber}</b> — ${o.customerName} — ${o.totalPrice.toLocaleString()} so'm`,
    );

    await ctx.replyWithHTML(
      `📊 <b>So'nggi buyurtmalar (${orders.length} ta):</b>\n\n` + lines.join('\n'),
    );
  }

  @Action('admin_stats')
  async onAdminStats(@Ctx() ctx: Context) {
    if (!this.isAdmin(ctx.from.id)) return ctx.answerCbQuery('Ruxsat yo\'q');
    await ctx.answerCbQuery();

    const stats = await this.ordersService.getStats();
    const usersCount = await this.usersService.count();

    await ctx.replyWithHTML(
      `📈 <b>Statistika</b>\n\n` +
      `👥 Foydalanuvchilar: <b>${usersCount}</b>\n\n` +
      `📦 Buyurtmalar:\n` +
      `🟡 Kutilmoqda: <b>${stats.pending}</b>\n` +
      `🟢 Tasdiqlangan: <b>${stats.confirmed}</b>\n` +
      `🚚 Yuborilgan: <b>${stats.shipped}</b>\n` +
      `✅ Yetkazilgan: <b>${stats.delivered}</b>\n` +
      `❌ Bekor qilingan: <b>${stats.cancelled}</b>\n` +
      `📊 Jami: <b>${stats.total}</b>\n\n` +
      `💰 Daromad (tasdiqlangan+): <b>${stats.revenue.toLocaleString()} so'm</b>`,
    );
  }

  @Action(/^admin_(confirm|cancel|ship|deliver)_(\d+)$/)
  async onAdminOrderAction(@Ctx() ctx: Context) {
    if (!this.isAdmin(ctx.from.id)) return;

    const data = (ctx as any).callbackQuery?.data as string;
    const match = data.match(/^admin_(confirm|cancel|ship|deliver)_(\d+)$/);
    if (!match) return;

    const [, action, idStr] = match;
    const orderId = parseInt(idStr, 10);

    const statusMap: Record<string, OrderStatus> = {
      confirm: OrderStatus.CONFIRMED,
      cancel: OrderStatus.CANCELLED,
      ship: OrderStatus.SHIPPED,
      deliver: OrderStatus.DELIVERED,
    };

    const newStatus = statusMap[action];
    const order = await this.ordersService.updateStatus(orderId, newStatus);

    await ctx.answerCbQuery(`✅ Status o'zgartirildi: ${STATUS_LABELS[newStatus]}`);

    const text =
      `📋 <b>${order.orderNumber}</b> — ${STATUS_LABELS[newStatus]}\n` +
      `👤 ${order.customerName}\n` +
      `📞 ${order.customerPhone}`;

    await ctx.editMessageText(text, {
      parse_mode: 'HTML',
      reply_markup: adminOrderKeyboard(order.id, order.status).reply_markup,
    });

    // Notify customer if they used the bot
    if (order.telegramId) {
      try {
        const customerMsg = this.getCustomerStatusMessage(order.orderNumber, newStatus);
        await this.bot.telegram.sendMessage(order.telegramId, customerMsg, { parse_mode: 'HTML' });
      } catch {
        // Customer may have blocked the bot
      }
    }
  }

  async notifyAdmins(orderNumber: string, customerName: string, phone: string, region: string, address: string, quantity: number, totalPrice: number, orderId: number) {
    const text =
      `🔔 <b>Yangi buyurtma!</b>\n\n` +
      `📋 <b>${orderNumber}</b>\n` +
      `👤 ${customerName}\n` +
      `📞 ${phone}\n` +
      `🗺️ ${region} — ${address}\n` +
      `📦 ${quantity} ta — <b>${totalPrice.toLocaleString()} so'm</b>`;

    for (const adminId of this.adminIds) {
      try {
        await this.bot.telegram.sendMessage(adminId, text, {
          parse_mode: 'HTML',
          reply_markup: adminOrderKeyboard(orderId, 'pending').reply_markup,
        });
      } catch {
        // Admin may not have started the bot
      }
    }
  }

  private getCustomerStatusMessage(orderNumber: string, status: OrderStatus): string {
    const messages: Partial<Record<OrderStatus, string>> = {
      [OrderStatus.CONFIRMED]: `✅ <b>Buyurtmangiz tasdiqlandi!</b>\n\n📋 ${orderNumber}\n\nTez orada yetkazib beriladi.`,
      [OrderStatus.SHIPPED]: `🚚 <b>Buyurtmangiz yo'lda!</b>\n\n📋 ${orderNumber}\n\nKuryer siz bilan bog'lanadi.`,
      [OrderStatus.DELIVERED]: `🎉 <b>Buyurtmangiz yetkazildi!</b>\n\n📋 ${orderNumber}\n\nINTIZOM daftarni yoqtirishingizni umid qilamiz! 📔`,
      [OrderStatus.CANCELLED]: `❌ <b>Buyurtmangiz bekor qilindi.</b>\n\n📋 ${orderNumber}\n\nSavollar bo'lsa, bot orqali murojaat qiling.`,
    };
    return messages[status] || `📋 ${orderNumber} buyurtmangiz holati yangilandi: ${STATUS_LABELS[status]}`;
  }
}
