import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { NotificationsService } from '../notifications/notifications.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    const order = await this.ordersService.create(dto);
    await this.notificationsService.notifyAdminsNewOrder(order);
    return order;
  }

  @Get('track/:orderNumber')
  async track(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }
}
