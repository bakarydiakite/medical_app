import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Endpoint de santé — utilisé par Docker/reverse proxy pour vérifier que l'API est en ligne. */
  @Get('health')
  healthCheck(): object {
    return this.appService.getHealth();
  }
}
