import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscountType, PromoCode } from './entities/promo-code.entity';

export interface ApplyResult {
  valid: boolean;
  promoCode?: PromoCode;
  discountAmount?: number;
  finalPrice?: number;
  errorMessage?: string;
}

@Injectable()
export class PromoService {
  constructor(
    @InjectRepository(PromoCode)
    private readonly promoRepo: Repository<PromoCode>,
  ) {}

  async validate(code: string, originalPrice: number): Promise<ApplyResult> {
    const promo = await this.promoRepo.findOne({
      where: { code: code.toUpperCase(), isActive: true },
    });

    if (!promo) {
      return { valid: false, errorMessage: `"${code}" promokod topilmadi yoki faol emas.` };
    }

    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return { valid: false, errorMessage: 'Promokod muddati tugagan.' };
    }

    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      return { valid: false, errorMessage: 'Promokoddan foydalanish limiti tugagan.' };
    }

    const discountAmount =
      promo.discountType === DiscountType.PERCENT
        ? Math.round((originalPrice * promo.discountValue) / 100)
        : Math.min(promo.discountValue, originalPrice);

    return {
      valid: true,
      promoCode: promo,
      discountAmount,
      finalPrice: originalPrice - discountAmount,
    };
  }

  async incrementUsage(promoId: number) {
    await this.promoRepo.increment({ id: promoId }, 'usedCount', 1);
  }

  async create(data: {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    maxUses?: number | null;
    expiresAt?: Date | null;
  }): Promise<PromoCode> {
    const promo = this.promoRepo.create({
      ...data,
      code: data.code.toUpperCase(),
    });
    return this.promoRepo.save(promo);
  }

  async findAll(): Promise<PromoCode[]> {
    return this.promoRepo.find({ order: { createdAt: 'DESC' } });
  }

  async toggleActive(id: number): Promise<PromoCode> {
    const promo = await this.promoRepo.findOne({ where: { id } });
    if (!promo) throw new NotFoundException('Promokod topilmadi');
    promo.isActive = !promo.isActive;
    return this.promoRepo.save(promo);
  }

  async delete(id: number): Promise<void> {
    await this.promoRepo.delete(id);
  }
}
