import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedProduct();
  }

  private async seedProduct() {
    const existing = await this.productsRepository.count();
    if (existing > 0) return;

    const price = this.configService.get<number>('product.price') || 49000;

    await this.productsRepository.save({
      name: 'INTIZOM Daftar',
      description: `INTIZOM — bu oddiy bloknot emas, balki maqsadga erishish va kundalik hayotni tartiblash uchun mo'ljallangan tizimli daftar.

Daftar dunyodagi eng kuchli produktivlik metodlaridan kelib chiqib tuzilgan:
• Shaxsga asoslangan odatlar (Atomic Habits)
• "Nima uchun" sababi (Start With Why)
• Eyzenxauer matritsasi
• Hayot sohalari muvozanati
• Kundalik mulohaza

"Intizom — bu kayfiyatga qarab emas, qarorga qarab yashash."`,
      price,
      isAvailable: true,
    });
  }

  async findMain(): Promise<Product | null> {
    return this.productsRepository.findOne({ where: { isAvailable: true } });
  }

  async findById(id: number): Promise<Product | null> {
    return this.productsRepository.findOne({ where: { id } });
  }

  async incrementSoldCount(id: number, quantity: number) {
    await this.productsRepository.increment({ id }, 'soldCount', quantity);
  }

  async updatePrice(price: number): Promise<Product> {
    const product = await this.findMain();
    product.price = price;
    return this.productsRepository.save(product);
  }
}
