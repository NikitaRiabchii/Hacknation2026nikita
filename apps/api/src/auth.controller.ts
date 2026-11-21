import { Body, Controller, Post } from '@nestjs/common';

@Controller('api/auth')
export class AuthController {
  @Post('login') login(@Body() dto: any) {
    return { accessToken: 'mock-mobywatel-jwt', user: { name: dto.name ?? 'Anna Kowalska', verified: true, provider: 'mObywatel (mock)' } };
  }
}
