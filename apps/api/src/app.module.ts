import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth.controller';
import { BenefitsService } from './benefits.service';
import { ZusController } from './zus.controller';

@Module({
  imports: [],
  controllers: [AppController, AuthController, ZusController],
  providers: [AppService, BenefitsService],
})
export class AppModule {}
