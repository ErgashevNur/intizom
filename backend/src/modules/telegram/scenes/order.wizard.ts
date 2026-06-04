import { Action, Ctx, Message, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { Injectable } from '@nestjs/common';
import { WizardContext } from 'telegraf/typings/scenes';
import { OrdersService } from '../../orders/orders.service';
import { UsersService } from '../../users/users.service';
import { ORDER_WIZARD_ID } from '../telegram.constants';
import { confirmOrderKeyboard, regionsKeyboard } from '../keyboards/keyboards';

interface OrderState {
  name?: string;
  phone?: string;
  region?: string;
  address?: string;
  quantity?: number;
}

type OrderWizardContext = WizardContext & {
  wizard: WizardContext['wizard'] & { state: OrderState };
  from: { id: number; first_name?: string };
  message?: { text?: string };
  update: any;
};

@Injectable()
@Wizard(ORDER_WIZARD_ID)
export class OrderWizard {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
  ) {}

  @WizardStep(1)
  async onEnter(@Ctx() ctx: OrderWizardContext) {
    await ctx.replyWithHTML(
      '📝 <b>Buyurtma berish</b>\n\n' +
      'Bekor qilish uchun /cancel yozing.\n\n' +
      '👤 To\'liq ismingizni kiriting:',
    );
    ctx.wizard.next();
  }

  @WizardStep(2)
  @On('text')
  async onName(@Ctx() ctx: OrderWizardContext, @Message('text') text: string) {
    if (text === '/cancel') return this.cancel(ctx);
    if (!text || text.trim().length < 2) {
      await ctx.reply('❌ Ism kamida 2 ta harf bo\'lishi kerak. Qayta kiriting:');
      return;
    }
    ctx.wizard.state.name = text.trim();
    await ctx.reply('📞 Telefon raqamingizni kiriting:\n(+998901234567 formatida)');
    ctx.wizard.next();
  }

  @WizardStep(3)
  @On('text')
  async onPhone(@Ctx() ctx: OrderWizardContext, @Message('text') text: string) {
    if (text === '/cancel') return this.cancel(ctx);
    const phone = text.trim().replace(/\s/g, '');
    if (!/^\+?[0-9]{9,13}$/.test(phone)) {
      await ctx.reply('❌ Telefon raqam noto\'g\'ri.\nMasalan: +998901234567\n\nQayta kiriting:');
      return;
    }
    ctx.wizard.state.phone = phone;
    await ctx.reply('🗺️ Viloyatingizni tanlang:', regionsKeyboard());
    ctx.wizard.next();
  }

  @WizardStep(4)
  @On('callback_query')
  async onRegion(@Ctx() ctx: OrderWizardContext) {
    const data: string = ctx.update?.callback_query?.data;
    if (!data) return;

    if (data === 'cancel_order') return this.cancel(ctx);

    if (!data.startsWith('region_')) {
      await ctx.answerCbQuery('Viloyatni tanlang');
      return;
    }

    const region = data.replace('region_', '');
    ctx.wizard.state.region = region;
    await ctx.answerCbQuery();
    await ctx.replyWithHTML(`✅ <b>${region}</b> tanlandi.\n\n📍 Aniq manzilingizni kiriting:\n(Ko'cha, uy raqami)`);
    ctx.wizard.next();
  }

  @WizardStep(5)
  @On('text')
  async onAddress(@Ctx() ctx: OrderWizardContext, @Message('text') text: string) {
    if (text === '/cancel') return this.cancel(ctx);
    if (!text || text.trim().length < 5) {
      await ctx.reply('❌ Manzil kamida 5 ta belgi bo\'lishi kerak. Qayta kiriting:');
      return;
    }
    ctx.wizard.state.address = text.trim();
    await ctx.reply('📦 Nechta daftar buyurtma qilasiz?\n(1 dan 10 tagacha)');
    ctx.wizard.next();
  }

  @WizardStep(6)
  @On('text')
  async onQuantity(@Ctx() ctx: OrderWizardContext, @Message('text') text: string) {
    if (text === '/cancel') return this.cancel(ctx);
    const qty = parseInt(text.trim(), 10);
    if (isNaN(qty) || qty < 1 || qty > 10) {
      await ctx.reply('❌ 1 dan 10 gacha son kiriting:');
      return;
    }
    ctx.wizard.state.quantity = qty;

    const state = ctx.wizard.state;
    const pricePerItem = 49000;
    const total = qty * pricePerItem;

    const summary =
      `📋 <b>Buyurtma ma'lumotlari:</b>\n\n` +
      `👤 Ism: ${state.name}\n` +
      `📞 Tel: ${state.phone}\n` +
      `🗺️ Viloyat: ${state.region}\n` +
      `📍 Manzil: ${state.address}\n` +
      `📦 Miqdor: ${qty} ta\n` +
      `💰 Narx: ${pricePerItem.toLocaleString()} so'm/ta\n` +
      `💵 <b>Jami: ${total.toLocaleString()} so'm</b>\n\n` +
      `To'lov yetkazib berganda naqd pul orqali amalga oshiriladi.\n\n` +
      `Tasdiqlaysizmi?`;

    await ctx.replyWithHTML(summary, confirmOrderKeyboard());
    ctx.wizard.next();
  }

  @WizardStep(7)
  @On('callback_query')
  async onConfirm(@Ctx() ctx: OrderWizardContext) {
    const data: string = ctx.update?.callback_query?.data;
    await ctx.answerCbQuery();

    if (data === 'cancel_order') return this.cancel(ctx);

    if (data === 'confirm_order') {
      const state = ctx.wizard.state;

      try {
        const order = await this.ordersService.create({
          telegramId: ctx.from.id,
          customerName: state.name,
          customerPhone: state.phone,
          region: state.region,
          address: state.address,
          quantity: state.quantity,
        });

        await ctx.replyWithHTML(
          `✅ <b>Buyurtmangiz qabul qilindi!</b>\n\n` +
          `📋 Buyurtma raqami: <code>${order.orderNumber}</code>\n\n` +
          `Tez orada operatorimiz siz bilan bog\'lanadi.\n` +
          `Bizga ishonganingiz uchun rahmat! 🙏\n\n` +
          `Buyurtma holatini kuzatish uchun raqamingizni saqlab qo\'ying.`,
        );
      } catch {
        await ctx.reply('❌ Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.');
      }

      await ctx.scene.leave();
    }
  }

  private async cancel(ctx: OrderWizardContext) {
    await ctx.reply('❌ Buyurtma bekor qilindi.');
    await ctx.scene.leave();
  }
}
