import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findOrCreate(telegramUser: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  }): Promise<User> {
    let user = await this.usersRepository.findOne({
      where: { telegramId: telegramUser.id },
    });

    if (!user) {
      user = this.usersRepository.create({
        telegramId: telegramUser.id,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        username: telegramUser.username,
        languageCode: telegramUser.language_code,
      });
      await this.usersRepository.save(user);
    }

    return user;
  }

  async findById(telegramId: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { telegramId } });
  }

  async count(): Promise<number> {
    return this.usersRepository.count();
  }
}
