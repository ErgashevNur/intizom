import { Action, Command, Ctx, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { Context } from 'telegraf';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { PromoService } from '../promo/promo.service';
import { ProductsService } from '../products/products.service';
import { DiscountType } from '../promo/entities/promo-code.entity';
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
    private readonly promoService: PromoService,
    private readonly productsService: ProductsService,
  ) {}

  private get adminIds(): number[] {
    return this.configService.get<number[]>('telegram.adminIds') || [];
  }

  private get miniAppUrl(): string {
    return this.configService.get<string>('telegram.miniAppUrl') || '';
  }

  private isAdmin(id: number) {
    return this.adminIds.includes(id);
  }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await this.usersService.findOrCreate(ctx.from);
    const name = ctx.from.first_name || 'Mehmon';
    const product = await this.productsService.findMain();
    const price = product?.price ?? 49000;

    await ctx.replyWithHTML(
      `Salom, <b>${name}</b>!\n\n` +
      `📔  <b>INTIZOM</b> — maqsadga erishish uchun tizimli daftar\n\n` +
      `Narxi: <b>${price.toLocaleString()} so'm</b>\n` +
      `Yetkazish: Butun O'zbekiston\n` +
      `To'lov: Naqd, yetkazib berganda`,
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
      `📔  <b>INTIZOM daftar</b>\n\n` +
      `Dunyodagi eng kuchli produktivlik metodlari asosida tuzilgan:\n\n` +
      `  · Atomic Habits — odat shakllantirish\n` +
      `  · Start With Why — maqsad sababi\n` +
      `  · Eyzenxauer matritsasi — kunlik tartib\n` +
      `  · Hayot sohalari balansi\n\n` +
      `Bir oyda nima o'zgaradi:\n` +
      `  ✓ Aniq oylik maqsad\n` +
      `  ✓ Kundalik reja va eng muhim ish\n` +
      `  ✓ Odat trekeri\n` +
      `  ✓ G'oyalar daftari\n` +
      `  ✓ Oy oxiri natija tahlili\n\n` +
      `<b>49 000 so'm</b>  ·  Naqd, yetkazib berganda`,
      { parse_mode: 'HTML', reply_markup: aboutKeyboard().reply_markup },
    );
  }

  @Action('back_main')
  async onBackMain(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `📔  <b>INTIZOM</b> — maqsadga erishish uchun tizimli daftar\n\n` +
      `Narxi: <b>49 000 so'm</b>  ·  Naqd, yetkazib berganda`,
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
    if (!this.isAdmin(ctx.from.id)) return;
    await ctx.replyWithHTML('<b>Admin panel</b>', adminMenuKeyboard());
  }

  @Action('admin_pending_orders')
  async onAdminPending(@Ctx() ctx: Context) {
    if (!this.isAdmin(ctx.from.id)) return ctx.answerCbQuery();
    await ctx.answerCbQuery();

    const orders = await this.ordersService.findAll(OrderStatus.PENDING);
    if (!orders.length) { await ctx.reply('Yangi buyurtmalar yo\'q.'); return; }

    for (const o of orders.slice(0, 10)) {
      await ctx.replyWithHTML(
        `<b>${o.orderNumber}</b>\n` +
        `${o.customerName}  ·  ${o.customerPhone}\n` +
        `${o.region}, ${o.address}\n` +
        `${o.quantity} ta  ·  <b>${o.totalPrice.toLocaleString()} so'm</b>`,
        adminOrderKeyboard(o.id, o.status),
      );
    }
  }

  @Action('admin_all_orders')
  async onAdminAll(@Ctx() ctx: Context) {
    if (!this.isAdmin(ctx.from.id)) return ctx.answerCbQuery();
    await ctx.answerCbQuery();

    const orders = await this.ordersService.findAll();
    if (!orders.length) { await ctx.reply('Buyurtmalar yo\'q.'); return; }

    const lines = orders.slice(0, 20).map(
      (o) => `${STATUS_LABELS[o.status]}  <b>${o.orderNumber}</b>  ${o.customerName}`,
    );
    await ctx.replyWithHTML(`<b>Buyurtmalar</b> (${orders.length})\n\n` + lines.join('\n'));
  }

  @Action('admin_stats')
  async onAdminStats(@Ctx() ctx: Context) {
    if (!this.isAdmin(ctx.from.id)) return ctx.answerCbQuery();
    await ctx.answerCbQuery();

    const stats = await this.ordersService.getStats();
    const users = await this.usersService.count();

    await ctx.replyWithHTML(
      `<b>Statistika</b>\n\n` +
      `Foydalanuvchilar: <b>${users}</b>\n\n` +
      `Kutilmoqda: <b>${stats.pending}</b>\n` +
      `Tasdiqlangan: <b>${stats.confirmed}</b>\n` +
      `Yo'lda: <b>${stats.shipped}</b>\n` +
      `Yetkazilgan: <b>${stats.delivered}</b>\n` +
      `Bekor: <b>${stats.cancelled}</b>\n` +
      `Jami: <b>${stats.total}</b>\n\n` +
      `Daromad: <b>${stats.revenue.toLocaleString()} so'm</b>`,
    );
  }

  // /addpromo KOD FOIZ|MIQDOR [max_uses] — masalan: /addpromo SALE20 20 100
  @Command('addpromo')
  async onAddPromo(@Ctx() ctx: Context) {
    if (!this.isAdmin(ctx.from.id)) return;
    const text = (ctx.message as any)?.text as string;
    const parts = text.split(/\s+/).slice(1);
    if (parts.length < 2) {
      await ctx.replyWithHTML(
        `<b>Foydalanish:</b>\n` +
        `/addpromo KOD QIYMAT [max_uses]\n\n` +
        `QIYMAT: foiz (masalan <code>20</code>) yoki so'm (masalan <code>10000s</code>)\n` +
        `Misol: <code>/addpromo SALE20 20 100</code>\n` +
        `Misol: <code>/addpromo VIP5000 5000s</code>`,
      );
      return;
    }

    const code = parts[0].toUpperCase();
    const valueStr = parts[1];
    const maxUses = parts[2] ? parseInt(parts[2], 10) : null;

    const isFixed = valueStr.endsWith('s') || valueStr.endsWith('S');
    const value = parseInt(valueStr.replace(/[sS]$/, ''), 10);

    if (isNaN(value) || value <= 0) {
      await ctx.reply('Noto\'g\'ri qiymat. Foiz yoki so\'m kiriting (masalan: 20 yoki 5000s)');
      return;
    }

    try {
      const promo = await this.promoService.create({
        code,
        discountType: isFixed ? DiscountType.FIXED : DiscountType.PERCENT,
        discountValue: value,
        maxUses: isNaN(maxUses) ? null : maxUses,
      });

      const typeLabel = isFixed ? `${value.toLocaleString()} so'm` : `${value}%`;
      await ctx.replyWithHTML(
        `✅ Promokod yaratildi!\n\n` +
        `Kod: <code>${promo.code}</code>\n` +
        `Chegirma: <b>${typeLabel}</b>\n` +
        `Limit: ${maxUses ? maxUses + ' ta' : 'cheksiz'}`,
      );
    } catch {
      await ctx.reply('Xatolik: bu kod allaqachon mavjud bo\'lishi mumkin.');
    }
  }

  @Command('promos')
  async onPromos(@Ctx() ctx: Context) {
    if (!this.isAdmin(ctx.from.id)) return;
    const promos = await this.promoService.findAll();
    if (!promos.length) { await ctx.reply('Promokodlar yo\'q.'); return; }

    const lines = promos.map((p) => {
      const typeLabel = p.discountType === DiscountType.FIXED
        ? `${p.discountValue.toLocaleString()} so'm`
        : `${p.discountValue}%`;
      const status = p.isActive ? '✅' : '❌';
      const uses = p.maxUses ? `${p.usedCount}/${p.maxUses}` : `${p.usedCount}/∞`;
      return `${status} <code>${p.code}</code>  ${typeLabel}  [${uses}]`;
    });

    await ctx.replyWithHTML(`<b>Promokodlar</b>\n\n` + lines.join('\n'));
  }

  @Command('delpromo')
  async onDelPromo(@Ctx() ctx: Context) {
    if (!this.isAdmin(ctx.from.id)) return;
    const text = (ctx.message as any)?.text as string;
    const code = text.split(/\s+/)[1]?.toUpperCase();
    if (!code) { await ctx.reply('Foydalanish: /delpromo KOD'); return; }

    const promos = await this.promoService.findAll();
    const promo = promos.find((p) => p.code === code);
    if (!promo) { await ctx.reply(`"${code}" promokod topilmadi.`); return; }

    await this.promoService.delete(promo.id);
    await ctx.reply(`"${code}" o'chirildi.`);
  }

  @Action(/^admin_(confirm|cancel|ship|deliver)_(\d+)$/)
  async onAdminAction(@Ctx() ctx: Context) {
    if (!this.isAdmin(ctx.from.id)) return;

    const data = (ctx as any).callbackQuery?.data as string;
    const match = data.match(/^admin_(confirm|cancel|ship|deliver)_(\d+)$/);
    if (!match) return;

    const statusMap: Record<string, OrderStatus> = {
      confirm: OrderStatus.CONFIRMED,
      cancel: OrderStatus.CANCELLED,
      ship: OrderStatus.SHIPPED,
      deliver: OrderStatus.DELIVERED,
    };

    const order = await this.ordersService.updateStatus(
      parseInt(match[2], 10),
      statusMap[match[1]],
    );

    await ctx.answerCbQuery(`${STATUS_LABELS[order.status]}`);
    await ctx.editMessageText(
      `<b>${order.orderNumber}</b>  ·  ${STATUS_LABELS[order.status]}\n` +
      `${order.customerName}  ·  ${order.customerPhone}`,
      {
        parse_mode: 'HTML',
        reply_markup: adminOrderKeyboard(order.id, order.status).reply_markup,
      },
    );

    // Mijozga xabar yuborish
    if (order.telegramId) {
      const msgs: Partial<Record<OrderStatus, string>> = {
        [OrderStatus.CONFIRMED]:
          `✓ <b>Buyurtmangiz tasdiqlandi</b>\n\nRaqam: <code>${order.orderNumber}</code>\n\nQadoqlanmoqda, tez orada kuryer bog'lanadi.`,
        [OrderStatus.SHIPPED]:
          `<b>Buyurtmangiz yo'lda!</b>\n\nRaqam: <code>${order.orderNumber}</code>\n\nKuryer tez orada siz bilan bog'lanadi.\nTo'lov — naqd pul, yetkazib berganda.`,
        [OrderStatus.DELIVERED]:
          `✓ <b>Buyurtmangiz yetkazildi!</b>\n\nRaqam: <code>${order.orderNumber}</code>\n\nINTIZOM daftarni yoqtirishingizni umid qilamiz. 📔`,
        [OrderStatus.CANCELLED]:
          `<b>Buyurtmangiz bekor qilindi.</b>\n\nRaqam: <code>${order.orderNumber}</code>\n\nSavollar bo'lsa, bot orqali murojaat qiling.`,
      };
      const msg = msgs[order.status];
      if (msg) {
        try {
          await this.bot.telegram.sendMessage(order.telegramId, msg, { parse_mode: 'HTML' });
        } catch {}
      }
    }
  }
}
