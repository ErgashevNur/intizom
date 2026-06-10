import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsNumber()
  telegramId?: number;

  @IsNotEmpty()
  @IsString()
  customerName: string;

  @IsNotEmpty()
  @IsString()
  customerPhone: string;

  @IsNotEmpty()
  @IsString()
  region: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsNumber()
  @Min(1)
  @Max(50)
  quantity: number;

  @IsOptional()
  @IsNumber()
  productId?: number;

  @IsOptional()
  @IsString()
  promoCode?: string;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;
}
