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

  @Column({ nullable: true })
  telegramId: number;

  @ManyToOne(() => Product, (product) => product.orders)
  product: Product;

  @Column()
  customerName: string;

  @Column()
  customerPhone: string;

  @Column()
  region: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'int' })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ nullable: true, type: 'text' })
  adminNote: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true, type: 'text' })
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
