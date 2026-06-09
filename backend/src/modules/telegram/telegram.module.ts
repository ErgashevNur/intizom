import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramUpdate } from './telegram.update';
import { OrderWizard } from './scenes/order.wizard';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PromoModule } from '../promo/promo.module';

@Module({
  imports: [OrdersModule, UsersModule, NotificationsModule, PromoModule],
  providers: [TelegramUpdate, OrderWizard],
})
export class TelegramModule {}
