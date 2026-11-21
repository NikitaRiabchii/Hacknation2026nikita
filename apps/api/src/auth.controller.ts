import { Body, Controller, Post } from '@nestjs/common';
import type { LoginRequest } from './dto';

@Controller('api/auth')
export class AuthController {
  @Post('login') login(@Body() dto: LoginRequest) {
    return { accessToken: 'mock-mobywatel-jwt', user: { name: dto.name ?? 'Anna Kowalska', verified: true, provider: 'mObywatel (mock)' } };
  }
}
