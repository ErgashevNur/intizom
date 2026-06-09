import { Injectable, OnApplicationBootstrap, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '../orders/entities/order.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService implements OnApplicationBootstrap {
  private adminUsername: string;
  private adminPasswordHash: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly ordersService: OrdersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async onApplicationBootstrap() {
    this.adminUsername = this.configService.get<string>('admin.username');
    const plainPassword = this.configService.get<string>('admin.password');
    this.adminPasswordHash = await bcrypt.hash(plainPassword, 10);
  }

  async login(username: string, password: string) {
    if (username !== this.adminUsername) {
      throw new UnauthorizedException('Username yoki parol noto\'g\'ri');
    }
    const isMatch = await bcrypt.compare(password, this.adminPasswordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Username yoki parol noto\'g\'ri');
    }
    const token = this.jwtService.sign({ sub: 'admin', username });
    return { accessToken: token, username };
  }

  async getOrders(status?: string) {
    return this.ordersService.findAll(status as OrderStatus);
  }

  async getOrderById(id: number) {
    return this.ordersService.findById(id);
  }

  async updateOrderStatus(id: number, dto: UpdateOrderStatusDto) {
    const updated = await this.ordersService.updateStatus(id, dto.status, dto.adminNote);
    await this.notificationsService.notifyCustomerStatusChange(updated);
    return updated;
  }

  async getStats() {
    return this.ordersService.getStats();
  }
}
