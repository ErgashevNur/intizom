import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { LoginDto } from './dto/login.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('auth/login')
  async login(@Body() dto: LoginDto) {
    return this.adminService.login(dto.username, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('orders')
  async getOrders(@Query('status') status?: string) {
    return this.adminService.getOrders(status);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('orders/:id')
  async getOrder(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getOrderById(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('orders/:id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.adminService.updateOrderStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('product')
  async getProduct() {
    return this.adminService.getProduct();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('product/price')
  async updateProductPrice(@Body('price') price: number) {
    if (!price || price < 1000 || price > 10_000_000) {
      throw new BadRequestException('Narx 1 000 dan 10 000 000 gacha bo\'lishi kerak');
    }
    return this.adminService.updateProductPrice(price);
  }
}
