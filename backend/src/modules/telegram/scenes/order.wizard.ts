import { Action, Ctx, Message, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { Injectable } from '@nestjs/common';
import { WizardContext } from 'telegraf/typings/scenes';
import { OrdersService } from '../../orders/orders.service';
import { UsersService } from '../../users/users.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { PromoService } from '../../promo/promo.service';
import { ORDER_WIZARD_ID } from '../telegram.constants';
import {
  confirmOrderKeyboard,
  phoneKeyboard,
  quantityKeyboard,
  regionsKeyboard,
  removeKeyboard,
  skipKeyboard,
} from '../keyboards/keyboards';

const PRICE = 49000;

interface OrderState {
  name?: string;
  phone?: string;
  region?: string;
  address?: string;
  quantity: number;
  promoCode?: string;
  discountAmount?: number;
  promoId?: number;
}

type Ctx_ = WizardContext & {
  wizard: WizardContext['wizard'] & { state: OrderState };
  from: { id: number; first_name?: string; last_name?: string };
  message?: any;
  update: any;
};

const step = (n: number) => `<b>Buyurtma berish</b>  ·  ${n} / 6`;

@Injectable()
@Wizard(ORDER_WIZARD_ID)
export class OrderWizard {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly promoService: PromoService,
  ) {}

  // ─── Step 1: Ism ─────────────────────────────────────────────────
  @WizardStep(1)
  async onEnter(@Ctx() ctx: Ctx_) {
    ctx.wizard.state.quantity = 1;

    const tgName = [ctx.from.first_name, ctx.from.last_name]
      .filter(Boolean)
      .join(' ');

    if (tgName) {
      ctx.wizard.state.name = tgName;
      await ctx.replyWithHTML(
        `${step(1)}\n\n` +
        `Ismingiz: <b>${tgName}</b>\n\n` +
        `To'g'rimi?`,
        confirmOrderKeyboard(),
      );
      ctx.wizard.next();
    } else {
      await ctx.replyWithHTML(`${step(1)}\n\nTo'liq ismingizni kiriting:`);
      ctx.wizard.selectStep(2);
    }
  }

  // ─── Step 2: Ism tasdiqlash yoki kiritish ────────────────────────
  @WizardStep(2)
  async onName(@Ctx() ctx: Ctx_) {
    const cbData = ctx.update?.callback_query?.data;

    if (cbData === 'confirm_order') {
      await ctx.answerCbQuery();
      await ctx.replyWithHTML(
        `${step(2)}\n\nTelefon raqamingizni yuboring:`,
        phoneKeyboard(),
      );
      ctx.wizard.next();
      return;
    }

    if (cbData === 'cancel_order') {
      await ctx.answerCbQuery();
      return this.cancel(ctx);
    }

    const text = ctx.message?.text;
    if (!text || text.startsWith('/')) { return; }
    if (text.trim().length < 2) {
      await ctx.reply('Kamida 2 ta harf kiriting:');
      return;
    }
    ctx.wizard.state.name = text.trim();
    await ctx.replyWithHTML(
      `${step(2)}\n\nTelefon raqamingizni yuboring:`,
      phoneKeyboard(),
    );
    ctx.wizard.next();
  }

  // ─── Step 3: Telefon ─────────────────────────────────────────────
  @WizardStep(3)
  async onPhone(@Ctx() ctx: Ctx_) {
    let phone: string | undefined;

    if (ctx.message?.contact) {
      phone = ctx.message.contact.phone_number;
      if (!phone.startsWith('+')) phone = '+' + phone;
    } else if (ctx.message?.text) {
      const t = ctx.message.text.replace(/\s/g, '');
      if (t.startsWith('/')) return;
      if (!/^\+?[0-9]{9,13}$/.test(t)) {
        await ctx.reply('Noto\'g\'ri format. Qayta kiriting yoki tugmadan foydalaning:');
        return;
      }
      phone = t;
    } else {
      return;
    }

    ctx.wizard.state.phone = phone;
    await ctx.reply('✓ Saqlandi.', removeKeyboard());
    await ctx.replyWithHTML(
      `${step(3)}\n\nViloyatingizni tanlang:`,
      regionsKeyboard(),
    );
    ctx.wizard.next();
  }

  // ─── Step 4: Viloyat ─────────────────────────────────────────────
  @WizardStep(4)
  async onRegion(@Ctx() ctx: Ctx_) {
    const data = ctx.update?.callback_query?.data;
    if (!data) return;

    if (data === 'cancel_order') { await ctx.answerCbQuery(); return this.cancel(ctx); }
    if (!data.startsWith('region_')) { await ctx.answerCbQuery(); return; }

    const region = data.replace('region_', '');
    ctx.wizard.state.region = region;
    await ctx.answerCbQuery();

    await ctx.replyWithHTML(
      `${step(4)}\n\n<b>${region}</b> tanlandi.\n\nAniq manzilingizni yozing:\n<i>Ko'cha, uy raqami, mo'ljal</i>`,
    );
    ctx.wizard.next();
  }

  // ─── Step 5: Manzil ──────────────────────────────────────────────
  @WizardStep(5)
  async onAddress(@Ctx() ctx: Ctx_) {
    const text = ctx.message?.text;
    if (!text || text.startsWith('/')) return;
    if (text.trim().length < 3) { await ctx.reply('Aniqroq manzil kiriting:'); return; }

    ctx.wizard.state.address = text.trim();

    await ctx.replyWithHTML(
      `${step(5)}\n\n🎟 Promokodingiz bormi?\n\n` +
      `Agar promokod bo'lsa — yozing.\n` +
      `Yo'q bo'lsa — pastdagi tugmani bosing.`,
      skipKeyboard('O\'tkazib yuborish →'),
    );
    ctx.wizard.next();
  }

  // ─── Step 6: Promokod ────────────────────────────────────────────
  @WizardStep(6)
  async onPromo(@Ctx() ctx: Ctx_) {
    const cbData = ctx.update?.callback_query?.data;

    if (cbData === 'skip_promo') {
      await ctx.answerCbQuery();
      await this.sendQuantityStep(ctx);
      ctx.wizard.next();
      return;
    }

    if (cbData === 'cancel_order') {
      await ctx.answerCbQuery();
      return this.cancel(ctx);
    }

    const text = ctx.message?.text;
    if (!text || text.startsWith('/')) return;

    const totalBase = PRICE * ctx.wizard.state.quantity;
    const result = await this.promoService.validate(text.trim(), totalBase);

    if (!result.valid) {
      await ctx.replyWithHTML(
        `❌ ${result.errorMessage}\n\nQayta kiriting yoki o'tkazib yuboring:`,
        skipKeyboard('O\'tkazib yuborish →'),
      );
      return;
    }

    ctx.wizard.state.promoCode = result.promoCode.code;
    ctx.wizard.state.discountAmount = result.discountAmount;
    ctx.wizard.state.promoId = result.promoCode.id;

    await ctx.replyWithHTML(
      `✅ Promokod qabul qilindi!\n\n` +
      `Chegirma: <b>${result.discountAmount.toLocaleString()} so'm</b>`,
    );

    await this.sendQuantityStep(ctx);
    ctx.wizard.next();
  }

  // ─── Step 7: Miqdor va tasdiqlash ────────────────────────────────
  @WizardStep(7)
  async onQuantity(@Ctx() ctx: Ctx_) {
    const data = ctx.update?.callback_query?.data;
    if (!data) return;

    if (data === 'cancel_order') { await ctx.answerCbQuery(); return this.cancel(ctx); }

    if (data === 'qty_minus') {
      ctx.wizard.state.quantity = Math.max(1, ctx.wizard.state.quantity - 1);
      await ctx.answerCbQuery();
      await ctx.editMessageReplyMarkup(
        quantityKeyboard(ctx.wizard.state.quantity, PRICE, ctx.wizard.state.discountAmount).reply_markup as any,
      );
      return;
    }

    if (data === 'qty_plus') {
      ctx.wizard.state.quantity = Math.min(10, ctx.wizard.state.quantity + 1);
      await ctx.answerCbQuery();
      await ctx.editMessageReplyMarkup(
        quantityKeyboard(ctx.wizard.state.quantity, PRICE, ctx.wizard.state.discountAmount).reply_markup as any,
      );
      return;
    }

    if (data === 'qty_noop') { await ctx.answerCbQuery(); return; }

    if (data === 'qty_confirm') {
      await ctx.answerCbQuery();
      await this.sendSummary(ctx);
      ctx.wizard.next();
    }
  }

  // ─── Step 8: Yakuniy tasdiqlash ───────────────────────────────────
  @WizardStep(8)
  async onConfirm(@Ctx() ctx: Ctx_) {
    const data = ctx.update?.callback_query?.data;
    await ctx.answerCbQuery();

    if (data === 'cancel_order') return this.cancel(ctx);

    if (data === 'confirm_order') {
      const s = ctx.wizard.state;
      try {
        const totalBase = PRICE * s.quantity;
        const discount = s.promoCode ? s.discountAmount ?? 0 : 0;

        const order = await this.ordersService.create({
          telegramId: ctx.from.id,
          customerName: s.name,
          customerPhone: s.phone,
          region: s.region,
          address: s.address,
          quantity: s.quantity,
          promoCode: s.promoCode,
          discountAmount: discount > 0 ? discount : undefined,
        });

        if (s.promoId) {
          await this.promoService.incrementUsage(s.promoId);
        }

        await this.notificationsService.notifyAdminsNewOrder(order);

        const finalPrice = totalBase - discount;
        await ctx.replyWithHTML(
          `✅ <b>Buyurtmangiz qabul qilindi!</b>\n\n` +
          `Raqam: <code>${order.orderNumber}</code>\n` +
          (s.promoCode ? `Promokod: <code>${s.promoCode}</code>  (−${discount.toLocaleString()} so'm)\n` : '') +
          `To'lov: <b>${finalPrice.toLocaleString()} so'm</b>\n\n` +
          `Tez orada operatorimiz siz bilan bog'lanadi.\n` +
          `To'lov — yetkazib berganda, naqd pul.`,
        );
      } catch {
        await ctx.reply('Xatolik yuz berdi. /start bosib qayta urinib ko\'ring.');
      }
      await ctx.scene.leave();
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────
  private async sendQuantityStep(ctx: Ctx_) {
    const qty = ctx.wizard.state.quantity;
    const discount = ctx.wizard.state.discountAmount;
    await ctx.replyWithHTML(
      `${step(6)}\n\nNechta daftar kerak?`,
      quantityKeyboard(qty, PRICE, discount),
    );
  }

  private async sendSummary(ctx: Ctx_) {
    const s = ctx.wizard.state;
    const basePrice = s.quantity * PRICE;
    const discount = s.promoCode ? (s.discountAmount ?? 0) : 0;
    const finalPrice = basePrice - discount;

    const promoLine = s.promoCode
      ? `\nPromokod: <code>${s.promoCode}</code>  (−${discount.toLocaleString()} so'm)` : '';

    await ctx.replyWithHTML(
      `<b>Buyurtma ma'lumotlari</b>\n\n` +
      `Ism: ${s.name}\n` +
      `Tel: ${s.phone}\n` +
      `Viloyat: ${s.region}\n` +
      `Manzil: ${s.address}\n` +
      `Miqdor: ${s.quantity} ta\n` +
      `Narx: ${basePrice.toLocaleString()} so'm` +
      promoLine + `\n` +
      `<b>Jami: ${finalPrice.toLocaleString()} so'm</b>\n\n` +
      `To'lov — yetkazib berganda, naqd pul.\n\n` +
      `Tasdiqlaysizmi?`,
      confirmOrderKeyboard(),
    );
  }

  private async cancel(ctx: Ctx_) {
    await ctx.reply('Buyurtma bekor qilindi.');
    await ctx.scene.leave();
  }
}
