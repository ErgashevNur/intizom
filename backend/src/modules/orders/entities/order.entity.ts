import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  orderNumber: string;

  @ManyToOne(() => User, (user) => user.orders, { nullable: true })
  user: User;

  @Column({ nullable: true, type: 'bigint' })
  telegramId: number;

  @ManyToOne(() => Product, (product) => product.orders)
  product: Product;

  @Column()
  customerName: string;

  @Column()
  customerPhone: string;

  @Column()
  region: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'int' })
  totalPrice: number;

  @Column({ nullable: true, type: 'varchar' })
  promoCode: string | null;

  @Column({ nullable: true, type: 'int' })
  discountAmount: number | null;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ nullable: true, type: 'text' })
  adminNote: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
