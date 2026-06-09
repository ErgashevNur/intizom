import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly productsService: ProductsService,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const product = dto.productId
      ? await this.productsService.findById(dto.productId)
      : await this.productsService.findMain();

    if (!product) throw new NotFoundException('Mahsulot topilmadi');

    const orderCount = await this.ordersRepository.count();
    const orderNumber = `INT-${String(orderCount + 1).padStart(6, '0')}`;

    const basePrice = product.price * dto.quantity;
    const discount = dto.discountAmount ?? 0;

    const order = this.ordersRepository.create({
      orderNumber,
      telegramId: dto.telegramId,
      product,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      region: dto.region,
      address: dto.address,
      quantity: dto.quantity,
      totalPrice: basePrice - discount,
      promoCode: dto.promoCode ?? null,
      discountAmount: discount > 0 ? discount : null,
      status: OrderStatus.PENDING,
    });

    const saved = await this.ordersRepository.save(order);
    await this.productsService.incrementSoldCount(product.id, dto.quantity);
    return saved;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.ordersRepository.findOne({
      where: { orderNumber },
      relations: ['product'],
    });
  }

  async findAll(status?: OrderStatus): Promise<Order[]> {
    const query = this.ordersRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.product', 'product')
      .orderBy('order.createdAt', 'DESC');

    if (status) {
      query.where('order.status = :status', { status });
    }

    return query.getMany();
  }

  async findById(id: number): Promise<Order | null> {
    return this.ordersRepository.findOne({
      where: { id },
      relations: ['product'],
    });
  }

  async updateStatus(id: number, status: OrderStatus, adminNote?: string): Promise<Order> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('Buyurtma topilmadi');

    order.status = status;
    if (adminNote !== undefined) order.adminNote = adminNote;

    return this.ordersRepository.save(order);
  }

  async getStats() {
    const total = await this.ordersRepository.count();
    const pending = await this.ordersRepository.count({ where: { status: OrderStatus.PENDING } });
    const confirmed = await this.ordersRepository.count({ where: { status: OrderStatus.CONFIRMED } });
    const shipped = await this.ordersRepository.count({ where: { status: OrderStatus.SHIPPED } });
    const delivered = await this.ordersRepository.count({ where: { status: OrderStatus.DELIVERED } });
    const cancelled = await this.ordersRepository.count({ where: { status: OrderStatus.CANCELLED } });

    const revenueResult = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalPrice)', 'total')
      .where('order.status IN (:...statuses)', {
        statuses: [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
      })
      .getRawOne();

    return {
      total,
      pending,
      confirmed,
      shipped,
      delivered,
      cancelled,
      revenue: parseInt(revenueResult?.total || '0', 10),
    };
  }
}
